import { ServiceHelpers } from 'src/services/serviceHelpers'
import config from './getStellarTracksConfig.js'

const stellarTracksService = {
  async getAnalytics (params) {
    const serviceErrorObj = {
      title: 'StellarTracksService: getAnalytics Error',
      description: 'Error getting data from the api'
    }

    const tableInfo = {}

    if (params.trackType === 'error') {
      tableInfo.columns = [...config.errorlogColumns]
    }

    return ServiceHelpers.getFromApi(`${process.env.ARC_API_URL}/stellar-tracks`, params, tableInfo, serviceErrorObj)
  },
  async getPageViews (params) {
    const serviceErrorObj = {
      title: 'GetPageViewsAxiosError',
      description: 'Error getting data from the api'
    }
    const tableInfo = {
    }
    params ? params.trackType = 'pageView' : {}
    return ServiceHelpers.getFromApi(`${process.env.ARC_API_URL}/stellar-tracks`, params, tableInfo, serviceErrorObj)
  }
}

export { stellarTracksService }
