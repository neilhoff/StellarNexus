import formatHelper from 'src/services/formatHelpers.js'
const config = {
  errorlogColumns: [
    {
      name: 'timeStamp',
      label: 'Created',
      field: 'timeStamp',
      format: (item) => {
        return formatHelper.formatDateString(item, { formatStr: 'P pp' }).formattedVal
      },
      align: 'left',
      sortable: true
    },
    {
      name: 'userName',
      label: 'User',
      field: 'userName',
      align: 'left',
      sortable: true
    },
    {
      name: 'correlationId',
      label: 'Correlation Id',
      field: 'correlationId',
      align: 'left',
      sortable: true
    },
    {
      name: 'side',
      label: 'Side',
      field: 'side',
      align: 'left',
      sortable: true
    },
    {
      name: 'errorName',
      label: 'Error Name',
      field: 'errorName',
      align: 'left',
      sortable: true
    },
    {
      name: 'errorMessage',
      label: 'Error Message',
      field: 'errorMessage',
      align: 'left',
      sortable: true
    },
    {
      name: 'errorLocation',
      label: 'Error Location',
      field: 'errorLocation',
      align: 'left',
      sortable: true
    },
  ]
}

export default config
