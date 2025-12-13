import axios from 'axios'
import { useConfigStore } from 'src/stores/configStore.js'
const configStore = useConfigStore()
import { useAuthStore } from 'src/stores/authStore.js'
const authStore = useAuthStore()

async function getFromApi (url, params, tableInfo) {
  // Send the session id and username for tracking errors
  params.sessionId = configStore.stellarTrack.sessionId
  params.userName = authStore.email
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
}

async function postToApi (url, params) {
  // Send the session id and username for tracking errors
  params.sessionId = configStore.stellarTrack.sessionId
  params.userName = authStore.email
  const response = await axios.post(url, { ...params }, {
    headers: {

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
