<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
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
          <el-tag v-if="scope.row.priority === 'Urgent'" type="danger" size="medium">{{ scope.row.priority }}</el-tag>
          <el-tag v-else-if="scope.row.priority === 'High'" type="warning" size="medium">{{ scope.row.priority }}</el-tag>
          <el-tag v-else-if="scope.row.priority === 'Normal'" size="medium">{{ scope.row.priority }}</el-tag>
          <el-tag v-else type="success" size="medium">{{ scope.row.priority }}</el-tag>
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
      <el-table-column align="center" prop="created_at" label="Last Update Time" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.last_update_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Last Test Result" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.last_test_result }}</span>
          <i v-show="scope.row.last_test_result === 'Failed'" style='color: red' class="el-icon-circle-close"></i>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
  </div>
</template>

<script>
import { getList } from '@/api/worklist'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
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
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    }
  }
}
</script>
