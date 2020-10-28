<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import { getRdDashboardIssuesProject } from '@/api/dashboard'
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
      projects: []
    }
  },
  mounted() {
    getRdDashboardIssuesProject(this.userId).then((res) => {
      this.projects = res.data.map((item) => {
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
          show: this.projects.length === 0,
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
        legend: {
          left: 'center',
          bottom: '10'
        },
        series: [
          {
            name: 'ASSIGN ISSUE PROJECT',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            data: this.projects,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
