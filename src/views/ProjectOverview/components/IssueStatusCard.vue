<template>
  <el-card class="mb-3" shadow="hover">
    <div slot="header" class="d-flex align-center" :style="{ height: '30px' }">
      <span class="font-weight-bold">{{ $t('Dashboard.IssueTrackingStatus') }}</span>
    </div>
    <div v-if="Object.keys(dataCollection).length === 0" class="d-flex justify-center align-center">
      <span>{{ $t('general.NoData') }}</span>
    </div>
    <div v-else>
      <Doughnut :chart-data="dataCollection" />
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import Doughnut from './Doughnut.js'

export default {
  name: 'IssuePriorityCard',
  components: { Doughnut },
  props: {
    progressObj: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    dataCollection: {}
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    progressObj(val) {
      this.handleProgress(val)
    }
  },
  methods: {
    handleProgress(progress) {
      const hasProgress = Object.keys(progress).length > 0
      if (hasProgress) {
        this.fillData(progress)
      } else {
        this.dataCollection = {}
      }
    },
    fillData(chartData) {
      this.dataCollection = {
        labels: Object.keys(chartData),
        datasets: [
          {
            data: Object.values(chartData),
            backgroundColor: ['#56b1e8', '#5375bf', '#3ecbbc', '#ec8539', '#53bf64', '#c4cfcf', 'red']
          }
        ]
      }
    }
  }
}
</script>
