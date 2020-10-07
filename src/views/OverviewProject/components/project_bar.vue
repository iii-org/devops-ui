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
      default: '250px'
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
          position:'top',
          interval: 1,
          axisTick: {
            lineStyle: {
              color: "#C8C8C8"
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
          //data: CONFIG_DATA.yAxis,
          data: ['急', '特急', '一般'],
          axisTick: {
            lineStyle: {
              color: "#C8C8C8"
            }
          },
          axisLine: {
            show: false
          },
          axisLabel: {
              textStyle: {
                  color: function (value, index) {
                    if(value == "急"){
                      return "#3ECBBC"
                    }else if(value == "特急"){
                      return "#F9BE6E"
                    }else{
                      return "#E85656"
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
            //data: CONFIG_DATA.finished,
            // data: [16, 6, 3],
            data: [
                {
                    value: 16,
                    itemStyle: {color: '#3ECBBC'},
                },
                {
                    value: 6,
                    itemStyle: {color: '#F9BE6E'},
                },
                {
                    value: 4,
                    itemStyle: {color: '#E85656'},
                }
            ],
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
