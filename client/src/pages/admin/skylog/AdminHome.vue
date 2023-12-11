<template>
  <q-page>
    <page-header title="Admin Dashboard" />
    <h3>Today</h3>
    <div class="row q-gutter-sm q-mb-xl">
      <data-card
        :loading="loading"
        title="Views"
        :value="analyticsCountToday"
        data-cy="views-today"
      />
      <data-card
        bgColorClass="bg-secondary"
        :loading="loading"
        title="Users"
        :value="userCountToday"
        data-cy="users-today"
      />
      <data-card
        bgColorClass="bg-red-8"
        :loading="loading"
        title="Errors"
        :value="errorCountToday"
        data-cy="errors-today"
      />
    </div>
    <h3>Past 7 Days</h3>
    <div class="row q-gutter-sm">
      <data-card
        :loading="loading"
        title="Views"
        :value="analyticsCount"
        data-cy="views-past-7"
      />
      <data-card
        bgColorClass="bg-secondary"
        :loading="loading"
        title="Users"
        :value="userCount"
        data-cy="users-past-7"
      />
      <data-card
        bgColorClass="bg-red-8"
        :loading="loading"
        title="Errors"
        :value="errorCount"
        data-cy="errors-past-7"
      />
    </div>
    <div class="row">
      <analytics-card :loading="loading">
        <views-by-day-chart
          :analytics="analytics"
          :dates="dateParams"
        />
      </analytics-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import DataCard from './components/DataCard'
import ViewsByDayChart from './components/ViewsByDayChart'
import AnalyticsCard from './components/AnalyticsCard'
import PageHeader from 'src/components/PageHeader'

import { date } from 'quasar'
import skylogService from 'src/services/admin/skylog/getSkylogs'

import { sortByDate, defaultDateFormat, getViewsByUser, getViewsByUserByDay } from './analyticsHelpers.js'

export default defineComponent({
  name: 'AdminHome',
  components: {
    AnalyticsCard,
    DataCard,
    PageHeader,
    ViewsByDayChart
  },
  setup () {
    const loading = ref(false)
    const now = new Date()
    const dateParams = ref({
      start: defaultDateFormat(date.subtractFromDate(now, { days: 6 })),
      end: defaultDateFormat(now)
    })
    const analytics = ref([])
    const analyticsCount = ref('')
    const analyticsCountToday = ref('')
    const userCount = ref('')
    const userCountToday = ref('')
    const errors = ref([])
    const errorCount = ref('')
    const errorCountToday = ref('')

    async function getData (dates, getFunction, sortDirection, param) {
      loading.value = true
      try {
        let count = 0
        const items = await getFunction(dates)
        // Sort by sort key which represents each day
        const sorted = sortByDate(items, sortDirection, 'sk')
        // Sort items within the day
        for (const item of sorted) {
          item[param] = sortByDate(item[param], sortDirection, 'created')
          count = count + item[param].length
        }
        return {
          sortedItems: sorted,
          count
        }
      } finally {
        loading.value = false
      }
    }

    async function getAnalytics (dates) {
      const analyticsData = await getData(dates, skylogService.getAnalytics, 'asc', 'analytics')
      const numDays = analyticsData.sortedItems.length
      const todayIndex = numDays - 1

      analyticsCount.value = analyticsData.count.toString()
      const aCountToday = todayIndex >= 0 ? analyticsData.sortedItems[todayIndex].analytics.length : 0
      analyticsCountToday.value = aCountToday.toString()
      analytics.value = analyticsData.sortedItems

      const uCount = getViewsByUser(analyticsData.sortedItems).length
      const uCountToday = todayIndex >= 0 ? getViewsByUserByDay(analyticsData.sortedItems[todayIndex]).length : 0
      userCount.value = uCount.toString()
      userCountToday.value = uCountToday.toString()
    }

    async function getErrors (dates) {
      const errorData = await getData(dates, skylogService.getErrors, 'desc', 'errors')

      errors.value = errorData.sortedItems
      errorCount.value = errorData.count.toString()
      // Errors are sorted descending so we need to count the last day in the list to get today
      const eCountToday = errorData.sortedItems[0] ? errorData.sortedItems[0].errors.length : 0
      errorCountToday.value = eCountToday.toString()
    }

    onMounted(async () => {
      getAnalytics(dateParams.value)
      getErrors(dateParams.value)
    })

    return {
      analyticsCountToday,
      userCountToday,
      errorCountToday,
      analyticsCount,
      userCount,
      errorCount,
      analytics,
      dateParams,
      loading
    }
  }
})
</script>
