<template>
  <v-chart ref="chart" :style="{ height, width }" :option="option" autoresize theme="macarons"
           @mouseover="onMouseOver" @mouseout="onMouseOut"
  />
</template>

<script>
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, ScatterChart } from 'echarts/charts'

require('echarts/theme/macarons') // echarts theme

use([
  CanvasRenderer,
  ScatterChart,
  PieChart
])

export default {
  components: {
    'v-chart': VChart
  },
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '270px'
    },
    chartData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    option() {
      if (this.chartData.length <= 0) {
        return {
          title: {
            textStyle: {
              color: 'grey',
              fontSize: 20
            },
            text: this.$t('general.NoData'),
            left: 'center',
            top: 'center'
          }
        }
      }
      return {
        silent: false,
        legend: {
          top: 0,
          selectedMode: false,
          data: this.chartData.map(i => i.name)
        },
        series: [
          {
            type: 'pie',
            radius: [75, 95],
            center: ['50%', '55%'],
            label: {
              show: false,
              position: 'center',
              formatter: d => `{number|${d.value}}\n{title|${d.name}}`,
              rich: {
                number: {
                  fontSize: '42',
                  fontWeight: 'bold'
                },
                title: {
                  color: '#000000',
                  fontSize: '15',
                  padding: [0, 0, 5, 0]
                }
              }
            },
            emphasis: {
              show: true,
              label: {
                show: true,
                fontSize: '36',
                fontWeight: 'bold'
              }
            },
            data: this.chartData,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      }
    }
  },
  watch: {
    chartData() {
      this.$nextTick(() => {
        this.initChart()
      })
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      const chartData = this.chartData
      const hasChartData = chartData.length > 0
      const chart = this.$refs['chart']
      if (hasChartData) {
        chart.dispatchAction({ type: 'highlight', name: this.chartData[0].name })
      }
    },
    onMouseOver(params) {
      const name = params.name
      const chart = this.$refs['chart']
      chart.dispatchAction({ type: 'downplay' })
      chart.dispatchAction({ type: 'highlight', name: name })
    },
    onMouseOut() {
      const chart = this.$refs['chart']
      chart.dispatchAction({ type: 'downplay' })
      chart.dispatchAction({ type: 'highlight', name: this.chartData[0].name })
    }
  }
}
</script>
