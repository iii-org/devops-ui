<script>
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'OpenIssuesTable',
  mixins: [MixinElTable],
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
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      height="100%"
    >
      <el-table-column :label="$t('general.Type')" prop="issue_name">
      </el-table-column>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<style scoped>

</style>
