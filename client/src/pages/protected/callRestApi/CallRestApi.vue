<template>
  <q-page>
    <page-header title="Call a REST API Call" />
    <default-form
      leftColumnTitle="Rest API"
      @onSubmit="getApi"
      rightColumnTitle=""
      :showForm="showForm"
      @setShowForm="setShowForm"
      style="max-width: 1080px;"
    >
      <template v-slot:left>
        <div class="row">
          <q-select
            class="col-1"
            dense
            :options="['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']"
            outlined
            v-model="apiMethod"
          />
          <q-input
            class="col"
            debounce="500"
            dense
            label="URL"
            outlined
            :rules="[val => validateURL(val)]"
            v-model="params.url"
          />
        </div>

        <q-input
          class="q-mb-md"
          dense
          label="Headers"
          outlined
          v-model="params.headers"
        />

        <q-input
          dense
          label="Key holding the data (blank if not needed)"
          outlined
          v-model="params.dataKey"
        />
        <q-inner-loading :showing="showSpinner">
          <q-spinner
            size="50px"
            color="primary"
          />
        </q-inner-loading>
      </template>
    </default-form>
    <div v-if="tableShow">
      <div>
        <h3>Response Keys</h3>
        <q-chip
          @click="updateTable(key)"
          clickable
          :key="key"
          v-for="key in apiKeys"
        >
          {{ key }}
        </q-chip>
        <div v-if="apiKeys.length === 0">
          No Keys
        </div>
      </div>
      <div v-if="incorrectApiKey">
        <q-banner
          class="bg-warning q-mt-md text-white"
          dense
          inline-actions
          rounded
        >
          The key {{ incorrectApiKey }} was not found in the response
          <template v-slot:action>
            <q-btn
              @click="incorrectApiKey = null"
              flat
              label="X"
            />
          </template>
        </q-banner>
      </div>
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
    </div>
  </q-page>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue'
import PageHeader from 'src/components/PageHeader.vue'
import { callRestApiService } from 'src/services/protected/callRestApi/callRestApiService.js'
import DefaultTable from 'components/table/DefaultTable.vue'
import DefaultForm from 'src/components/form/DefaultForm.vue'
import { useCallRestApiStore } from 'src/stores/callRestApiStore.js'
const callRestApiStore = useCallRestApiStore()
// import { formatDate } from 'date-fns'
import formatHelper from 'src/services/formatHelpers.js'

