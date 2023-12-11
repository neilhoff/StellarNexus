import exampleConfig from './exampleSAPConfig'
import { ServiceHelpers } from '../serviceHelpers'

const exampleSAPService = {
  async getPartners (params) {
    const serviceErrorObj = {
      title: 'GetPartnersAxiosError',
      description: 'Error getting the partners from SAP'
    }
    const tableInfo = {
      columns: {
        salesReps: exampleConfig.salesRepTableColumns,
        dealerNumbers: exampleConfig.dealerNumberTableColumns
      }
    }
    return ServiceHelpers.getFromApi(exampleConfig.exampleServiceUrl, params, tableInfo, serviceErrorObj)
  }
}

export { exampleSAPService }
