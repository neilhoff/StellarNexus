<template>
  <apexchart
    :height="height"
    :options="chartOptions"
    :series="viewsByUser"
    type="bar"
  />
</template>
<script>
import { defineComponent, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { defaultChartColors, getViewsByUser } from '../analyticsHelpers.js'

export default defineComponent({
  name: 'ViewsByUserChart',
  components: {
    apexchart: VueApexCharts
  },
  props: {
    analytics: {
      type: Array
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  setup (props) {
    const viewsByUser = ref([])
    watch(() => props.analytics, (analytics, prevAnalytics) => {
      viewsByUser.value = getViewsByUserCharting(analytics)
    })
    const categoryLabels = ref([])
    function getViewsByUserCharting (analytics) {
      const data = getViewsByUser(analytics)
      const topFive = data.slice(0, 5)
      for (const item of topFive) {
        categoryLabels.value.push(item.x)
      }
      return [
        {
          name: 'Views',
          data: topFive
        }
      ]
    }
    const chartOptions = {
      chart: {
        fontFamily: 'Roboto',
        type: 'bar',
        height: '100%',
        zoom: {
          enabled: false
        }
      },
      colors: defaultChartColors(),
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        bar: {
          barHeight: '100%',
          borderRadius: 5,
          horizontal: false
        }
      },
      title: {
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'normal'
        },
        text: 'Top 5 Users by Views'
      },
      yaxis: {
        decimalsInFloat: 0
      },
      xaxis: {
        type: 'category',
        catagories: categoryLabels.value,
        labels: {
          rotate: '-15',
          rotateAlways: true
        }
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: true
        }
      }
    }

    return {
      viewsByUser,
      chartOptions
    }
  }
})

</script>
