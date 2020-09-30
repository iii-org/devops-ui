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
          { value: value.unfinish_number, name: 'Ongoing' },
          { value: value.total_issue - value.unfinish_number, name: 'Done' }
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
    initChart(data) {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          data: ['Ongoing', 'Done']
        },
        series: [
          {
            name: 'ASSIGN ISSUE PROJECT',
            type: 'pie',
            roseType: 'radius',
            radius: [75, 95],
            center: ['50%', '38%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center',
                formatter: function(d) {
                  return Math.round(d.percent) + "%";
                }
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '36',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
