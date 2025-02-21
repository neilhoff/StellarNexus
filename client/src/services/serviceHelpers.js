import axios from 'axios'

function ServiceException (name, message, stack) {
  this.name = name
  this.message = message
  this.stack = stack
}

const timeoutError = (stack, extraMessage = '') => {
  throw new ServiceHelpers.ServiceException('TimeOutError', `The server returned a timeout error. ${extraMessage}`, stack)
}

function catchError (error, serviceErrorObj) {
  if (error.name === 'TimeOutError') {
    throw error
  } else {
    console.log(error)
    let errorMessage
    if (error.response && error.response.data) {
      if ((Array.isArray(error.response.data) || typeof error.response.data === 'string') && error.response.data.includes('HTTP 401 - Unauthorized')) {
        errorMessage = 'HTTP 401 - Unauthorized: The SAP service account has an issue'
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else {
        errorMessage = error.response.data
      }
    } else {
      errorMessage = error.message
    }
    throw new ServiceHelpers.ServiceException(
      serviceErrorObj.title,
      `<div style="font-size: 1.1rem; font-weight: bold;">${serviceErrorObj.description}</div>
         <div style="font-size: .7rem; margin-bottom: 5px;">${new Date()}</div>
         ${errorMessage.substring(0, 500)}`,
      errorMessage
    )
  }
}

async function getFromApi (url, params, tableInfo, serviceErrorObj) {
  try {
    const response = await axios.get(url, {
      headers: {

      },
      params: {
        ...params
      }
    })
    // Add Table info
    if (tableInfo) {
      for (const key in tableInfo) {
        response.data[key] = tableInfo[key]
      }
    }
    return response.data
  } catch (error) {
    catchError(error, serviceErrorObj)
  }
}

async function postToApi (url, params, serviceErrorObj) {
  try {
    const response = await axios.post(url, { ...params }, {
      headers: {

      }
    })
    return response.data
  } catch (error) {
    catchError(error, serviceErrorObj)
  }
}

function sortDateString (a, b) {
  const dateStringA = a === '' || !a ? '1/1/1900, 1:00:00 AM' : a
  const dateStringB = b === '' || !b ? '1/1/1900, 1:00:00 AM' : b
  return new Date(dateStringA) - new Date(dateStringB)
}

const ServiceHelpers = {
  ServiceException,
  timeoutError,
  getFromApi,
  postToApi,
  sortDateString
}

export { ServiceHelpers }
