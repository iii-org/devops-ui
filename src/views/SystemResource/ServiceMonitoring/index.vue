<template>
  <el-row class="app-container">
    <el-col>
      <div>
        <span class="ml-2 text-xl">
          <span>{{ $t('route.Monitoring') }}</span>
        </span>
      </div>
      <el-divider />
      <el-card>
        <el-table :data="listData" fit>
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
              <el-skeleton
                v-if="scope.row.status === 'loading'"
                :rows="1"
                animated
              />
              <div v-else-if="scope.row.message === null">-</div>
              <div v-else>{{ scope.row.message }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('ServiceMonitoring.LastUpdateTime')" align="center" prop="datetime" width="200">
            <template slot-scope="scope">
              <div v-if="scope.row.status === 'loading'">{{ $t('Loading') }}</div>
              <div v-else>{{ scope.row.datetime }}</div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('general.Actions')"
            align="center"
            width="200"
          >
            <template slot-scope="scope">
              <el-button
                :loading="scope.row.status === 'loading'"
                size="mini"
                class="buttonPrimaryReverse"
                @click="handleCheck(scope.row.name)"
              >
                {{ $t('ServiceMonitoring.CheckNow') }}
              </el-button>
            </template>
          </el-table-column>
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
      listData: [],
      harborStatus: false
    }
  },
  mounted() {
    this.loadData()
    this.handleUpdate()
  },
  methods: {
    async loadData() {
      this.listData = listData()
      await getHarborStatus().then(async (res) => {
        if (res.status) {
          await getHarborCapacity().then((item) => {
            this.$set(this.listData, 0, this.handleData(item))
          })
        } else {
          this.$set(this.listData, 0, this.handleData(res))
        }
        this.harborStatus = res.status
      })
      const apis = [getRancherStatus, getK8sStatus, getRedmineStatus, getSonarqubeStatus, getGitlabStatus]
      apis.forEach(async (api) => { await this.fetchData(api) })
    },
    async fetchData(api) {
      await api().then((res) => {
        this.listData.splice(1, 1)
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
      if (status === 'loading') return 'warning'
      else if (status) return 'success'
      else return 'danger'
    },
    async handleCheck(name) {
      const apis = {
        Harbor: this.harborStatus ? getHarborCapacity : getHarborStatus,
        Rancher: getRancherStatus,
        K8s: getK8sStatus,
        Redmine: getRedmineStatus,
        Sonarqube: getSonarqubeStatus,
        Gitlab: getGitlabStatus
      }
      const index = this.listData.findIndex((item) => item.name === name)
      this.$set(this.listData[index], 'status', 'loading')
      await apis[name]().then((res) => {
        this.$set(this.listData, index, this.handleData(res))
      })
    }
  }
}
</script>
