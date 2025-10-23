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
      <div class="charts row">
        <div class="col">
          <h2>Page Views</h2>
          <canvas ref="pageViewsCanvas"></canvas>
        </div>

      </div>

      <!-- <div v-if="tableShow">
      <default-table
        :nonFilteredTableRows="nonFilteredTableRows"
        :row-key="rowKey"
        :showSpinner="showSpinner"
        :tableColumns="columns"
        :tableRows="rows"
        :tableShow="tableShow"
        @updateRows="setTableRows"
      >
        <template v-slot:header-cell="props">
          <q-th class="text-left">

            {{ props.col.label }}
            <q-chip
              class="col"
              clickable
              :color="props.col.formatType ? 'accent' : ''"
              :label="props.col.formatType ? props.col.formatType.name : 'Type'"
              size="sm"
              :text-color="props.col.formatType ? 'white' : ''"
            >
              <q-menu
                v-model="columnTypeMenu[props.col.label]"
                auto-close
                anchor="bottom right"
                self="top right"
              >
                <q-list dense>
                  <q-item
                    @click="updateColumnFormat(props.col, type)"
                    clickable
                    :key="type"
                    v-close-popup
                    v-for="type of columnTypeOptions"
                  >
                    <q-item-section>{{ type.name }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-chip>
          </q-th>

        </template>
        <template v-slot:body-cell="props">
          <q-td :props="props">
            <div
              v-html="displayWithColumnFormat(props.col, props.value)"
              v-if="props.col.formatType?.name"
            ></div>
            <div v-else>{{ props.value }}</div>
          </q-td>
        </template>
      </default-table>
    </div> -->
    </div>

  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import PageHeader from 'src/components/PageHeader.vue'
// import DefaultTable from 'components/table/DefaultTable.vue'
import DefaultForm from 'src/components/form/DefaultForm.vue'
import StartEndDateInputs from 'src/components/form/StartEndDateInputs.vue'
import formatHelper from 'src/services/formatHelpers.js'
import { stellarTracksService } from 'src/services/protected/stellarTracks/getStellarTracksService.js'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'StellarAnalytics',
  components: {
    DefaultForm,
    // DefaultTable,
    StartEndDateInputs,
    PageHeader
  },
  setup () {
    const showSpinner = ref(false)
    const tableShow = ref(false)
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
          }
        }
      })
    }

    async function getStellarAnalytics () {
      // tableShow.value = false
      showSpinner.value = true
      try {
        const response = await stellarTracksService.getPageViews({ dateRange: { ...dateRange } })
        console.log(response)
        setPageViewChart(response.summary.urls)

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
      tableShow,
      pageViewsCanvas,
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
