<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme

var colorPalette = [
  '#2EC6C8',
  '#EBEBEB'
]

var theme2 = {
  color: colorPalette
}

echarts.registerTheme('macarons', theme2)

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
          // finished: Object.keys(vals
          // finished: Object.keys(value).map(key =>
          //   value[key].closed),
          finished: Object.keys(value).map(function(item, index, array) {
            // console.log(value[item].closed)
            let color = ''
            if (item === 'Immediate') {
              color = '#E85656'
            } else if (item === 'High') {
              color = '#F9BE6E'
            } else if (item === 'Normal') {
              color = '#3ECBBC'
            } else {
              color = '#56b1e8'
            }
            return ({ value: value[item].closed, itemStyle: { color: color }})
            // itemStyle: { color: '#3ECBBC' }
          }),
          unfinished: Object.keys(value).map(key => value[key].open)

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
      if (CONFIG_DATA.yAxis.length === 0) {
        this.$emit('legendfun', false)
      } else {
        this.$emit('legendfun', true)
      }
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        title: {
          show: CONFIG_DATA.yAxis.length === 0,
          textStyle: {
            color: 'grey',
            fontSize: 20
          },
          text: 'No Issue',
          left: 'center',
          top: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        // color: ['#3ECBBC','#C8C8C8'],
        // legend: {
        //   data: ['Finished', 'Unfinish'],
        //   textStyle:{
        //     color:'#000000',
        //     fontSize: 13
        //   }
        // },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          position: 'top',
          interval: 1,
          axisTick: {
            lineStyle: {
              color: '#C8C8C8'
            }
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: '#C8C8C8'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: CONFIG_DATA.yAxis,
          // data: ['一般', '緊急', '特急'],
          axisTick: {
            lineStyle: {
              color: '#C8C8C8'
            }
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: function(value, index) {
                if (value === 'Immediate') {
                  return '#E85656'
                } else if (value === 'High') {
                  return '#F9BE6E'
                } else if (value === 'Normal') {
                  return '#3ECBBC'
                } else {
                  return '#56b1e8'
                }
              }
            },
            padding: [0, 15, 0, 0]
          }
        },
        series: [
          {
            name: 'Finished',
            type: 'bar',
            barWidth: '10',
            stack: 'Total',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: CONFIG_DATA.finished
            // data: [16, 6, 3],
            // data: [
            //   {
            //     value: 16,
            //     itemStyle: { color: '#3ECBBC' }
            //   },
            //   {
            //     value: 6,
            //     itemStyle: { color: '#F9BE6E' }
            //   },
            //   {
            //     value: 4,
            //     itemStyle: { color: '#E85656' }
            //   }
            // ]
          },
          {
            name: 'Unfinish',
            type: 'bar',
            barWidth: '10',
            stack: 'Total',
            label: {
              show: false,
              position: 'insideRight'
            },
            data: CONFIG_DATA.unfinished,
            // data: [12, 12, 11],
            itemStyle: { normal: { color: '#EBEBEB' }}
          }
        ]
      })
    }
  }
}
</script>
