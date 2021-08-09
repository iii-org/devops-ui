<template>
  <div class="app-container">
    <VersionUpdater />
    <div class="flex justify-between items-center bg-gray-600 text-white py-3 px-4 rounded mb-5">
      <div class="text-title">
        <span>{{ $t('SystemVersion.DeploymentName') }}： </span>
        <span class="select-all">{{ deployment_name }}</span>
      </div>
      <div class="text-title">
        <span>{{ $t('SystemVersion.DeploymentUuid') }}： </span>
        <span class="select-all">{{ deployment_uuid }}</span>
      </div>
    </div>
    <el-table :data="list" :element-loading-text="$t('Loading')" fit highlight-current-row>
      <el-table-column align="center" :label="$t('SystemVersion.Source')" width="180">
        <template slot-scope="scope">
          {{ scope.row.source }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SystemVersion.Version')" prop="tag" width="180" />
      <el-table-column :label="$t('SystemVersion.CommitID')" prop="commitId" />
      <el-table-column-time align="center" prop="commitTime" width="180" />
    </el-table>
  </div>
</template>

<script>
import { getVersion } from '@/api/dashboard'
import { getDevopsApiServerVersion } from '@/api/devopsVersion'

import ElTableColumnTime from '@/components/ElTableColumnTime'
import VersionUpdater from './components/VersionUpdater.vue'

export default {
  name: 'SystemVersion',
  components: { ElTableColumnTime, VersionUpdater },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      deployment_name: '',
      deployment_uuid: ''
    }
  },
  created() {
    const uiData = {
      source: 'UI',
      tag: process.env.VUE_APP_TAG,
      commitId: process.env.VUE_APP_COMMIT,
      commitTime: process.env.VUE_APP_DATE
    }
    this.list.push(uiData)
    this.fetchData()
    this.fetchVersionInfo()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getVersion().then(response => {
        const apiData = {
          source: 'API',
          tag: response.data.git_tag,
          commitId: response.data.git_commit_id,
          commitTime: response.data.git_date
        }
        this.list.push(apiData)
      })
    },
    fetchVersionInfo() {
      getDevopsApiServerVersion().then(res => {
        const { deployment_name, deployment_uuid } = res.data
        this.deployment_name = deployment_name
        this.deployment_uuid = deployment_uuid
      })
    }
  }
}
</script>
