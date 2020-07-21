<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Finished', 'Unfinish']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: ['User Case', 'Mission', 'BUG']
        },
        series: [
          {
            name: 'Finished',
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'insideRight'
            },
            data: [10, 9, 3]
          },
          {
            name: 'Unfinish',
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'insideRight'
            },
            data: [2, 6, 11]
          }
        ]
      })
    }
  }
}
</script>
