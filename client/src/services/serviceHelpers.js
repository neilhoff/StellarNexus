import store from 'src/store/index'
import axios from 'axios'

function ServiceException (name, message, stack) {
  this.name = name
  this.message = message
  this.stack = stack
}

const tokenError = (error) => {
  throw new ServiceException('GetTokenError', error.errorMessage, error.stack)
}

const timeoutError = (stack, extraMessage = '') => {
  throw new ServiceHelpers.ServiceException('TimeOutError', `The server returned a timeout error. ${extraMessage}`, stack)
}

async function getFromApi (url, params, tableInfo, serviceErrorObj) {
  const token = await store().dispatch('auth/getToken')
  try {
    const response = await axios.get(url, {
      headers: {
        authorization: 'Bearer ' + token.accessToken
      },
      params: {
        params
      }
    })
    // Error Checking
    if (typeof response.data === 'string' && response.data.startsWith('<h1>Timeout Error</h1>')) {
      timeoutError(response.data, 'Please Try a smaller date range')
    }
    // Add Table info
    if (tableInfo) {
      if (typeof tableInfo === 'object') {
        for (const key in tableInfo) {
          response.data[key] = tableInfo[key]
        }
      } else { // backwards compatible
        response.data.columns = tableInfo
      }
    }
    return response.data
  } catch (error) {
    if (error.name === 'TimeOutError') {
      throw error
    } else {
      let errorMessage
      if (error.response) {
        if (error.response.data.includes('HTTP 401 - Unauthorized')) {
          errorMessage = 'HTTP 401 - Unauthorized: The SAP service account has an issue'
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
}

function sortDateString (a, b) {
  const dateStringA = a === '' || !a ? '1/1/1900, 1:00:00 AM' : a
  const dateStringB = b === '' || !b ? '1/1/1900, 1:00:00 AM' : b
  return new Date(dateStringA) - new Date(dateStringB)
}

const ServiceHelpers = {
  ServiceException,
  tokenError,
  timeoutError,
  getFromApi,
  sortDateString
}

export { ServiceHelpers }
