<template>
  <el-row>
    <el-table :data="pagedData" :row-class-name="tableRowClassName" cell-class-name="align-center"
              header-cell-class-name="align-center"
              @sort-change="onSortChange"
    >
      <el-table-column sortable prop="project_name" label="專案名稱" />
      <el-table-column sortable prop="pm_user_name" label="專案經理" />
      <el-table-column sortable prop="complete_percent" label="完成百分比" />
      <el-table-column sortable prop="unclosed_issue_count" label="未解決問題數" />
      <el-table-column sortable prop="closed_issue_count" label="已解決問題數" />
      <el-table-column sortable prop="member_count" label="參與人數" />
      <el-table-column sortable prop="expired_day" label="到期天數" />
      <el-table-column sortable prop="end_date" label="到期日" />
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-row>
</template>

<script>
import MixinBasicTable from '@/components/MixinBasicTable'

export default {
  name: 'AdminProjectlist',
  mixins: [MixinBasicTable],
  props: {
    fetch: {
      type: Function,
      default: () => ([])
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10
      },
      searchKeys: ['project_name']
    }
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.fetch()
      this.listLoading = false
    },
    onSortChange(sort) {
      const { prop, order } = sort
      let orderSign = 1
      switch (order) {
        case 'descending':
          orderSign = -1
          break
        default:
          orderSign = 1
          break
      }
      this.listData = this.listData.sort((a, b) => (a[prop] > b[prop]) ? orderSign : ((b[prop] > a[prop]) ? -1 * orderSign : 0))
    },
    tableRowClassName({ row }) {
      if (row.due_date < this.lastUpdate) {
        return 'danger-row'
      }
      return ''
    }
  }
}
</script>

<style scoped>

</style>
