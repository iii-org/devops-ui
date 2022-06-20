<template>
  <div style="height: 400px">
    <v-chart
      class="chart"
      :option="option"
      theme="macarons"
      autoresize
    />
  </div>
</template>

<script>
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

require('echarts/theme/macarons') // echarts theme
use([TooltipComponent, LegendComponent, GridComponent, BarChart, CanvasRenderer])

export default {
  name: 'HorizontalBar',
  components: {
    'v-chart': VChart
  },
  props: {
    chartData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    option() {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: '#ffffff'
        },
        legend: {
          data: this.chartData.legend,
          orient: 'vertical',
          left: 'left',
          y: 'center'
        },
        grid: {
          left: '15%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          minInterval: 1
        },
        yAxis: {
          type: 'category',
          data: this.chartData.yAxis
        },
        series: this.chartData.series
      }
    }
  }
}
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
  min-height: 350px;
}
</style>
