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
    },
    dataList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    convertList() {
      const ary = []
      this.dataList.forEach(item => {
        ary.push({
          ...item,
          end_time: new Date(item.end_time).getTime(),
          start_time: new Date(item.start_time).getTime()
        })
        // if (item.children) {
        //   const childrenItem = item.children
        //   ary.push({
        //     ...childrenItem,
        //     end_time: new Date(childrenItem.end_time).getTime(),
        //     start_time: new Date(childrenItem.start_time).getTime()
        //   })
        // }
      })
      return ary
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
          show: true,
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          formatter: function(v) {
            return (
              '<div >' +
              '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
              v.color +
              '"></span>' +
              v.data.yAxis +
              '<br/>' +
              '    <span class="chainTextTitle">Start Time:' +
              v.data.tooltip.startTime +
              '</span><br>' +
              '    <span class="chainTextTitle">End Time:' +
              v.data.tooltip.endTime +
              '</span><br>' +
              '</div>'
            )
          }
        },
        grid: {
          borderWidth: 0
        },
        xAxis: {
          type: 'time',
          position: 'top',
          axisLine: {
            show: false
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#858585',
              fontSize: 14
            }
          },
          splitLine: {},
          max: this.convertList[this.convertList.length - 1].end_time,
          min: this.convertList[0].start_time
        },
        yAxis: [
          {
            type: 'category',
            axisTick: {
              show: true,
              lineStyle: {
                color: '#858585',
                width: 2
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#404d5b'
              }
            },
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#858585'
              }
            },
            data: this.convertList.map(item => item.desc).reverse()
          },
          {
            type: 'category',
            axisTick: {
              show: true,
              lineStyle: {
                color: '#858585',
                width: 2
              }
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#404d5b'
              }
            },
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#858585'
              }
            }
          }
        ],
        series: this.dataList.map(item => {
          return {
            type: 'bar',
            stack: 1,
            name: item.desc,
            markLine: {
              symbol: 'none',
              itemStyle: {
                normal: {
                  lineStyle: {
                    type: 'solid',
                    width: 8
                  }
                },
                emphasis: {
                  lineStyle: {
                    width: 15
                  }
                }
              },
              data: [
                [
                  {
                    xAxis: item.start_time,
                    yAxis: item.desc,
                    tooltip: {
                      endTime: item.end_time,
                      eventName: item.desc,
                      sip: '53.53.53.2',
                      startTime: item.start_time
                    }
                  },
                  { xAxis: item.end_time, yAxis: item.desc }
                ]
              ]
            }
          }
        })
      })
    }
  }
}
</script>
