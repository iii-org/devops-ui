<template>
  <el-card class="mb-3" shadow="hover">
    <div slot="header" class="flex align-center" :style="{ height: '30px' }">
      <span class="font-weight-bold">{{ $t('Dashboard.IssueTrackingStatus') }}</span>
    </div>
    <div v-if="Object.keys(dataCollection).length === 0" class="flex justify-center align-center">
      <span>{{ $t('general.NoData') }}</span>
    </div>
    <div v-else>
      <Doughnut :chart-data="dataCollection" />
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import Doughnut from './Doughnut.vue'

export default {
  name: 'IssueStatusCard',
  components: { Doughnut },
  props: {
    progressObj: {
      type: Object,
      default: () => {}
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
      this.fillData(this.progressObj)
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
