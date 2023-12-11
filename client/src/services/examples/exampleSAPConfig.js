const exampleConfig = {
  exampleServiceUrl: `${process.env.API_URL}/sap-example`,
  salesRepTableColumns: [
    {
      name: 'label',
      label: 'Name',
      field: 'label',
      align: 'left',
      sortable: true
    },
    {
      name: 'value',
      label: 'Sales Rep Id',
      field: 'value',
      align: 'left',
      sortable: true
    },
    {
      name: 'dealer',
      label: 'Dealer Number',
      field: 'dealer',
      align: 'left',
      sortable: true
    }
  ],
  dealerNumberTableColumns: [
    {
      name: 'dealerNumber',
      label: 'Dealer Number',
      field: 'dealerNumber',
      align: 'left',
      sortable: true
    }
  ]
}

export default exampleConfig
