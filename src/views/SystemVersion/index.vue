<template>
  <div class="app-container">
    <VersionUpdater />
    <el-table :data="list" :element-loading-text="$t('Loading')" border fit highlight-current-row>
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
      list: []
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
    }
  }
}
</script>
