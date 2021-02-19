<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      style="width: 100%"
    >
      <el-table-column label="Number" align="center" width="80">
        <template slot-scope="scope">
          {{ scope.row.id }}
          <!-- <router-link :to="'/issues/'+scope.row.id" style="color: #409EFF">
            <span>{{ scope.row.id }}</span>
          </router-link> -->
        </template>
      </el-table-column>
      <el-table-column label="Tracker" align="center" width="80">
        <template slot-scope="scope">
          {{ scope.row.issue_category }}
        </template>
      </el-table-column>
      <el-table-column label="Priority" align="center" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.issue_priority === '特急'" type="danger" size="medium" effect="dark">{{ scope.row.issue_priority }}</el-tag>
          <el-tag v-else-if="scope.row.issue_priority === '急'" type="warning" size="medium" effect="dark">{{ scope.row.issue_priority }}</el-tag>
          <el-tag v-else-if="scope.row.issue_priority === '一般'" size="medium" effect="dark">{{ scope.row.issue_priority }}</el-tag>
          <el-tag v-else type="success" size="medium" effect="dark">{{ scope.row.issue_priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.issue_status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Project" align="center" width="210">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.issue_name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Last Update Time" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.last_test_time | relativeTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Last Test Result" align="center" width="130">
        <template slot-scope="scope">
          <div>
            <span v-if="scope.row.last_test_result && Object.entries(scope.row.last_test_result).length > 0" type="danger" size="medium">
              {{ scope.row.last_test_result.success }} / {{ scope.row.last_test_result.total }}
            </span>
            <span v-else>-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getIssuesByUser } from '@/api/issue'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  computed: {
    ...mapGetters([
      'userId'
    ])
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
    },
    handleEdit(idx, row) {
      this.$router.push({ path: `/issues/${row.id}/setup` })
    }
  }
}
</script>
