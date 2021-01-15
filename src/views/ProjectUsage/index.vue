<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectUsage } from '@/api/projectResource'
import resourcePie from './components/resourcePie'

const calcLeftQuota = (title, quota, usage) =>
  title === 'Memory (GB)' ? Number(quota.replace('G', '')) - Number(usage.replace('G', '')) : Number(quota) - Number(usage)

export default {
  name: 'ProjectUsage',
  components: {
    ProjectListSelector,
    resourcePie
  },
  data: () => ({
    listLoading: true,
    usageList: []
  }),
  computed: {
    ...mapGetters(['projectSelectedId'])
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      if (this.projectSelectedId !== -1) {
        const res = await getProjectUsage(this.projectSelectedId)
        this.usageList = this.handleChartData(res.data)
      }
      this.listLoading = false
    },
    handleChartData(fetchData) {
      const titleList = ['CPU', 'Memory (GB)', 'Pods', 'Service', 'Secret', 'ConfigMaps']
      const fetchItemList = ['cpu', 'memory', 'pods', 'services.nodeports', 'secrets', 'configmaps']
      const result = titleList.map((i, idx) => ({
        title: titleList[idx],
        data: [
          {
            value: Number(fetchData.used[fetchItemList[idx]]),
            name: 'Usage',
            itemStyle: { color: '#E85656', emphasis: { color: '#E85656' } }
          },
          {
            value: calcLeftQuota(
              titleList[idx],
              fetchData.quota[fetchItemList[idx]],
              fetchData.used[fetchItemList[idx]]
            ),
            name: 'Left Quota',
            itemStyle: { color: '#3ECBBC', emphasis: { color: '#3ECBBC' } }
          }
        ]
      }))
      return result
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
    </div>
    <el-divider />
    <el-row :gutter="12">
      <el-col v-for="item in usageList" :key="item.title" :span="8">
        <el-card v-loading="listLoading" style="margin-bottom: 15px">
          <div slot="header">
            <strong>{{ item.title }}</strong>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else>
            <resource-pie :chart-data="item.data" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
