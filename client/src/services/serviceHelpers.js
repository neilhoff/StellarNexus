import axios from 'axios'
import { useConfigStore } from 'src/stores/configStore.js'
import { useAuthStore } from 'src/stores/authStore.js'

function getRequestContext () {
  const configStore = useConfigStore()
  const authStore = useAuthStore()

  return {
    sessionId: configStore?.stellarTrack?.sessionId,
    email: authStore?.email || '',
    authToken: authStore?.idToken || authStore?.accessToken || null
  }
}

async function getFromApi (url, params, tableInfo) {
  const requestParams = params || {}
  const context = getRequestContext()

  // Send the session id and username for tracking errors
  requestParams.sessionId = context.sessionId
  requestParams.userName = context.email

  const response = await axios.get(url, {
    headers: {
      ...(context.authToken ? { Authorization: `Bearer ${context.authToken}` } : {}),
      ...(context.email ? { 'X-User-Email': context.email } : {})
    },
    params: {
      ...requestParams
    }
  })
  // Add Table info
  if (tableInfo) {
    for (const key in tableInfo) {
      response.data[key] = tableInfo[key]
    }
  }
  return response.data
}

async function postToApi (url, params) {
  const requestParams = params || {}
  const context = getRequestContext()

  // Send the session id and username for tracking errors
  requestParams.sessionId = context.sessionId
  requestParams.userName = context.email

  const response = await axios.post(url, { ...requestParams }, {
    headers: {
      ...(context.authToken ? { Authorization: `Bearer ${context.authToken}` } : {}),
      ...(context.email ? { 'X-User-Email': context.email } : {})
    }
  })
  return response.data
}

function sortDateString (a, b) {
  const dateStringA = a === '' || !a ? '1/1/1900, 1:00:00 AM' : a
  const dateStringB = b === '' || !b ? '1/1/1900, 1:00:00 AM' : b
  return new Date(dateStringA) - new Date(dateStringB)
}

const ServiceHelpers = {
  getFromApi,
  postToApi,
  sortDateString
}

export { ServiceHelpers }
