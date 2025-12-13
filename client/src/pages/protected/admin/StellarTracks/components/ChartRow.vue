<template>
  <div class="charts q-col-gutter-sm q-mt-sm row">
    <div
      class="col-md-4 col-xs-12"
      :key="chart.type"
      v-for="chart of charts"
    >
      <stellar-chart
        :chartType="chart.type"
        :data="chart.data"
        :title="chart.title"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import StellarChart from './StellarChart.vue'

export default defineComponent({
  name: 'ChartRow',
  components: {
    StellarChart
  },
  props: {
    charts: {
      type: Array,
      default: () => []
    }
  },
  setup () {
    return {

    }
  }
})
</script>
<style lang="scss" scoped></style>
