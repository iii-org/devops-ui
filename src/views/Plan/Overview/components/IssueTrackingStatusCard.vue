<template>
  <el-card class="mb-3" shadow="never">
    <div class="flex items-center font-semibold h-8">
      <em class="el-icon-pie-chart mx-1" />
      {{ $t('Dashboard.IssueTrackingStatus') }}
    </div>
    <el-empty v-if="Object.keys(dataCollection).length === 0" :description="$t('general.NoData')" :image-size="100" />
    <doughnut v-else :chart-data="dataCollection" />
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import Doughnut from './Doughnut.vue'

export default {
  name: 'IssueTrackingStatusCard',
  components: { Doughnut },
  props: {
    progressObj: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dataCollection: {}
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    progressObj(val) {
      this.handleProgress(val)
    },
    '$i18n.locale'() {
      this.handleProgress(this.progressObj)
    }
  },
  methods: {
    handleProgress(progress) {
      const hasProgress = Object.keys(progress).length > 0
      hasProgress ? this.fillData(progress) : (this.dataCollection = {})
    },
    fillData(chartData) {
      const issueStatusList = [
        { label: this.$t('Issue.Active'), color: '#409EFF', key: 'Active' },
        { label: this.$t('Issue.Assigned'), color: '#F56C6C', key: 'Assigned' },
        { label: this.$t('Issue.InProgress'), color: '#E6A23C', key: 'InProgress' },
        { label: this.$t('Issue.Solved'), color: '#3ECBBC', key: 'Solved' },
        { label: this.$t('Issue.Verified'), color: '#67C23A', key: 'Verified' },
        { label: this.$t('Issue.Closed'), color: '#909399', key: 'Closed' }
      ]
      this.dataCollection = {
        color: issueStatusList.map(item => item.color),
        data: issueStatusList.map(status => ({
          value: chartData[status.key],
          name: status.label
        }))
      }
    }
  }
}
</script>
