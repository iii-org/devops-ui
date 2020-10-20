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
    theData: {
      type: Object,
      default() {
        return { total_issue: 0, unfinish_number: 0 }
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
        const CONFIG_DATA = [
          { value: value.total_issue - value.open, name: 'Done', itemStyle: { emphasis: { color: '#2EC6C8' }}},
          { value: value.open, name: 'Ongoing', itemStyle: { emphasis: { color: '#EBEBEB' }}}
          // { value: value.unfinish_number, name: 'Ongoing' },
          // { value: value.total_issue - value.unfinish_number, name: 'Done' }
        ]
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
        silent: false,
        legend: {
          orient: 'vertical',
          right: 10,
          selectedMode: false,
          data: ['Ongoing', 'Done']
        },
        series: [
          {
            name: 'ASSIGN ISSUE PROJECT',
            type: 'pie',
            radius: [75, 95],
            center: ['50%', '38%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
              formatter: function(d) {
                return '{number|' + Math.round(d.percent) + '%}\n{title|' + d.name + '}'
              },
              rich: {
                number: {
                  color: '#2EC6C8',
                  fontSize: '36',
                  fontWeight: 'bold'
                },
                title: {
                  color: '#000000',
                  fontSize: '11',
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
            labelLine: {
              show: false
            },
            // data:
            // [
            //   { value: 0, name: 'Done', itemStyle: { emphasis: { color: '#2EC6C8' }}},
            //   { value: 15, name: 'Ongoing', itemStyle: { emphasis: { color: '#EBEBEB' }}}
            // ],
            data: CONFIG_DATA,

            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })

      this.chart.dispatchAction({
        type: 'highlight',
        name: 'Done'
      })

      this.chart.on('mouseover', function(params) {
        var name = params.name
        this.dispatchAction({
          type: 'downplay'
        })
        this.dispatchAction({
          type: 'highlight',
          name: name
        })
      })

      this.chart.on('mouseout', function(params) {
        this.dispatchAction({
          type: 'downplay'
        })
        this.dispatchAction({
          type: 'highlight',
          name: 'Done'
        })
      })
    } // end initchart
  }
}
</script>
