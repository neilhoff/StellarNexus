import { ref } from 'vue'

export function defaultTableSetup () {
  const showSpinner = ref(false)
  const tableShow = ref(false)
  const tableRows = ref([])
  function setTableRows (val) {
    tableRows.value = [...val]
  }
  const nonFilteredTableRows = ref([])
  const tableColumns = ref([])

  return {
    showSpinner,
    tableShow,
    tableRows,
    setTableRows,
    nonFilteredTableRows,
    tableColumns
  }
}
