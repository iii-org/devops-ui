<script>
import { mapActions, mapGetters } from 'vuex'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

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
  mixins: [MixinElTableWithAProject],
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
    }
  },
  methods: {
    ...mapActions(['commitList/getCommitListByBranch']),
    async fetchData() {
      await this['commitList/getCommitListByBranch']({
        rId: this.rId,
        params: { branch: this.branchName }
      })
      return this.commitListByBranch.data || []
    },
    handlePull() {
    },
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
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData"
              :element-loading-text="$t('Loading')" border fit
              highlight-current-row height="100%"
    >
      <el-table-column label="Author" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.author_name }}
        </template>
      </el-table-column>
      <el-table-column label="Commit Message" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.message }}
        </template>
      </el-table-column>
      <el-table-column label="Commit Time" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ new Date(scope.row.committed_date).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="Commit ID" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="Action" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handlePull(scope)">Pull</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>

</template>

<style lang="css" scoped>
</style>
