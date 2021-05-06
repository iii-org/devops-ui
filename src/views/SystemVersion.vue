<template>
  <div class="app-container">
    <el-table :data="list" :element-loading-text="$t('Loading')" border fit highlight-current-row>
      <el-table-column align="center" label="Source" width="180">
        <template slot-scope="scope">
          {{ scope.row.source }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Version" width="180">
        <template>
          <span>V1.4.1</span>
        </template>
      </el-table-column>
      <el-table-column label="Commit ID">
        <template slot-scope="scope">
          {{ scope.row.commitId }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getVersion } from '@/api/dashboard'

export default {
  name: 'SystemVersion',
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
  data: () => ({
    list: []
  }),
  created() {
    const uiData = { source: 'UI', commitId: process.env.VUE_APP_VERSION }
    this.list.push(uiData)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getVersion().then(response => {
        const apiData = { source: 'API', commitId: response.data.git_commit_id }
        this.list.push(apiData)
      })
    }
  }
}
</script>
