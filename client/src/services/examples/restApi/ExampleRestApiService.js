import { ServiceHelpers } from 'src/services/serviceHelpers'

const exampleRestApiService = {
  async getRestApi (params) {
    const serviceErrorObj = {
      title: 'GetCallApiAxiosError',
      description: 'Error getting data from the api'
    }
    const tableInfo = {
    }
    return ServiceHelpers.getFromApi(`${process.env.API_URL}/call-api`, params, tableInfo, serviceErrorObj)
  }
}

export { exampleRestApiService }
