<template>
  <apexchart
    :height="height"
    :options="chartOptions"
    :series="viewsByDay"
  />
</template>
<script>
import { defineComponent, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { getDateArray, defaultDateFormat, defaultChartColors } from '../analyticsHelpers.js'

export default defineComponent({
  name: 'ViewsByDayChart',
  components: {
    apexchart: VueApexCharts
  },
  props: {
    analytics: {
      type: Array
    },
    dates: {
      type: Object,
      default () {
        return {
          start: '',
          end: ''
        }
      }
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  setup (props) {
    const viewsByDay = ref([])
    watch(() => props.analytics, (analytics, prevAnalytics) => {
      viewsByDay.value = getViewsByDay(props.dates, analytics)
    })
    function getViewsByDay (dates, analytics) {
      const data = []
      const dateArr = getDateArray(dates.start, dates.end)
      for (const day of dateArr) {
        const dayWithViews = analytics.find(view => {
          return day === defaultDateFormat(view.dateOfAnalytics)
        })
        if (dayWithViews) {
          data.push({
            x: day,
            y: dayWithViews.analytics.length
          })
        } else {
          data.push({
            x: day,
            y: 0
          })
        }
      }
      return [
        {
          name: 'Views',
          data
        }
      ]
    }
    const chartOptions = {
      chart: {
        fontFamily: 'Roboto',
        type: 'area',
        height: 350,
        zoom: {
          enabled: false
        }
      },
      colors: defaultChartColors(),
      dataLabels: {
        enabled: false
      },
      title: {
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'normal'
        },
        text: 'Views by Day'
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: true,
          format: 'MMMM d, yyyy',
          formatter: undefined
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMMM',
            day: 'MMM d',
            hour: ''
          },
          rotate: '-15',
          rotateAlways: true
        }
      },
      yaxis: {
        decimalsInFloat: 0
      }
    }

    return {
      viewsByDay,
      chartOptions
    }
  }
})

</script>
