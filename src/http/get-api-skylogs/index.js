const arc = require('@architect/functions')
const { sortKeyFromDate } = require('@architect/shared/dateTime')
const authenticate = require('@architect/shared/authenticate')
const qs = require('qs')

async function getSkyLogs (req, context) {
  if (req.skyAuth.adminAccess) {
    let data = await arc.tables()
    const params = qs.parse(req.query)
    const dateRange = params.dateRange
    const skylogType = params.skylogType

    const start = new Date(dateRange.start)
    const startYear = start.getFullYear()
    const endDate = new Date(dateRange.end)
    // endDate time is set to 00:00:00 so all of that day's items will be missed
    // We need to calculate the endDate + 1 day to include that day
    const day = 60 * 60 * 24 * 1000 // seconds * minutes * hours * milliseconds = 1 day 
    const end = new Date(endDate.getTime() + day)
    const endYear = end.getFullYear()

    const dayNum = {
      start: sortKeyFromDate(startYear, start),
      end: sortKeyFromDate(endYear, end)
    }

    const yearsInQuery = [startYear, endYear]
    const uniqYears = [...new Set(yearsInQuery)]
    const result = []
    for (year of uniqYears) {
      const queryParams = getQueryParams(`${year}-${skylogType}`, dayNum)
      const queryResult = await data.skylogs.query(queryParams)
      result.push(...queryResult.Items)
    }

    return {
      cors: true,
      body: JSON.stringify(result),
      headers: {
        'cache-control': 'no-cache'
      },
      statusCode: 200
    }

  } else {
    return {
      cors: true,
      statusCode: 403,
      body: 'You do not have access to this API'
    }
  }
}

function getQueryParams (pk, dateNum) {
  return {
    KeyConditionExpression: `pk = :pk and sk between :start and :end`,
    ExpressionAttributeValues: {
      ':pk': pk,
      ':start': dateNum.start,
      ':end': dateNum.end
    }
  }
}

exports.handler = arc.http(async req => authenticate(req), getSkyLogs)