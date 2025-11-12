import { ServiceHelpers } from 'src/services/serviceHelpers'

const stellarTracksService = {
  async getAnalytics (params) {
    const serviceErrorObj = {
      title: 'StellarTracksService: getAnalytics Error',
      description: 'Error getting data from the api'
    }
    return ServiceHelpers.getFromApi(`${process.env.ARC_API_URL}/stellar-tracks`, params, {}, serviceErrorObj)
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
