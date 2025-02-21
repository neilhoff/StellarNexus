import { ServiceHelpers } from 'src/services/serviceHelpers'

const callRestApiService = {
  async getRestApi (params) {
    const serviceErrorObj = {
      title: 'GetCallApiAxiosError',
      description: 'Error getting data from the api'
    }
    const tableInfo = {
    }
    return ServiceHelpers.getFromApi(`${process.env.ARC_API_URL}/call-api`, params, tableInfo, serviceErrorObj)
  }
}

export { callRestApiService }
