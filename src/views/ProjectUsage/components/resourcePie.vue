<template>
  <div :style="{ height, width }" />
</template>

<script>
import echarts from 'echarts'

export default {
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({ chart: null }),
  watch: {
    chartData() {
      this.$nextTick(() => {
        this.initChart()
      })
    }
  },
  beforeDestroy() {
    if (!this.chart) return
    this.chart.dispose()
    this.chart = null
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el)
      const hasChartData = this.chartData.length > 0
      if (hasChartData) {
        this.chart.setOption({
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
        })
        this.chart.dispatchAction({ type: 'highlight', name: 'Left Quota' })
        this.chart.on('mouseover', function(params) {
          var name = params.name
          this.dispatchAction({ type: 'downplay' })
          this.dispatchAction({ type: 'highlight', name: name })
        })
        this.chart.on('mouseout', function(params) {
          this.dispatchAction({ type: 'downplay' })
          this.dispatchAction({ type: 'highlight', name: 'Left Quota' })
        })
      } else {
        this.chart.clear()
        this.chart.setOption({
          title: {
            textStyle: {
              color: 'grey',
              fontSize: 20
            },
            text: this.$t('general.NoData'),
            left: 'center',
            top: 'center'
          }
        })
      }
    }
  }
}
</script>
