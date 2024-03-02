<template>
  <q-page>
    <page-header title="Example SAP Web Service" />
    <DefaultForm
      leftColumnTitle="Order Details"
      rightColumnTitle="Date Range"
      :showForm="showForm"
      @setShowForm="setShowForm"
    />
    <default-table
      class="q-mb-lg"
      :filterOptions="dealerFilter"
      :nonFilteredTableRows="nonFilteredSalesReps"
      rowKey="value"
      :showSpinner="showSpinner"
      :tableColumns="salesRepsColumns"
      :tableDescription="`Count: ${salesReps ? salesReps.length.toString() : '0'}`"
      tableName="Sales Reps"
      :tableRows="salesReps"
      :tableShow="tableShow"
      @updateRows="setSalesReps"
    >
    </default-table>

  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import PageHeader from 'src/components/PageHeader'
import { exampleSAPService } from 'src/services/examples/ExampleSAPService'
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
    const showForm = ref(true)
    const showSpinner = ref(false)
    const tableShow = ref(false)
    function setShowForm (val) {
      showForm.value = val
    }

    const nonFilteredSalesReps = ([])
    const salesReps = ref([])
    const salesRepsColumns = ref([])

    function setSalesReps (reps) {
      salesReps.value = reps
    }

    const dealerFilter = ref([])
    function setDealerFilter (dealers) {
      dealerFilter.value = dealers.map(dealer => {
        return {
          label: dealer,
          value: dealer,
          fn: (salesReps) => salesReps.filter((rep) => rep.dealer === dealer)
        }
      })
    }

    async function getPartners () {
      tableShow.value = false
      try {
        showSpinner.value = true
        const response = await exampleSAPService.getPartners()
        setDealerFilter(response.dealerNumbers)
        nonFilteredSalesReps.value = [...response.salesReps]
        salesReps.value = [...response.salesReps]
        salesRepsColumns.value = [...response.columns.salesReps]
        tableShow.value = true
      } finally {
        setShowForm(false)
        showSpinner.value = false
      }
    }
    onMounted(async () => {
      await getPartners()
    })
    return {
      showForm,
      setShowForm,
      showSpinner,
      tableShow,
      nonFilteredSalesReps,
      salesReps,
      salesRepsColumns,
      setSalesReps,
      dealerFilter
    }
  }
})
</script>
