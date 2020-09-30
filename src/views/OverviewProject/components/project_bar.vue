<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme

var colorPalette = [
    '#EBEBEB',
    '#2EC6C8'
]

 var theme2 = {
    color: colorPalette
 }

echarts.registerTheme('macarons', theme2);

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
    },
    theData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    theData(value) {
      this.$nextTick(() => {
        const CONFIG_DATA = {
          yAxis: Object.keys(value),
          finished: Object.keys(value).map(key => value[key].finished),
          unfinished: Object.keys(value).map(key => value[key].unfinish)
        }
        this.initChart(CONFIG_DATA)
      })
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart(CONFIG_DATA) {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Finished', 'Unfinish'],
          height: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          interval: 1
        },
        yAxis: {
          type: 'category',
          // data: CONFIG_DATA.yAxis
           data: ['特急', '緊急', '一般']
        },
        series: [
          {
            name: 'Finished',
            type: 'bar',
            stack: 'Total',
            label: {
              color: "#FF0000",
              show: false,
              position: 'insideRight'
            },
            // data: CONFIG_DATA.finished
            data: [16, 6, 3],
            itemStyle: {normal: {color: '#3ECBBC'}}
          },
          {
            name: 'Unfinish',
            type: 'bar',
            stack: 'Total',
            label: {
              show: false,
              position: 'insideRight'
            },
            // data: CONFIG_DATA.unfinished
            data: [12, 12, 11],
            itemStyle: {normal: {color: '#EBEBEB'}}
          }
        ]
      })
    }
  }
}
</script>
