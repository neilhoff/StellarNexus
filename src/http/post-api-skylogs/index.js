const arc = require('@architect/functions')

const { sortKeyFromDate, getSkyLogDateTimeObj } = require('@architect/shared/dateTime')
const qs = require('qs')

// AWS DynamoDB doesn't allow blank strings without the 'removeUndefinedValues' parameter
// As of 3/27/2023 this is not available in Architect but a request was made to allow the passing of config: https://github.com/architect/functions/issues/542
function blankToNull (params) {
  for (const item in params) {
    if (params[item] === '') {
      params[item] = null
    } else if (params[item] instanceof Object) {
      params[item] = blankToNull(params[item])
    }
  }
  return params
}

async function postSkyLog (req, context) {
  // Notes:
  // Do all date/time calculations here so they are always represented in the same time zone of the AWS server

  const body = arc.http.helpers.bodyParser(req)
  let parsedBody = qs.parse(body)

  let dataObj, dbUpdateParams
  if (parsedBody.skyLogType === 'Error') {
    dataObj = getErrorDataObj(parsedBody)
    dbUpdateParams = getDbUpdateParams(dataObj, 'error')
  } else if (parsedBody.skyLogType === 'Analytics') {
    dataObj = getAnalyticsDataObj(parsedBody)
    dbUpdateParams = getDbUpdateParams(dataObj, 'analytics')
  }

  let result
  let data = await arc.tables()

  try {
    result = await data.skylogs.update(dbUpdateParams)
  }
  catch (error) {
    console.log(error)
    console.log(typeof error)
    console.log(Object.keys(error))
    for (const key of Object.keys(error)) {
      console.log(key, error[key])
    }
    return {
      statusCode: 500,
      body: error
    }
  }
  return {
    body: JSON.stringify(result),
    cors: true,
    statusCode: 200
  }
}

function getDbUpdateParams (dataObj, type) {
  const updateExpression = type === 'error' ? getErrorsUpdateExpression(dataObj) : getAnalyticsUpdateExpression(dataObj)
  return {
    Key: {
      pk: dataObj.pk,
      sk: dataObj.sk
    },
    ...updateExpression
  }
}

function getErrorDataObj (errorObj) {
  const dtObj = getSkyLogDateTimeObj()
  errorObj.created = dtObj.created
  console.log('Error Created', dtObj)
  return {
    pk: `${dtObj.year}-Errors`,
    sk: sortKeyFromDate(dtObj.year, dtObj.todayTimeStamp),
    dateOfErrors: dtObj.formattedDate,
    errors: [
      errorObj
    ]
  }
}

function getErrorsUpdateExpression (dataObj) {
  return {
    UpdateExpression: `set errors = list_append(if_not_exists(errors, :empty), :errors), dateOfErrors = :errors_date`,
    ExpressionAttributeValues: {
      ':errors': dataObj.errors,
      ':empty': [],
      ':errors_date': dataObj.dateOfErrors
    }
  }
}

function getAnalyticsDataObj (analyticsObj) {
  const dtObj = getSkyLogDateTimeObj()
  return {
    pk: `${dtObj.year}-Analytics`,
    sk: sortKeyFromDate(dtObj.year, dtObj.todayTimeStamp),
    dateOfAnalytics: dtObj.formattedDate,
    analytics: [
      analyticsObj
    ]
  }
}

function getAnalyticsUpdateExpression (dataObj) {
  return {
    UpdateExpression: `set analytics = list_append(if_not_exists(analytics, :empty), :analytics), 
                           dateOfAnalytics = :analytics_date, 
                           dayCount = if_not_exists(dayCount, :start) + :increment`,
    ExpressionAttributeValues: {
      ':analytics': dataObj.analytics,
      ':empty': [],
      ':analytics_date': dataObj.dateOfAnalytics,
      ':start': 0,
      ':increment': 1
    }
  }
}

exports.handler = arc.http.async(postSkyLog)