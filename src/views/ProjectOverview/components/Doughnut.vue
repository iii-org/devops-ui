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
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'

require('echarts/theme/macarons') // echarts theme
use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer])

export default {
  name: 'Doughnut',
  components: {
    'v-chart': VChart
  },
  props: {
    chartData: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    option() {
      return {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#ffffff'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          y: 'center'
        },
        color: this.chartData.color,
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['50%', '80%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.chartData.data
          }
        ]
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