export default defineComponent({
  name: 'CallRestApi',
  components: {
    DefaultForm,
    DefaultTable,
    PageHeader
  },
  setup () {
    const showSpinner = ref(false)
    const tableShow = ref(false)

    // const params = ref({ url: 'https://65577771bd4bcef8b612b3f0.mockapi.io/api/v1/users' })
    // const params = ref({ url: 'https://reqres.in/api/products' })
    const params = ref({ url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd' })
    const apiMethod = ref('GET')
    const showForm = ref(true)
    function setShowForm (val) {
      showForm.value = val
    }

    function validateURL (val) {
      const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+\/?)?(:\d+)?(\/\S*)?$/
      const validUrl = urlPattern.test(val)
      if (!validUrl) {
        return 'Please use a valid url'
      }
    }
    const apiKeys = ref([])
    const apiResponse = ref()
    const incorrectApiKey = ref()
    const baseUrl = ref()
    async function getApi () {
      tableShow.value = false
      showSpinner.value = true
      incorrectApiKey.value = null
      try {
        const response = await callRestApiService.getRestApi({ ...params.value })
        baseUrl.value = extractBaseUrl(params.value.url)
        apiResponse.value = response
        apiKeys.value = response instanceof Array ? '' : Object.keys(response)
        let rows
        if (response[params.value.dataKey]) {
          rows = params.value.dataKey ? response[params.value.dataKey] : response
        } else {
          rows = response
          incorrectApiKey.value = params.value.dataKey
        }
        console.log(apiResponse.value)
        columns.value = updateColumns(rows)
        rowKey.value = columns.value[0] ? columns.value[0].field : ''
        setupTableData(rows)
        setShowForm(false)
        tableShow.value = true
      } finally {
        showSpinner.value = false
      }
    }

    const columns = ref([])
    const rows = ref([])
    const rowKey = ref()
    const nonFilteredTableRows = ref([])

    function extractBaseUrl (str) {
      const urlRegex = /https?:\/\/[^\s?]+/g;
      const match = str.match(urlRegex);
      return match ? match[0] : null;
    }

    function updateColumns (rows) {

      const savedCols = callRestApiStore.columns[baseUrl.value]
      console.log(savedCols)
      // Get all the keys available and use these as the columns
      const cols = [...new Set(rows.flatMap(obj => Object.keys(obj)))]
      console.log(cols)

      const newColumns = []
      columnTypeMenu.value = {}
      for (const item of cols) {
        const savedCol = savedCols?.find(c => c.name === item)
        newColumns.push({
          name: item,
          label: item,
          field: item,
          formatType: savedCol ? savedCol.formatType : '',
          align: 'left',
          sortable: true
        })
        columnTypeMenu.value[item] = false
      }
      callRestApiStore.columns[baseUrl.value] = newColumns
      return newColumns
    }

    const columnTypeMenu = reactive({})
    const columnTypeOptions = [
      {
        name: 'color',
        options: {
          height: '20px',
          width: '20px'
        }
      },
      {
        name: 'date',
        options: {
          formatStr: 'M/dd/yyyy p'
        }
      },
      {
        name: 'image',
        options: {}
      },
      {
        name: 'link',
        options: {}
      },
      {
        name: 'currency',
        options: {
          locale: 'en-US',
          currency: 'USD',
          maxFractionDigits: 0
        }
      },
      {
        name: 'percent',
        options: {
          locale: 'en-us',
          maxFractionDigits: 0
        }
      },
      {
        name: 'clear formatting'
      }
    ]

    function displayWithColumnFormat (col, val) {
      const name = col.formatType.name
      const options = col.formatType.options
      // let formattedVal = val
      const formatObj = formatHelper.getFormatted(name, val, options)
      if (formatObj.statusText !== 'success') {
        console.log(formatObj.statusText)
      }
      return formatObj.formattedVal
    }

    function updateColumnFormat (col, formatType) {
      columns.value = columns.value.map(column => {
        if (col.name === column.name) {
          if (formatType.name === 'clear formatting') {
            column.formatType = ''
            columnTypeMenu[col.label] = ''
          } else {
            column.formatType = formatType
          }
        }
        return column
      })
      callRestApiStore.columns[baseUrl.value] = columns.value
    }
    function setTableRows (val) {
      rows.value = [...val]
    }

    function setupTableData (response, key) {
      nonFilteredTableRows.value = []
      // if the response is a string, object or number, convert it to an array of objects
      if (typeof response === 'string' || typeof response === 'number') {
        response = response instanceof Number ? response.toString() : response
        const rspToObj = {}
        rspToObj[key] = response
        response = [{ ...rspToObj }]
      } else if (response instanceof Object && !(response instanceof Array)) {
        response = [{ ...response }]
      }
      nonFilteredTableRows.value = [...response]
      setTableRows(response)
    }


    function updateTable (key) {
      console.log(apiResponse.value)
      const rows = apiResponse.value[key]
      setupTableData(rows, key)
      // TODO: Update the columns
    }

    return {
      apiMethod,
      params,
      showForm,
      validateURL,
      setShowForm,
      showSpinner,
      tableShow,
      columns,
      rows,
      rowKey,
      nonFilteredTableRows,
      setTableRows,
      getApi,
      apiKeys,
      incorrectApiKey,
      updateTable,
      columnTypeMenu,
      columnTypeOptions,
      displayWithColumnFormat,
      updateColumnFormat
    }
  }
})
</script>
