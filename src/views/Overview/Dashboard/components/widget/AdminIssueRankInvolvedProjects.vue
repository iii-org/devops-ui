<template>
  <el-row>
    <el-table v-if="listData.length > 0" :data="pagedData">
      <el-table-column
        v-for="(column, idx) in Object.keys(pagedData[0])"
        :key="idx"
        sortable
        :prop="column"
        :label="column"
      />
    </el-table>
    <Pagination
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
import { BasicData, Pagination, SearchBar, Table } from '@/mixins'

export default {
  name: 'AdminIssueRankDetail',
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    detail: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 5
      },
      searchKeys: ['project_name']
    }
  },
  methods: {
    async loadData() {
      if (this.detail.hasOwnProperty('involvedProjects')) {
        this.listLoading = true
        this.listData = await this.detail['involvedProjects'](this.detail.user_id)
        this.listLoading = false
      }
    }
  }
}
</script>
