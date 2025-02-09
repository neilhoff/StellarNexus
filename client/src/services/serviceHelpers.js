// import store from 'src/store/index'
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
function handleError (error, serviceErrorObj) {
  console.log(error, error.response)
  let errorMessage
  if (error.response && error.response.data && error.response.data.message) {
    errorMessage = `${error.response.status} - ${error.response.data.message}`
  } else if (error.response) {
    errorMessage = `${error.response.status} - ${error.response.statusText}`
  } else {
    errorMessage = `${error.code} - ${error.message}`
  }
  console.log('ERROR MESSAGE', errorMessage, typeof errorMessage)
  throw new ServiceHelpers.ServiceException(
    serviceErrorObj.title,
    `<div style="font-size: 1.1rem; font-weight: bold;">${serviceErrorObj.description}</div>
      <div style="font-size: .7rem; margin-bottom: 5px;">${new Date()}</div>
      ${errorMessage.substring(0, 500)}`,
    errorMessage
  )
}
async function postToApi (url, params, serviceErrorObj) {
  // const token = await store().dispatch('auth/getToken')
  try {
    // axios.defaults.withCredentials = true
    const response = await axios.post(url, { ...params }, {
      withCredentials: true
      // headers: {
      //   // authorization: 'Bearer ' + token.accessToken
      // }
    })
    console.log('response', response)
    console.log('response headers', response.headers)
    // Error Checking
    if (typeof response.data === 'string' && response.data.startsWith('<h1>Timeout Error</h1>')) {
      timeoutError(response.data, 'Timeout Error')
    }
    return response.data
  } catch (error) {
    handleError(error, serviceErrorObj)
  }
}

async function getFromApi (url, params, serviceErrorObj) {
  // const token = await store().dispatch('auth/getToken')
  try {
    const response = await axios.get(url, {
      withCredentials: true,
      // headers: {
      //   authorization: 'Bearer ' + token.accessToken
      // },
      params: {
        params
      }
    })
    // Error Checking
    if (typeof response.data === 'string' && response.data.startsWith('<h1>Timeout Error</h1>')) {
      timeoutError(response.data, 'Please Try a smaller date range')
    }
    return response.data
  } catch (error) {
    handleError(error, serviceErrorObj)
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
  postToApi,
  getFromApi,
  sortDateString
}

export { ServiceHelpers }
