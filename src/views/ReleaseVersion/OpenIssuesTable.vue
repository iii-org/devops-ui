<script>
import MixinElTableWithCheckbox from '@/components/MixinElTableWithCheckbox'

export default {
  name: 'OpenIssuesTable',
  mixins: [MixinElTableWithCheckbox],
  data: () => ({
    searchKey: 'issue_name'
  }),
  methods: {
    async fetchData() {
      return []
    }
  }
}
</script>

<template>
  <div class="table-container">
    <el-table
      ref="theTable"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column :label="$t('Issue.id')" prop="id" />
      <el-table-column :label="$t('Issue.name')" prop="issue_name" />
      <el-table-column :label="$t('Project.Version')" prop="fixed_version_name" />
      <el-table-column :label="$t('general.Type')" prop="issue_category" />
      <el-table-column :label="$t('general.Status')" prop="issue_status" />
      <el-table-column :label="$t('Issue.Assignee')" prop="issue_assignee" />
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="handlePagination"
    />
  </div>
</template>

<style scoped>

</style>
