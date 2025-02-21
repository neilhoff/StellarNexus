<template>
  <div>
    <q-btn
      class="btn-export-csv q-mr-none"
      @click="exportTable"
      color="primary"
      data-cy="export-csv-button"
      icon-right="archive"
      label="Export to csv"
      no-caps
      outline
      :sky-track-name="skyTrackName"
    />
  </div>
</template>

<script>
import { exportFile, Notify } from 'quasar'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ExportCSV',
  props: {
    columns: {
      type: Array
    },
    rows: {
      type: Array
    },
    skyTrackName: {
      type: String,
      default: 'ExportCSV'
    }
  },
  setup (props) {
    function wrapCsvValue (val, formatFn) {
      let formatted = formatFn !== void 0
        ? formatFn(val)
        : val

      formatted = formatted === void 0 || formatted === null
        ? ''
        : String(formatted)

      formatted = formatted.split('"').join('""')
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`
    }
    function exportTable () {
      // naive encoding to csv format
      const content = [props.columns.map(col => wrapCsvValue(col.label))].concat(
        props.rows.map(row => props.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n')
      const status = exportFile('table-export.csv', content, 'text/csv')
      if (status !== true) {
        Notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    }
    return {
      exportTable
    }
  }
})

</script>
