<template>
  <q-page>
    <page-header title="Stellar Tracks Analytics" />
    <div style="max-width: 1080px;">
      <default-form
        leftColumnTitle="Date Range"
        @onSubmit="getStellarAnalytics"
        rightColumnTitle=""
        :showForm="showForm"
        @setShowForm="setShowForm"
      >
        <template v-slot:left>
          <start-end-date-inputs :modelValue="dateRange" />
          <q-inner-loading :showing="showSpinner">
            <q-spinner
              size="50px"
              color="primary"
            />
          </q-inner-loading>
        </template>
      </default-form>
    </div>
    <div
      class="q-mt-md"
      v-show="trackData.length > 0"
    >
      <q-chip
        color="primary"
        outline
        square
        text-color="white"
      >
        {{ searchedDateRange.dateStart }} to {{ searchedDateRange.dateEnd }}
      </q-chip>
      <div class="charts q-col-gutter-sm q-mt-sm row">
        <div class="col-md-4 col-xs-12">
          <q-card
            bordered
            flat
          >
            <h2 class="q-ml-md">Views by Day</h2>
            <q-card-section>
              <canvas
                class="chart"
                ref="dayViewsCanvas"
              ></canvas>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-md-4 col-xs-12">
          <q-card
            bordered
            flat
          >
            <h2 class="q-ml-md">Page Views</h2>
            <q-card-section>
              <canvas
                class="chart"
                ref="pageViewsCanvas"
              ></canvas>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-md-4 col-xs-12">
          <q-card
            bordered
            flat
          >
            <h2 class="q-ml-md">Users</h2>
            <q-card-section>
              <canvas
                class="chart"
                ref="userViewsCanvas"
              ></canvas>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <default-table
      class="q-mt-md q-mb-lg"
      data-cy="tracks-table"
      :nonFilteredTableRows="nonFilteredTableRows"
      row-key=""
      :showSpinner="showSpinner"
      tableName="Page Views"
      :tableColumns="tableColumns"
      :tableRows="tableRows"
      @updateRows="setTableRows"
      :tableShow="trackData.length > 0"
    >
    </default-table>

  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import PageHeader from 'src/components/PageHeader.vue'
import DefaultTable from 'components/table/DefaultTable.vue'
import DefaultForm from 'src/components/form/DefaultForm.vue'
import StartEndDateInputs from 'src/components/form/StartEndDateInputs.vue'
import formatHelper from 'src/services/formatHelpers.js'
import { stellarTracksService } from 'src/services/protected/stellarTracks/getStellarTracksService.js'
import Chart from 'chart.js/auto'
import { defaultTableSetup } from 'components/table/defaultTableSetup.js'

