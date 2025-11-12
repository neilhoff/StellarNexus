<template>
  <q-card
    bordered
    flat
  >
    <h2 class="q-ml-md">{{ chartTitle }}</h2>
    <q-card-section>
      <canvas
        class="chart"
        ref="chartCanvas"
      ></canvas>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent, ref, watch, nextTick, onMounted } from 'vue'
import formatHelper from 'src/services/formatHelpers.js'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'StellarChart',
  props: {
    chartType: {
      type: String,
      required: true
    },
    data: {
      type: Object
    }
  },
  setup (props) {
    const chartTitle = ref('')
    const chartCanvas = ref(null)
    const chartJs = ref(null)

    function setChart (data, chartType, chartLabel, dataLimit = null, labelsFunc = null, dataFunc = null) {
      let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1])
      if (dataLimit) {
        sortedData = sortedData.slice(0, dataLimit)
      }
      let labels = sortedData.map(d => d[0])
      if (labelsFunc) {
        labels = labelsFunc(labels)
      }

      let dataValues = sortedData.map(d => d[1])
      if (dataFunc) {
        dataValues = dataFunc(dataValues)
      }

      if (chartJs.value) {
        chartJs.value.destroy()
        chartJs.value = null
      }
      const config = getChartOptionsObj(chartType, chartLabel, labels, dataValues)
      chartJs.value = new Chart(chartCanvas.value, config)
    }

    // Click Charts
    const clickChartOptions = [
      {
        val: 'clickView',
        title: 'Top 5 Clicks',
        setChart: () => setChart(props.data, 'bar', 'Clicks', 5)
      }
    ]

    // Page Charts
    const pageChartOptions = [
      {
        val: 'pageViews',
        title: 'Top 5 Pages',
        setChart: () => setChart(props.data, 'bar', 'Views', 5)
      },
      {
        val: 'dayViews',
        title: 'Views by Day',
        setChart: () => setChart(props.data, 'line', 'Views', 5, (labels) => {
          return labels.map(date => {
            // Convert date from YYYY/MM/DD to MM/DD/YY
            const dateObj = new Date(date)
            const d = formatHelper.formatDateString(dateObj, { formatStr: 'M/dd/yy' }).formattedVal
            return d
          })
        }, (dataValues) => dataValues.map(d => d.total))
      },
      {
        val: 'userViews',
        title: 'Top 5 Users',
        setChart: () => setChart(props.data, 'bar', 'Views', 5)
      },
    ]

    // Chart Utilities
    const chartOptions = [
      ...pageChartOptions,
      ...clickChartOptions
    ]
    function limitChartLabelCharacters (num) {
      return function (value) {
        const label = this.getLabelForValue(value)
        if (typeof label === 'string' && label.length > num) {
          return label.substring(0, num) + '...'
        }
        return label
      }
    }
    function getChartOptionsObj (chartType, chartLabel, labels, dataValues) {
      return {
        type: chartType,
        data: {
          labels,
          datasets: [{
            label: chartLabel,
            data: dataValues,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
            x: {
              ticks: {
                callback: limitChartLabelCharacters(12)
              }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      }
    }
    async function renderChart () {
      if (!props.data || !props.chartType) return

      const chart = chartOptions.find(c => c.val === props.chartType)
      if (!chart) return

      chartTitle.value = chart.title

      // Wait for canvas to be in DOM
      await nextTick()

      if (!chartCanvas.value) {
        console.error('Canvas ref is still not available')
        return
      }

      chart.setChart()
    }

    // Watch for data changes
    watch(() => props.data, () => {
      renderChart()
    },
      { deep: true }
    )

    // Also render on mount if data is already there
    onMounted(() => {
      if (props.data) {
        renderChart()
      }
    })

    return {
      chartTitle,
      chartCanvas
    }
  }
})
</script>

<style lang="scss" scoped>
.chart {
  // max-height: 200px;
}
</style>
