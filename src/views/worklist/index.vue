<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="Work Num">
        <template slot-scope="scope">
          {{ scope.row.work_num }}
        </template>
      </el-table-column>
      <el-table-column label="Work Type">
        <template slot-scope="scope">
          {{ scope.row.work_type }}
        </template>
      </el-table-column>
      <el-table-column label="Priority" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.priority }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Project" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.project }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Work Name" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.work_name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Work Start Date" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.work_start_at }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Work End Date" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.work_end_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Last Test Result" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.last_test_result }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getList } from '@/api/worklist'

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
      list: null,
      listLoading: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    }
  }
}
</script>
