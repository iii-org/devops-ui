<template>
  <div class="app-container">
    <div class="clearfix">
      <el-input
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('Activities.SearchPlaceholder')"
        style="width: 300px; float: right"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 280px)"
      fit
    >
      <el-table-column align="center" :label="$t('Activities.User')" min-width="100" prop="operator_name" />
      <el-table-column align="center" :label="$t('Activities.ActionType')" min-width="150" prop="action_type" />
      <el-table-column align="center" :label="$t('Activities.ActionParts')" min-width="250" prop="action_parts" />
      <el-table-column-time prop="act_at" :label="$t('Activities.ActAt')" />
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <pagination
      :total="listQuery.total"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { getAllActivities } from '@/api/activities'
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'SystemActivities',
  components: { ElTableColumnTime },
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      dialogVisible: false,
      params: params,
      searchKeys: ['operator_name', 'action_type', 'action_parts'],
      activitiesList: []
    }
  },
  computed: {
    // cover the origin pagedData
    pagedData() {
      return this.activitiesList
    }
  },
  methods: {
    async fetchData(params) {
      const apiParams = params || this.params
      const res = await getAllActivities(apiParams)
      const activities_list = res.data.activities_list
      this.activitiesList = activities_list
      this.listQuery = res.data.page
      return activities_list
    },
    async onPagination (listQuery) {
      const offset = listQuery.limit * (listQuery.page - 1)
      const limit = listQuery.limit
      const params = { offset, limit }
      await this.fetchData(params)
    }
  }
}
</script>
