<template>
  <v-chart ref="chart" :style="{ height, width }" :option="option" autoresize theme="macarons" />
</template>

<script>
import { getRdDashboardIssuesPriority } from '@/api/dashboard'
import { mapGetters } from 'vuex'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, ScatterChart } from 'echarts/charts'

require('echarts/theme/macarons') // echarts theme

use([
  CanvasRenderer,
  ScatterChart,
  PieChart
])

export default {
  components: {
    'v-chart': VChart
  },
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
      prioritys: []
    }
  },
  computed: {
    ...mapGetters(['userId']),
    option() {
      return {
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
          formatter: '{b} : {c} ({d}%)',
          textStyle: {
            color: '#FFFFFF'
          }
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
      }
    }
  },
  mounted() {
    getRdDashboardIssuesPriority(this.userId).then((res) => {
      this.prioritys = res.data.map((item) => {
        item.value = item.number
        return item
      })
    })
  }
}
</script>
