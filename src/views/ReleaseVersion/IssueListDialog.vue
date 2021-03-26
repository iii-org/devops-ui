<script>
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'IssueListDialog',
  mixins: [MixinElTable],
  data: () => ({
    searchKey: 'issue_name',
    visible: false
  }),
  methods: {
    async fetchData() {
      return []
    },
    setData(listData) {
      this.listData = listData
    }
  }
}
</script>

<template>
  <el-dialog
    :visible.sync="visible"
  >
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
  </el-dialog>
</template>

<style scoped>

</style>
