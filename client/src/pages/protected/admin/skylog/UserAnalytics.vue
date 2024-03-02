<template>
  <q-page class="q-pa-sm">
    <page-header title="Analytics" />

    <skylog-date-input
      class="row q-gutter-sm q-mb-md"
      :dates="dateParams"
      @update-dates="getAnalytics"
    />

    <div class="row q-mb-md q-gutter-md">
      <data-card
        :loading="loading"
        title="Views"
        :value="analyticsCount"
        data-cy="views-card"
      />
      <data-card
        bgColorClass="bg-secondary"
        :loading="loading"
        title="Users"
        :value="userCount"
        data-cy="users-card"
      />

    </div>
    <div class="row">
      <analytics-card :loading="loading">
        <views-by-day-chart
          :analytics="analytics"
          :dates="dateParams"
        />
      </analytics-card>
      <analytics-card :loading="loading">
        <views-by-user-chart
          :analytics="analytics"
          height="425px"
        />
      </analytics-card>
    </div>
    <div class="row">
      <analytics-card :loading="loading">
        <views-by-list
          :analytics="analytics"
          title="Views By Page"
          column-title="Page"
          :views-by-func="getViewsByPage"
          data-cy="views-by-page-list"
        />
      </analytics-card>
      <analytics-card :loading="loading">
        <views-by-list
          :analytics="analytics"
          title="Views By User"
          column-title="User"
          :views-by-func="getViewsByUser"
          data-cy="views-by-user-list"
        />
      </analytics-card>
    </div>

  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import PageHeader from 'src/components/PageHeader'
import DataCard from './components/DataCard'
import SkylogDateInput from './components/SkylogDateInputs'
import ViewsByDayChart from './components/ViewsByDayChart'
import ViewsByUserChart from './components/ViewsByUserChart'
import ViewsByList from './components/ViewsByList'
import AnalyticsCard from './components/AnalyticsCard'

import { date } from 'quasar'
import skylogService from 'src/services/admin/skylog/getSkylogs'

import { sortByDate, defaultDateFormat, getViewsByUser, getViewsByPage } from './analyticsHelpers.js'

export default defineComponent({
  name: 'UserAnalytics',
  components: {
    AnalyticsCard,
    DataCard,
    PageHeader,
    SkylogDateInput,
    ViewsByDayChart,
    ViewsByUserChart,
    ViewsByList
  },
  setup () {
    const analytics = ref([])
    const loading = ref(false)
    const now = new Date()
    const dateParams = ref({
      start: defaultDateFormat(date.subtractFromDate(now, { days: 20 })),
      end: defaultDateFormat(now)
    })
    const analyticsCount = ref('')
    const userCount = ref('')

    async function getAnalytics (dates) {
      loading.value = true
      let sortedAnalytics = []
      try {
        let count = 0
        const items = await skylogService.getAnalytics(dates)
        // Sort header by ascending date
        sortedAnalytics = sortByDate(items, 'asc', 'sk')
        // Sort analytics times ascending and total count
        for (const item of sortedAnalytics) {
          item.analytics = sortByDate(item.analytics, 'asc', 'created')
          count = count + item.analytics.length
        }

        analyticsCount.value = count.toString()
        analytics.value = sortedAnalytics
        const uCount = getViewsByUser(sortedAnalytics).length
        userCount.value = uCount.toString()
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      getAnalytics(dateParams.value)
    })

    return {
      analytics,
      analyticsCount,
      userCount,
      loading,
      dateParams,
      getAnalytics,
      getViewsByPage,
      getViewsByUser
    }
  }
})
</script>
