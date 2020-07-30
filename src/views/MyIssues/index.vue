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
      <el-table-column label="Num" width="70" align="center">
        <template slot-scope="scope">
          <router-link :to="'/issues/'+scope.row.id" style="color: #409EFF">
            <span>{{ scope.row.id }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Name" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.issue_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Tracker" width="110">
        <template slot-scope="scope">
          {{ scope.row.issue_category }}
        </template>
      </el-table-column>
      <el-table-column label="Priority" width="110" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.issue_priority === '特急'" type="danger" size="medium">{{ scope.row.issue_priority }}</el-tag>
          <el-tag v-else-if="scope.row.issue_priority === '急'" type="warning" size="medium">{{ scope.row.issue_priority }}</el-tag>
          <el-tag v-else-if="scope.row.issue_priority === '一般'" size="medium">{{ scope.row.issue_priority }}</el-tag>
          <el-tag v-else type="success" size="medium">{{ scope.row.issue_priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.issue_status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Project" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Last Update Time" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.last_test_time | relativeTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Last Test Result" width="110" align="center">
        <template slot-scope="scope">
          <div>
            <span v-if="Object.entries(scope.row.last_test_result).length > 0" type="danger" size="medium">
              {{ scope.row.last_test_result.success }} / {{ scope.row.last_test_result.total }}
            </span>
            <span v-else>-</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getIssuesByUser } from '@/api/issue'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'userId'
    ])
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
      getIssuesByUser(this.userId, this.listQuery).then(response => {
        this.list = response.data
        this.listLoading = false
      })
    }
  }
}
</script>
