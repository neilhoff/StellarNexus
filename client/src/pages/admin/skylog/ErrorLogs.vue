<template>
  <q-page class="q-pa-sm">
    <page-header title="Error Logs" />
    <skylog-date-input
      class="row q-gutter-sm q-mb-md"
      :dates="dateParams"
      @update-dates="getErrors"
    />
    <q-list bordered>
      <q-item class="bg-grey-8 text-white text-bold">
        <q-item-section class="col-1">Time</q-item-section>
        <q-item-section class="col-2">Url</q-item-section>
        <q-item-section>Error</q-item-section>
        <q-item-section class="col-2">User</q-item-section>
        <q-item-section class="col-1">Browser</q-item-section>
      </q-item>
      <q-item v-if="loading">
        <div
          class="spinner"
          data-cy="error-table-spinner"
        >
          <q-spinner
            color="primary"
            size="3em"
            :thickness="10"
          />
        </div>
      </q-item>
      <q-item v-if="!loading && errorCount === 0">
        <div class="col items-center no-errors row">
          <div class="col">
            There were no errors in the selected time frame.
          </div>
        </div>
      </q-item>
      <div v-if="!loading">
        <div
          v-for="item of errors"
          :key="item.sk"
        >
          <q-item-label class="q-pa-xs text-h6">
            <div class="text-center text-bold">
              {{ formatHeadingDate(item.dateOfErrors) }}
            </div>
          </q-item-label>
          <q-item
            clickable
            ripple
            v-for="error of item.errors"
            :key="error.created"
            @click="showError(error)"
          >
            <q-item-section
              class="col-1"
              data-cy="error-time"
            >{{ formatTime(error.created) }}</q-item-section>
            <q-item-section
              class="col-2 ellipsis"
              data-cy="error-location-url"
            >{{ error.url }}</q-item-section>
            <q-item-section
              class="ellipsis"
              data-cy="error-message"
            >
              {{ error.errorObj.error.message }}
              <q-tooltip
                :delay="1000"
                :offset="[0, 10]"
              >
                <template v-slot>
                  <div class="error-tooltip">
                    {{ error.errorObj.error.message }}
                  </div>
                </template>
              </q-tooltip>
            </q-item-section>
            <q-item-section
              class="col-2 ellipsis"
              data-cy="error-display-name"
            >{{ error.displayName }}</q-item-section>
            <q-item-section
              class="col-1 ellipsis"
              data-cy="error-browser"
            >{{ error.userAgent.browser.name }}</q-item-section>
          </q-item>
        </div>
      </div>
    </q-list>

    <q-dialog
      full-height
      v-model="showErrorDetails"
      @show="highlightJS()"
    >
      <q-card
        style="width: 1080px; max-width: 80vw;"
        data-cy="error-dialog-popup"
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Error Details</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1">
            {{ date.formatDate(selectedError.created, 'M-D-YYYY') }} -
            <span
              class="text-negative"
              v-if="selectedError.errorObj"
            >{{ selectedError.errorObj.error.message }}</span>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <pre class="q-my-none">
            <code class="language-json hljs">
              {{ errorDetails }}
            </code>
          </pre>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import SkylogDateInput from './components/SkylogDateInputs'
import PageHeader from 'src/components/PageHeader'
import { date } from 'quasar'
import skylogService from 'src/services/admin/skylog/getSkylogs'
import hljs from 'highlight.js'

export default defineComponent({
  name: 'ErrorLogs',
  components: {
    PageHeader,
    SkylogDateInput
  },
  setup () {
    const errors = ref([])
    const loading = ref(false)
    const now = new Date()
    const dateParams = ref({
      start: date.formatDate(date.subtractFromDate(now, { days: 20 }), 'MM/DD/YYYY'),
      end: date.formatDate(now, 'MM/DD/YYYY')
    })
    const showErrorDetails = ref(false)
    const errorDetails = ref({})
    const selectedError = ref()
    const errorCount = ref(0)

    function sortByDate (arr, direction, sortParam) {
      const arrCopy = JSON.parse(JSON.stringify(arr))
      return arrCopy.sort((a, b) => {
        if (direction === 'desc') return new Date(b[sortParam]).getTime() - new Date(a[sortParam]).getTime()
        else return new Date(a[sortParam]).getTime() - new Date(b[sortParam]).getTime()
      })
    }

    async function getErrors (dates) {
      loading.value = true
      let sortedErrors = []
      try {
        let count = 0
        const items = await skylogService.getErrors(dates)
        console.log(items)
        // Sort header by descending date
        sortedErrors = sortByDate(items, 'desc', 'sk')
        // Sort error times descending
        for (const item of sortedErrors) {
          item.errors = sortByDate(item.errors, 'desc', 'created')
          count = count + item.errors.length
        }
        // This is used to determine if we show the "No errors" text
        errorCount.value = count
        errors.value = sortedErrors
      } finally {
        loading.value = false
      }
    }

    function showError (error) {
      showErrorDetails.value = true
      errorDetails.value = JSON.stringify(error, null, 2)
      selectedError.value = error
    }

    function highlightJS () {
      // This needs to run after the dialog is shown
      hljs.highlightAll()
    }

    function formatHeadingDate (dateString) {
      // For some reason using new Date(dateString) returns the previous day
      // So we need to use Date(dateString) to format it correctly
      return date.formatDate(`${dateString}T00:00:00`, 'M-D-YYYY')
    }

    function formatTime (dateString) {
      return date.formatDate(dateString, 'h:mm a')
    }

    onMounted(() => {
      getErrors(dateParams.value)
    })

    return {
      errors,
      errorCount,
      showErrorDetails,
      loading,
      dateParams,
      errorDetails,
      selectedError,
      date,
      getErrors,
      showError,
      highlightJS,
      formatHeadingDate,
      formatTime
    }
  }
})
</script>
<style lang="scss" scoped>
.error-tooltip {
  font-size: 0.8rem;
}

.spinner {
  margin: 0 auto;
  width: 3rem;
}

.no-errors {
  color: gray;
  height: 200px;
  text-align: center;
}
</style>
