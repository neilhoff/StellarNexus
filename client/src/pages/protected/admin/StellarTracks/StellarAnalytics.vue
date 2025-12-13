<template>
  <q-page>
    <page-header title="Stellar Tracks Analytics" />
    <div class="row">
      <default-form
        class="col-8"
        leftColumnTitle="Date Range"
        @onSubmit="getStellarAnalytics"
        rightColumnTitle=""
        :showForm="showForm"
        @setShowForm="setShowForm"
      >
        <template v-slot:left>
          <start-end-date-inputs :modelValue="dateRange" />
          <q-radio
            :label="type.label"
            :key="type.val"
            :val="type.val"
            v-for="type of trackTypeOptions"
            v-model="trackType"
          />
        </template>
      </default-form>
    </div>
    <div
      class="q-mt-md"
      v-if="showAnalytics"
    >
      <h3 class="q-mb-none q-pb-none">
        Analytics Report for {{ searchedDateRange.dateStart }} to {{
          searchedDateRange.dateEnd
        }}
      </h3>
      <chart-row :charts="charts" />
    </div>
    <default-table
      class="q-mt-md q-mb-lg"
      data-cy="tracks-table"
      :nonFilteredTableRows="nonFilteredTableRows"
      row-key=""
      :tableName="tableTitle"
      :tableColumns="tableColumns"
      :tableRows="tableRows"
      @updateRows="setTableRows"
      :tableShow="showAnalytics"
    >
    </default-table>
    <q-inner-loading :showing="showSpinner">
      <default-spinner />
    </q-inner-loading>
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
import { defaultTableSetup } from 'components/table/defaultTableSetup.js'
import DefaultSpinner from 'src/components/DefaultSpinner.vue'
import { Notify } from 'quasar'
import ChartRow from './components/ChartRow.vue'

export default defineComponent({
  name: 'StellarAnalytics',
  components: {
    DefaultForm,
    DefaultSpinner,
    DefaultTable,
    StartEndDateInputs,
    PageHeader,
    ChartRow
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

    const { showSpinner, tableRows, nonFilteredTableRows, tableColumns, setTableRows } = defaultTableSetup()
    function generateTableColumns (data, options = { format: {}, sort: {} }) {
      // Data must be an array of objects
      // Available Options:
      //  objectKey: is used if you want the keys from a 2nd level object
      //  betterLabel: true/false is used to convert to keys to better looking labels
      //  keysToTheTop: array of columns you want moved to the top of the array
      //     - keysToTheTop: ['column1', 'column5', 'column3']
      //  format: Object of column names to format function for value display:
      //     - format: { column1: (val) => `${val}%`, column2: ... }
      //  sort: Object of column names to sort function
      //     - sort: { column1: (a,b) => parsInt(a) - parseInt(b) }

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
        })

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
      // Get the keys (columns) for the first item
      let keys = options.objectKey ? Object.keys(data[0][options.objectKey]) : Object.keys(data[0])
      // Go through the entire array to see if there are any other keys
      for (const item of data) {
        const k = options.objectKey ? Object.keys(item[options.objectKey]) : options.objectKey.keys(item)
        keys = [...new Set([...keys, ...k])]
      }

      if (options.keysToTheTop) {
        for (const key of options.keysToTheTop.reverse()) {
          const index = keys.findIndex((id) => id === key)
          if (index !== -1) {
            const keyToMove = keys.splice(index, 1)
            keys.unshift(keyToMove[0])
          }
        }
      }

      // Setup the columns
      const columns = keys.map(key => {
        return {
          name: key,
          label: options.betterLabel ? getBetterLabel(key) : key,
          field: key,
          align: 'left',
          format: options.format[key],
          sortable: true,
          sort: options.sort[key]
        }
      })
      console.log(columns)
      return columns
    }

    const trackType = ref('pageView')
    const trackTypeOptions = [
      {
        label: 'Page Views',
        val: 'pageView'
      },
      {
        label: 'Clicks',
        val: 'click'
      }
    ]
    const searchedDateRange = ref({ dateStart: '', dateEnd: '' })
    const showAnalytics = ref(false)
    const tableTitle = ref()
    const charts = ref()
    async function getStellarAnalytics () {
      showSpinner.value = true
      showAnalytics.value = false
      try {
        const response = await stellarTracksService.getAnalytics({ trackType: trackType.value, ...dateRange.value })
        console.log(response)
        if (response.tracks.length > 0) {
          // Set the table title
          const chosenTrackType = trackTypeOptions.find(t => t.val === trackType.value)
          tableTitle.value = chosenTrackType.label

          if (trackType.value === 'pageView') {
            charts.value = [
              {
                type: 'byDay',
                title: 'Views by Day',
                data: response.summaryByDay
              },
              {
                type: 'pageViews',
                data: response.summary.urls
              },
              {
                type: 'userViews',
                data: response.summary.userNames
              }
            ]
          } else if (trackType.value === 'click') {
            charts.value = [
              {
                type: 'clickView',
                data: response.summary.clickedItems
              }
              // {
              //   type: '',
              //   data:
              // },
              // {
              //   type: '',
              //   data:
              // }
            ]
          }

          // Setup the columns for the table
          tableColumns.value = generateTableColumns(response.tracks, {
            objectKey: 'trackData',
            betterLabel: true,
            keysToTheTop: ['dataCy', 'url', 'urlQuery', 'fromUrl', 'fromUrlQuery'],
            format: {
              urlQuery: (val) => JSON.stringify(val)
            },
            sort: {
              urlQuery: (a, b) => a.toString().toLowerCase().localeCompare(b.toString().toLowerCase())
            }
          })

          // Setup the table
          searchedDateRange.value = { ...dateRange.value }
          const rows = response.tracks.map(item => item.trackData)
          setTableRows(rows)

          // Hide the form and show the data
          setShowForm(false)
          showAnalytics.value = true

        } else {
          Notify.create({
            message: 'No items were returned.',
            color: 'warning'
          })
        }

      } finally {
        showSpinner.value = false
      }
    }

    return {
      showForm,
      setShowForm,
      dateRange,
      showSpinner,

      nonFilteredTableRows,
      tableRows,
      tableColumns,
      setTableRows,

      searchedDateRange,
      trackType,
      trackTypeOptions,
      tableTitle,
      showAnalytics,
      // chartData,
      charts,
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
