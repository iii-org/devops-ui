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
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit>
      <el-table-column align="center" :label="$t('Activities.User')" min-width="100" prop="operator_name" />
      <el-table-column align="center" :label="$t('Activities.ActionType')" min-width="150" prop="action_type" />
      <el-table-column align="center" :label="$t('Activities.ActionParts')" min-width="250" prop="action_parts" />
      <el-table-column-time prop="act_at" :label="$t('Activities.ActAt')" />
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

<script>
import { getAllActivities } from '@/api/activities'
import MixinBasicTable from '@/mixins/MixinBasicTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'SystemActivities',
  components: { ElTableColumnTime },
  mixins: [MixinBasicTable],
  data() {
    return {
      dialogVisible: false,
      formData: {
        // from_date: '2020-01-01',
        // to_date: '2021-12-31',
        // limit: 100,
        // page: 0,
        // actions: 'CREATE_USER, UPDATE_USER, DELETE_USER'
      },
      searchKeys: ['operator_name', 'action_type', 'action_parts']
    }
  },
  methods: {
    async fetchData() {
      return (await getAllActivities(this.formData)).data
    }
  }
}
</script>
