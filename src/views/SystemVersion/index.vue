<template>
  <div class="app-container">
    <el-table
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="source">
        <template slot-scope="scope">
          {{ scope.row.source }}
        </template>
      </el-table-column>
      <el-table-column label="commit id">
        <template slot-scope="scope">
          {{ scope.row.commitid }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getVersion } from '@/api/dashboard'

export default {
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
    const uidata = { source: 'UI', commitid: process.env.VUE_APP_VERSION }
    this.list.push(uidata)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getVersion().then(response => {
        // console.log(response.data)
        const apidata = { source: 'API', commitid: response.data.git_commit_id }
        this.list.push(apidata)
      })
    }
  }
}
</script>
