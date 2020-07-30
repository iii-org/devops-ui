<script>
import { mapGetters, mapActions } from 'vuex'
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
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      }
    }
  },
  computed: {
    ...mapGetters(['commitListByBranch', 'commitListTotalByBranch']),
    rId() {
      return this.$route.params.rId
    },
    projectName() {
      return this.$route.params.projectName
    },
    branchName() {
      return this.$route.params.branchName
    },
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.commitListByBranch.slice(start, end)
    }
  },
  async created() {
    await this['commitList/getCommitListByBranch']({ rId: this.rId, bName: this.branchName })
    this.listLoading = false
  },
  methods: {
    ...mapActions(['commitList/getCommitListByBranch']),
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    handlePull() {},
    handleMerge(index, row) {
      this.mergeDialogVisible = true
      this.selectedBranch = row.branch_name
    },
    handleDelete() {
      this.deleteDialogVisible = true
    }
  }
}
</script>
<template>
  <div class="app-container">
    <h3>
      {{ projectName }}
    </h3>
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column label="Author" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.author }}
        </template>
      </el-table-column>
      <el-table-column label="Commit Message" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_message }}
        </template>
      </el-table-column>
      <el-table-column label="Commit Time" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_time }}
        </template>
      </el-table-column>
      <el-table-column label="Commit ID" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_id }}
        </template>
      </el-table-column>
      <el-table-column label="Action" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handlePull(scope)">Pull</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="commitListTotalByBranch"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<style lang="css" scoped>
.newBtn{
  float:right;
  padding-right: 6px;
}
</style>
