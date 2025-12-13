<template>
  <q-page>
    <page-header title="Stellar Tracks Error Log" />
    <div class="row">
      <default-form
        class="col-8"
        leftColumnTitle="Date Range"
        @onSubmit="getStellarErrorLog"
        rightColumnTitle=""
        :showForm="showForm"
        @setShowForm="setShowForm"
      >
        <template v-slot:left>
          <start-end-date-inputs :modelValue="dateRange" />
        </template>
      </default-form>
    </div>
    <div
      class="q-mt-md"
      v-if="tableShow"
    >
      <h3 class="q-mb-none q-pb-none">
        Error Report for {{ searchedDateRange.dateStart }} to {{
          searchedDateRange.dateEnd
        }}
      </h3>
      <chart-row :charts="charts" />
    </div>
    <default-table
      class="q-mt-md q-mb-lg"
      data-cy="error-log-table"
      :enableColumnFilters="true"
      :firstColNoTitle="true"
      :nonFilteredTableRows="nonFilteredTableRows"
      row-key="timeStamp"
      :tableName="tableTitle"
      :tableColumns="tableColumns"
      :tableRows="tableRows"
      :tableShow="tableShow"
      @updateRows="setTableRows"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              @click="props.expand = !props.expand"
              dense
              flat
              :icon="props.expand ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
              round
              size="xs"
            />
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div v-if="col.name === 'errorLocation'">
              {{ parseErrorLocation(props.row.errorStack) }}
            </div>
            <div v-else>
              {{ col.value }}
            </div>
          </q-td>
        </q-tr>
        <q-tr
          v-show="props.expand"
          :props="props"
        >
          <q-td colspan="100%">
            <div class="row q-mb-md">
              <div class="col">
                <div v-if="props.row.errorStack">
                  <div class="text-h4">Stack Trace</div>
                  <!-- <pre class="hljs"> -->
                  <code
                    class="hljs"
                    v-html="props.row.errorStack"
                  ></code>
                  <!-- </pre> -->

                </div>
                <div v-if="props.row.side === 'client'">
                  <div class="text-h4">Client Context</div>
                  <!-- <pre class="hljs"> -->
                  <code
                    class="hljs"
                    v-html="highlightJson(props.row)"
                  ></code>
                  <!-- </pre> -->
                </div>
                <div v-if="props.row.side === 'server' && props.row.context">
                  <div class="text-h4">Server Context</div>
                  <pre class="hljs">
                  <code
                    class="hljs"
                    v-html="highlightJson(props.row.context)"
                  ></code>
                  </pre>
                </div>

              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
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

import 'highlight.js/styles/vs2015.css'
import hljs from 'highlight.js'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

export default defineComponent({
  name: 'StellarErrorLog',
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

    const { showSpinner, tableRows, nonFilteredTableRows, tableColumns, tableShow, setTableRows } = defaultTableSetup()

    const searchedDateRange = ref({ dateStart: '', dateEnd: '' })
    const tableTitle = ref()
    const charts = ref()
    async function getStellarErrorLog () {
      showSpinner.value = true
      tableShow.value = false
      try {
        const response = await stellarTracksService.getAnalytics({ trackType: 'error', ...dateRange.value })
        if (response.tracks.length > 0) {
          tableTitle.value = 'Error Log'

          // Setup the columns for the table
          tableColumns.value = [...response.columns]

          // Setup the table
          searchedDateRange.value = { ...dateRange.value }
          const rows = response.tracks.map(item => {
            const errorData = { ...item.errorData }
            if (item.errorData.stack) {
              errorData.stack = hljs.highlight(item.errorData.stack, { language: 'javascript' }).value
            }

            return errorData
          })
          nonFilteredTableRows.value = rows
          setTableRows(rows)
          charts.value = [
            {
              type: 'byDay',
              title: 'Errors by Day',
              data: response.summaryByDay
            }
          ]

          // Hide the form and show the data
          setShowForm(false)
          tableShow.value = true

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

    function parseErrorLocation (stackTrace) {
      if (!stackTrace) return
      // Normalise – some stacks arrive as objects (e.g. from trackError)
      const stack = typeof stackTrace === 'object'
        ? JSON.stringify(stackTrace)
        : String(stackTrace)

      // Regex to find lines that look like:
      // at <function> (<filename>:<line>:<column>)
      // This is a common format for Vite/Webpack stack traces.
      const stackLineRegex = /at\s+.+?\((.+?):(\d+):\d+\)/

      // Split the stack trace into individual lines
      const lines = stack.split('\n')
      for (const line of lines) {
        // Try to match the regex against each line
        const match = line.match(stackLineRegex)

        if (match) {
          let filename = match[1]
          const lineNumber = match[2]

          // Skip node_modules / vite cache / quasar chunks
          if (
            filename.includes('node_modules') ||
            filename.includes('.q-cache') ||
            filename.includes('chunk-')
          ) {
            continue
          }

          // Remove protocol + domain + port (e.g., http://localhost:9000)
          filename = filename.replace(/^https?:\/\/[^/]+/, '')

          // Remove leading slash if present
          filename = filename.replace(/^\/+/, '')

          // Remove query parameters (?t=123, ?v=abc, etc.)
          filename = filename.split('?')[0]

          return `${filename} at line ${lineNumber}`
        }
      }
    }

    function highlightJson (obj) {
      try {
        const jsonStr = JSON.stringify(obj, null, 2)
        return hljs.highlight(jsonStr, { language: 'json' }).value
      } catch (e) {
        console.log(e)
        // Fallback if object can't be stringified
        return hljs.highlight(String(obj), { language: 'plaintext' }).value
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
      tableTitle,
      tableShow,
      charts,
      getStellarErrorLog,
      parseErrorLocation,
      highlightJson
    }
  }
})
</script>

<style lang="scss" scoped>
.hljs {
  background: #1e1e1e !important;
  border-radius: 8px;
  color: #d4d4d4;
  display: block;
  font-size: 0.9em;
  overflow-x: auto;
  padding: 16px !important;
  line-height: 1.5;
  white-space: pre-wrap;
  /* Preserves formatting but wraps long lines */
  word-break: break-all;
}
</style>
