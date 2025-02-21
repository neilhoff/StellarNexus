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
        <q-input
          debounce="500"
          dense
          label="URL"
          outlined
          :rules="[val => validateURL(val)]"
          v-model="params.url"
        />
        <q-input
          dense
          label="Key holding the data (blank if not needed)"
          outlined
          v-model="params.dataKey"
        />
      </template>
    </default-form>
    <div v-if="rows && rows.length > 0">
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
        :tableShow="rows.length > 0"
        @updateRows="setTableRows"
      >
        <template v-slot:body-cell="props">
          <q-td :props="props">
            <div v-if="isImage(props.value)">
              <img
                :src="props.value"
                style="height: 50px;"
              >
            </div>
            <div v-else>
              {{ props.value }}
            </div>
          </q-td>
        </template>
      </default-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import PageHeader from 'src/components/PageHeader.vue'
import { callRestApiService } from 'src/services/protected/callRestApi/callRestApiService.js'
import DefaultTable from 'components/table/DefaultTable.vue'
import DefaultForm from 'src/components/form/DefaultForm.vue'

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

    const params = ref({ url: 'https://65577771bd4bcef8b612b3f0.mockapi.io/api/v1/users' })
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

    const columns = ref([])
    const rows = ref([])
    const rowKey = ref()
    const nonFilteredTableRows = ref([])
    function updateColumns (row) {
      const newColumns = []
      for (const item in row) {
        newColumns.push({
          name: item,
          label: item,
          field: item,
          align: 'left',
          sortable: true
        })
      }
      return newColumns
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
      columns.value = updateColumns(response[0])
      rowKey.value = columns.value[0] ? columns.value[0].field : ''

    }

    const apiKeys = ref([])
    const apiResponse = ref()
    const incorrectApiKey = ref()
    async function getApi () {
      tableShow.value = false
      showSpinner.value = true
      incorrectApiKey.value = null
      try {
        const response = await callRestApiService.getRestApi({ ...params.value })
        apiResponse.value = response
        apiKeys.value = response instanceof Array ? '' : Object.keys(response)
        let rows
        if (response[params.value.dataKey]) {
          rows = params.value.dataKey ? response[params.value.dataKey] : response
        } else {
          rows = response
          incorrectApiKey.value = params.value.dataKey
        }

        setupTableData(rows)
      } finally {
        setShowForm(false)
        showSpinner.value = false
      }
    }
    function updateTable (key) {
      const rows = apiResponse.value[key]
      setupTableData(rows, key)
    }

    return {
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
      isImage: (str) => {
        const imageExtensions = /\.(jpeg|jpg|png|gif|bmp)$/i
        return imageExtensions.test(str)
      }
    }
  }
})
</script>
