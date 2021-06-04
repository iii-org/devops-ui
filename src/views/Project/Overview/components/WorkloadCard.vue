<template>
  <el-card class="mb-3" shadow="hover">
    <div slot="header" class="d-flex justify-space-between align-center" :style="{ height: '30px' }">
      <span class="font-weight-bold">
        {{ $t('Dashboard.Workload') }}
        <span v-if="!saveSelectedItem" @click="showFullIssuePriority">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            width="1em"
            height="1em"
            style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"
              fill="#626262"
            />
          </svg>
        </span>
      </span>
      <el-select v-model="selectedItem" size="medium" @change="fillData">
        <el-option v-for="item in selectList" :key="item.id" :label="$t('Issue.' + item.label)" :value="item.id" />
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
import HorizontalBar from './HorizontalBar.vue'

export default {
  name: 'WorkloadCard',
  components: { HorizontalBar },
  props: {
    statisticsObj: {
      type: Object,
      default: () => []
    },
    saveSelectedItem: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataCollection: {},
      selectList: [],
      selectedItem: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    statisticsObj(val) {
      this.handleStatistics(val)
    },
    selectedItem(val) {
      this.$emit('emitSelectedItem', val)
    },
    saveSelectedItem() {
      this.handleStatistics(this.statisticsObj)
    }
  },
  mounted() {
    this.handleStatistics(this.statisticsObj)
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
        this.selectedItem = this.saveSelectedItem !== '' ? this.saveSelectedItem : this.selectList[2].id
        this.fillData()
      } else {
        this.dataCollection = {}
        this.selectList = []
        this.selectedItem = ''
      }
    },
    fillData() {
      const issueStatusList = [
        { label: this.$t('Issue.Active'), color: '#409EFF', key: 'Active' },
        { label: this.$t('Issue.Assigned'), color: '#F56C6C', key: 'Assigned' },
        { label: this.$t('Issue.Closed'), color: '#909399', key: 'Closed' },
        { label: this.$t('Issue.Solved'), color: '#3ECBBC', key: 'Solved' },
        { label: this.$t('Issue.InProgress'), color: '#E6A23C', key: 'InProgress' },
        { label: this.$t('Issue.Finished'), color: '#67C23A', key: 'Finished' }
        // { label: this.$t('Issue.Unknown'), color: 'red', key: 'Unknown' }
      ]
      const chartData = this.selectList.find(item => item.label === this.selectedItem).data
      const yAxis = Object.keys(chartData)
      const seriesData = []
      issueStatusList.map(status =>
        seriesData.push(yAxis.map(yAxisItem => chartData[yAxisItem]).map(item => item[status.key]))
      )

      this.dataCollection = {
        legend: issueStatusList.map(status => status.label),
        yAxis,
        series: issueStatusList.map((status, index) => ({
          name: status.label,
          color: status.color,
          data: seriesData[index],
          type: 'bar',
          stack: 'total',
          label: {
            show: false
          },
          emphasis: {
            focus: 'series'
          }
        }))
      }
    },
    showFullIssuePriority() {
      this.$emit('showFullIssuePriority')
    }
  }
}
</script>
