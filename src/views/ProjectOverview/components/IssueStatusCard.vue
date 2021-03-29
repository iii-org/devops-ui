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
  name: 'IssueStatusCard',
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
      const issueStatusList = [
        { label: this.$t('Issue.Active'), color: '#56b1e8', key: 'Active' },
        { label: this.$t('Issue.Assigned'), color: '#5375bf', key: 'Assigned' },
        { label: this.$t('Issue.Closed'), color: '#c4cfcf', key: 'Closed' },
        { label: this.$t('Issue.Solved'), color: '#3ecbbc', key: 'Solved' },
        { label: this.$t('Issue.Responded'), color: '#ec8539', key: 'Responded' },
        { label: this.$t('Issue.Finished'), color: '#53bf64', key: 'Finished' }
        // { label: this.$t('Issue.Unknown'), color: 'red', key: 'Unknown' }
      ]
      this.dataCollection = {
        labels: issueStatusList.map(status => status.label),
        datasets: [
          {
            data: issueStatusList.map(status => status.key).map(key => chartData[key]),
            backgroundColor: issueStatusList.map(status => status.color)
          }
        ]
      }
    }
  }
}
</script>
