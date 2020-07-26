<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import { getRdDashboardIssuesType } from '@/api/dashboard'
import { mapGetters } from 'vuex'
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
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  data() {
    return {
      chart: null,
      types: null
    }
  },
  mounted() {
    getRdDashboardIssuesType(this.userId).then(res => {
      this.types = res.data.map(item => {
        item.value = item.number
        return item
      })
      this.$nextTick(() => {
        this.initChart()
      })
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
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        color: ['#67c23a', '#f56c6c'],
        legend: {
          left: 'center',
          bottom: '10'
        },
        series: [
          {
            name: 'ASSIGN ISSUE TYPE',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            data: this.types,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
