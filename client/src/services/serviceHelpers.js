import axios from 'axios'

function ServiceException (status, name, message, stack) {
  this.status = status
  this.name = name
  this.message = message
  this.stack = stack
}

const timeoutError = (stack, extraMessage = '') => {
  throw new ServiceHelpers.ServiceException('TimeOutError', `The server returned a timeout error. ${extraMessage}`, stack)
}

function catchError (error, serviceErrorObj) {
  if (error.name === 'AxiosError') {
    let errorMessage
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data)
    } else {
      errorMessage = error.message
    }
    throw new ServiceHelpers.ServiceException(
      error.status,
      serviceErrorObj.title,
      errorMessage,
      error.response
    )
  } else {
    throw error
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
