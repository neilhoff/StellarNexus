<template>
  <q-page>
    <page-header title="Example REST API Call" />
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
      </template>
    </default-form>
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

  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import PageHeader from 'src/components/PageHeader'
import { exampleRestApiService } from 'src/services/examples/restApi/ExampleRestApiService'
import DefaultTable from 'components/table/DefaultTable'
import DefaultForm from 'src/components/form/DefaultForm'

export default defineComponent({
  name: 'ExampleSAPWebService',
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

    // const nonFilteredSalesReps = ([])
    // const salesReps = ref([])
    // const salesRepsColumns = ref([])

    // function setSalesReps (reps) {
    //   salesReps.value = reps
    // }

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

    function setupTableData (response) {
      nonFilteredTableRows.value = [...response]
      setTableRows(response)
      columns.value = updateColumns(response[0])
      rowKey.value = columns.value[0] ? columns.value[0].field : ''
    }

    async function getApi () {
      tableShow.value = false
      showSpinner.value = true
      try {
        const response = await exampleRestApiService.getRestApi({ ...params.value })
        setupTableData(response)
      } finally {
        setShowForm(false)
        showSpinner.value = false
      }
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
      isImage: (str) => {
        const imageExtensions = /\.(jpeg|jpg|png|gif|bmp)$/i
        return imageExtensions.test(str)
      }
    }
  }
})
</script>
