<template>
  <el-card class="mb-3" shadow="hover">
    <div slot="header" class="d-flex justify-space-between align-center" :style="{ height: '30px' }">
      <span class="font-weight-bold">{{ $t('Dashboard.Workload') }}</span>
      <el-select v-model="selectedItem" size="medium" @change="fillData">
        <el-option v-for="item in selectList" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
    </div>
    <div v-if="Object.keys(dataCollection).length === 0" class="d-flex justify-center align-center">
      <span>{{ $t('general.NoData') }}</span>
    </div>
    <div v-else>
      <HorizontalBar :chart-data="dataCollection" />
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import HorizontalBar from './HorizontalBar.js'

export default {
  name: 'IssuePriorityCard',
  components: { HorizontalBar },
  props: {
    statisticsObj: {
      type: Object,
      default: () => []
    }
  },
  data: () => ({
    dataCollection: {},
    selectList: [],
    selectedItem: ''
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    statisticsObj(val) {
      this.handleStatistics(val)
    }
  },
  methods: {
    handleStatistics(statistics) {
      const hasStatistics = Object.keys(statistics).length > 0
      if (hasStatistics) {
        this.selectList = Object.keys(statistics).map(key => ({
          id: key,
          label: key,
          data: statistics[key]
        }))
        this.selectedItem = this.selectList[0].id
        this.fillData()
      } else {
        this.dataCollection = {}
        this.selectList = []
        this.selectedItem = ''
      }
    },
    fillData() {
      const chartData = this.selectList.find(item => item.label === this.selectedItem).data
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
        labels: Object.keys(chartData),
        datasets: issueStatusList.map(status => ({
          label: status.label,
          barPercentage: 0.4,
          backgroundColor: status.color,
          data: Object.values(chartData).map(data => data[status.key])
        }))
      }
    }
  }
}
</script>
