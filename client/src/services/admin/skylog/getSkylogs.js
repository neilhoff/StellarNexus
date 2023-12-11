import axios from 'axios'
import store from 'src/store/index'
import { ServiceHelpers } from '../../serviceHelpers'

async function getSkyLogs (type, dateRange) {
  try {
    const token = await store().dispatch('auth/getToken')
    const response = await axios.get(`${process.env.API_URL}/skylogs`, {
      headers: {
        authorization: 'Bearer ' + token.accessToken
      },
      params: {
        skylogType: type,
        dateRange
      }
    })
    if (typeof response.data === 'string' && response.data.startsWith('<h1>Timeout Error</h1>')) {
      ServiceHelpers.timeoutError(response.data, 'Please Try a smaller date range')
    }
    return response.data
  } catch (error) {
    throw new ServiceHelpers.ServiceException(
      'GetSkyLogsError',
      'There was an error getting the logs',
      error.response ? error.response.data : error
    )
  }
}
export default {
  getErrors: async (dateRange) => {
    return getSkyLogs('Errors', dateRange)
  },
  getAnalytics: async (dateRange) => {
    return getSkyLogs('Analytics', dateRange)
  }
}
