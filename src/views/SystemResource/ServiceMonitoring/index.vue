<template>
  <el-row class="app-container">
    <el-col>
      <div>
        <!-- <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous" @click="handleBackPage">
          {{ $t('general.Back') }}
        </el-button> -->
        <span class="ml-2 text-xl">
          <span>{{ $t('route.monitoring') }}</span>
        </span>
      </div>
      <!-- <project-list-selector /> -->
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
// import ProjectListSelector from '@/components/ProjectListSelector'
import {
  getRancherStatus,
  getK8sStatus,
  getRedmineStatus,
  getGitlabStatus,
  getHarborStatus,
  getSonarqubeStatus
} from '@/api/monitoring'

export default {
  name: 'ServiceMonitoring',
  // components: { ProjectListSelector },
  data() {
    return {
      isLoading: false,
      listData: []
    }
  },
  mounted() {
    this.fetchData()
    this.handleUpdate()
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      await Promise.all([
        getRancherStatus(),
        getK8sStatus(),
        getRedmineStatus(),
        getGitlabStatus(),
        getHarborStatus(),
        getSonarqubeStatus()
      ]).then(res => {
        this.listData = this.handleData(res)
      })
      this.isLoading = false
    },
    handleUpdate() {
      const tenMinutes = 1000 * 60 * 10
      let timer = window.setInterval(async () => {
        await this.fetchData()
      }, tenMinutes)
      this.$once('hook:beforeDestroy', () => {
        clearInterval(timer)
        timer = null
      })
    },
    handleData(res) {
      const listData = res.map(item => {
        const datetime = this.$dayjs().local(res.datetime).format('YYYY-MM-DD HH:mm:ss')
        item.datetime = datetime
        return item
      })
      return listData
    },
    getTagType(status) {
      return status ? 'success' : 'danger'
    }
  }
}
</script>
