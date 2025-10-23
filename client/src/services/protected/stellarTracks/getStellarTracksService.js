import { ServiceHelpers } from 'src/services/serviceHelpers'

const stellarTracksService = {
  async getPageViews (params) {
    const serviceErrorObj = {
      title: 'GetPageViewsAxiosError',
      description: 'Error getting data from the api'
    }
    const tableInfo = {
    }
    params.trackType = 'pageViews'
    return ServiceHelpers.getFromApi(`${process.env.ARC_API_URL}/stellar-tracks`, params, tableInfo, serviceErrorObj)
  }
}

export { stellarTracksService }