export default defineComponent({
  name: 'StellarAnalytics',
  components: {
    DefaultForm,
    DefaultTable,
    StartEndDateInputs,
    PageHeader
  },
  setup () {
    const dateOptions = { formatStr: 'M/dd/yyyy' }
    const dateRange = ref({
      dateStart: formatHelper.getFormatted('date', new Date(), { subDays: 7, ...dateOptions }).formattedVal,
      dateEnd: formatHelper.formatDateString(new Date(), dateOptions).formattedVal
    })

    const showForm = ref(true)
    function setShowForm (val) {
      showForm.value = val
    }

    const pageViewChart = ref()
    const pageViewsCanvas = ref()
    function setPageViewChart (data) {
      console.log(data)
      const labels = Object.keys(data)
      const dataValues = labels.map(l => data[l])
      if (pageViewChart.value) {
        pageViewChart.value.destroy()
        pageViewChart.value = null
      }
      console.log('dataValues', dataValues)
      pageViewChart.value = new Chart(pageViewsCanvas.value, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Views',
            data: dataValues,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    const dayViewsChart = ref()
    const dayViewsCanvas = ref()
    function setDayViewsChart (data) {
      const keys = Object.keys(data)
      const labels = keys.map(date => {
        // Convert date from YYYY/MM/DD to MM/DD/YY
        const dateObj = new Date(date)
        return formatHelper.formatDateString(dateObj, { formatStr: 'M/dd/yy' }).formattedVal
      })
      const dataValues = keys.map(l => data[l].total)
      if (dayViewsChart.value) {
        dayViewsChart.value.destroy()
        dayViewsChart.value = null
      }
      dayViewsChart.value = new Chart(dayViewsCanvas.value, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Views',
            fill: true,
            data: dataValues,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    const userViewsChart = ref()
    const userViewsCanvas = ref()
    function setUserViewsChart (data) {
      const labels = Object.keys(data)
      const dataValues = labels.map(l => data[l])
      if (userViewsChart.value) {
        userViewsChart.value.destroy()
        userViewsChart.value = null
      }
      console.log('dataValues', dataValues)
      userViewsChart.value = new Chart(userViewsCanvas.value, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Users',
            data: dataValues,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    const { showSpinner, tableRows, nonFilteredTableRows, tableColumns, setTableRows } = defaultTableSetup()
    function generateTableColumns (data, options = {}) {
      // Data must be an array of objects
      // Available Options:
      //  objectKey: is used if you want the keys from a 2nd level object
      //  betterLabel: true/false is used to convert to keys to better looking labels

      function getBetterLabel (key) {
        // Handle kebab-case (replace hyphens) and snake_case (replace underscores) with spaces
        let result = key.replace(/[-_]/g, " ")

        // Handle camelCase: add space before uppercase letters
        result = result.replace(/([a-z])([A-Z])/g, "$1 $2")

        // Handle PascalCase and all caps: add space before consecutive uppercase followed by uppercase-lowercase
        result = result.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")

        // Handle acronyms (e.g., "XMLParser" -> keep "XML" intact)
        // This is a simple heuristic; adjust as needed for specific acronyms
        result = result.replace(/([A-Z]{2,})(?![a-z])/g, word => {
          return word.split("").join(" ")
        });

        // Convert to title case: capitalize first letter of each word, lowercase the rest
        result = result
          .split(/\s+/) // Split on any number of spaces
          .filter(word => word.length > 0) // Remove empty words
          .map(word => {
            // Handle numbers or special cases
            if (/^[0-9]+$/.test(word)) return word; // Keep numbers as-is
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          })
          .join(" ")

        return result
      }
      // Get the keys for the first item
      let keys = options.objectKey ? Object.keys(data[0][options.objectKey]) : Object.keys(data[0])
      // Go through the entire array to see if there are any other keys
      for (const item of data) {
        const k = options.objectKey ? Object.keys(item[options.objectKey]) : options.objectKey.keys(item)
        keys = [...new Set([...keys, ...k])]
      }
      console.log(keys)
      // Setup the columns
      const columns = keys.map(key => {
        return {
          name: key,
          label: options.betterLabel ? getBetterLabel(key) : key,
          field: key,
          align: 'left',
          sortable: true
        }
      })
      console.log(columns)
      return columns
    }

    const trackData = ref([])
    const searchedDateRange = ref({ dateStart: '', dateEnd: '' })
    async function getStellarAnalytics () {
      // tableShow.value = false
      showSpinner.value = true
      try {
        const response = await stellarTracksService.getPageViews({ dateRange: { ...dateRange } })
        console.log(response)
        trackData.value = response.tracks
        searchedDateRange.value = { ...dateRange.value }

        setPageViewChart(response.summary.urls)
        setDayViewsChart(response.summaryByDay)
        setUserViewsChart(response.summary.userNames)

        tableColumns.value = generateTableColumns(response.tracks, { objectKey: 'trackData', betterLabel: true })
        const rows = trackData.value.map(item => item.trackData)
        setTableRows(rows)
        // baseUrl.value = extractBaseUrl(params.value.url)
        // apiResponse.value = response
        // apiKeys.value = response instanceof Array ? '' : Object.keys(response)
        // let rows
        // if (response[params.value.dataKey]) {
        //   rows = params.value.dataKey ? response[params.value.dataKey] : response
        // } else {
        //   rows = response
        //   incorrectApiKey.value = params.value.dataKey
        // }
        // // console.log(apiResponse.value)
        // // columns.value = updateColumns(rows)
        // rowKey.value = columns.value[0] ? columns.value[0].field : ''
        setShowForm(false)
        // tableShow.value = true
      } finally {
        showSpinner.value = false
      }
    }


    // const columns = ref([])
    // const rows = ref([])
    // const rowKey = ref()
    // const nonFilteredTableRows = ref([])

    // function updateColumns (rows) {

    //   const savedCols = callRestApiStore.columns[baseUrl.value]
    //   console.log(savedCols)
    //   // Get all the keys available and use these as the columns
    //   const cols = [...new Set(rows.flatMap(obj => Object.keys(obj)))]
    //   console.log(cols)

    //   const newColumns = []
    //   columnTypeMenu.value = {}
    //   for (const item of cols) {
    //     const savedCol = savedCols?.find(c => c.name === item)
    //     newColumns.push({
    //       name: item,
    //       label: item,
    //       field: item,
    //       formatType: savedCol ? savedCol.formatType : '',
    //       align: 'left',
    //       sortable: true
    //     })
    //     columnTypeMenu.value[item] = false
    //   }
    //   callRestApiStore.columns[baseUrl.value] = newColumns
    //   return newColumns
    // }

    // function setTableRows (val) {
    //   rows.value = [...val]
    // }

    // function setupTableData (response, key) {
    //   nonFilteredTableRows.value = []
    //   // if the response is a string, object or number, convert it to an array of objects
    //   if (typeof response === 'string' || typeof response === 'number') {
    //     response = response instanceof Number ? response.toString() : response
    //     const rspToObj = {}
    //     rspToObj[key] = response
    //     response = [{ ...rspToObj }]
    //   } else if (response instanceof Object && !(response instanceof Array)) {
    //     response = [{ ...response }]
    //   }
    //   nonFilteredTableRows.value = [...response]
    //   setTableRows(response)
    // }


    // function updateTable (key) {
    //   console.log(apiResponse.value)
    //   const rows = apiResponse.value[key]
    //   setupTableData(rows, key)
    //   // TODO: Update the columns
    // }

    return {
      showForm,
      setShowForm,
      dateRange,
      showSpinner,

      pageViewsCanvas,
      dayViewsCanvas,
      userViewsCanvas,

      nonFilteredTableRows,
      tableRows,
      tableColumns,
      // rowKey,
      setTableRows,

      trackData,
      searchedDateRange,
      // columns,
      // rows,
      // rowKey,
      // nonFilteredTableRows,
      // setTableRows,
      getStellarAnalytics
      // updateTable
    }
  }
})
</script>
<style lang="scss" scoped>
.chart {
  // max-height: 200px;
}
</style>
