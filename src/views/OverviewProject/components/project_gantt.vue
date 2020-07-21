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
        color: ['#da251d', '#e77817', '#f8c300', '#68b920', '#3bb3c2', '#0093dd', '#667ab3'],
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
              v.seriesName +
              '<br/>' +
              '    <span class="chainTextTitle">开始时间：' +
              v.data.tooltip.startTime +
              '</span><br>' +
              '    <span class="chainTextTitle">结束时间：' +
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
          max: 1508925966000,
          min: 1508925636000
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
                color: '#404d5b',
                fontSize: 14
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
            data: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']
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
                color: '#404d5b',
                fontSize: 14
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
            data: ['', '', '', '', '', '', '']
          }
        ],
        series: [
          {
            type: 'bar',
            stack: 1,
            name: 'Phase 4',
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
                    xAxis: 1508925789000,
                    yAxis: 'Phase 4',
                    tooltip: {
                      endTime: '2017-10-25 18:03:42',
                      eventName: 'Phase 4',
                      sip: '53.53.53.2',
                      startTime: '2017-10-25 18:03:09'
                    }
                  },
                  { xAxis: 1508925822000, yAxis: 'Phase 4' }
                ]
              ]
            }
          },
          {
            type: 'bar',
            stack: 1,
            name: 'Phase 3',
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
                    xAxis: 1508925720000,
                    yAxis: 'Phase 3',
                    tooltip: {
                      endTime: '2017-10-25 18:03:19',
                      eventName: 'Phase 3',
                      sip: '53.53.53.2',
                      startTime: '2017-10-25 18:02:00'
                    }
                  },
                  { xAxis: 1508925799000, yAxis: 'Phase 3' }
                ]
              ]
            }
          },
          {
            type: 'bar',
            stack: 1,
            name: 'Phase 2',
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
              data: []
            }
          },
          {
            type: 'bar',
            stack: 1,
            name: 'Phase 1',
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
                    xAxis: 1508925696000,
                    yAxis: 'Phase 1',
                    tooltip: {
                      endTime: '2017-10-25 18:05:06',
                      eventName: 'Phase 1',
                      sip: '53.53.53.2',
                      startTime: '2017-10-25 18:01:36'
                    }
                  },
                  { xAxis: 1508925906000, yAxis: 'Phase 1' }
                ]
              ]
            }
          }
        ]
      })
    }
  }
}
</script>
