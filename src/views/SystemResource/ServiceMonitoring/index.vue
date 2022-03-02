<template>
  <el-row class="app-container">
    <el-col>
      <div>
        <span class="ml-2 text-xl">
          <span>{{ $t('route.monitoring') }}</span>
        </span>
      </div>
      <el-divider />
      <el-card>
        <el-table v-loading="isLoading" :element-loading-text="$t('Loading')" :data="listData" fit>
          <el-table-column :label="$t('ServiceMonitoring.Services')" align="center" width="200" prop="name" />
          <el-table-column :label="$t('ServiceMonitoring.Health')" align="center" width="100">
            <template slot-scope="scope">
              <el-tag :type="getTagType(scope.row.status)" effect="dark">
                {{ $t(`ServiceMonitoring.${scope.row.status}`) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('ServiceMonitoring.Logs')" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.message === null">-</div>
              <div v-else>{{ scope.row.message }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('ServiceMonitoring.LastUpdateTime')" align="center" prop="datetime" width="200" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import {
  getRancherStatus,
  getK8sStatus,
  getRedmineStatus,
  getGitlabStatus,
  getHarborStatus,
  getHarborCapacity,
  getSonarqubeStatus
} from '@/api/monitoring'

const listData = () => ([
  { name: 'Harbor', status: 'loading' },
  { name: 'Kubernetes', status: 'loading' },
  { name: 'Sonarqube', status: 'loading' },
  { name: 'Redmine', status: 'loading' },
  { name: 'Rancher', status: 'loading' },
  { name: 'Gitlab', status: 'loading' }
])

export default {
  name: 'ServiceMonitoring',
  data() {
    return {
      isLoading: false,
      listData: []
    }
  },
  mounted() {
    this.loadData()
    this.handleUpdate()
  },
  methods: {
    async loadData() {
      this.isLoading = true
      this.listData = listData()
      const apis = [getHarborStatus, getRancherStatus, getK8sStatus, getRedmineStatus, getSonarqubeStatus, getGitlabStatus]
      await getHarborStatus().then(async (res) => { if (res.status) apis[0] = getHarborCapacity })
      apis.forEach(async (api) => await this.fetchData(api))
      this.isLoading = false
    },
    async fetchData(api) {
      await api().then((res) => {
        this.listData.splice(0, 1)
        this.listData.push(this.handleData(res))
      })
    },
    handleUpdate() {
      const tenMinutes = 1000 * 60 * 10
      let timer = window.setInterval(async () => {
        await this.loadData()
      }, tenMinutes)
      this.$once('hook:beforeDestroy', () => {
        clearInterval(timer)
        timer = null
      })
    },
    handleData(res) {
      if (res.name === 'Harbor nfs folder storage remain.') { res.name = 'Harbor' }
      const datetime = this.$dayjs().local(res.datetime).format('YYYY-MM-DD HH:mm:ss')
      res.datetime = datetime
      return res
    },
    getTagType(status) {
      return status === 'loading' ? 'warning' : status ? 'success' : 'danger'
    }
  }
}
</script>
