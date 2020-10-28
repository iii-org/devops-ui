<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import { getRdDashboardIssuesPriority } from '@/api/dashboard'
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
    ...mapGetters(['userId'])
  },
  data() {
    return {
      chart: null,
      prioritys: []
    }
  },
  mounted() {
    getRdDashboardIssuesPriority(this.userId).then((res) => {
      this.prioritys = res.data.map((item) => {
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
        title: {
          show: this.prioritys.length === 0,
          textStyle: {
            color: 'grey',
            fontSize: 20
          },
          text: 'No Issue',
          left: 'center',
          top: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        color: ['#f56c6c', '#e6a23c'],
        legend: {
          left: 'center',
          bottom: '10'
        },
        series: [
          {
            name: 'ASSIGN ISSUE PRIORITY',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            data: this.prioritys,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
