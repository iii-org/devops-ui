<script>
import { getAllActivities } from '@/api/activities'
import MixinElTable from '@/components/MixinElTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'SystemActivities',
  components: { ElTableColumnTime },
  mixins: [MixinElTable],
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
      searchKey: 'action_parts'
    }
  },
  methods: {
    async fetchData() {
      return (await getAllActivities(this.formData)).data
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('Activities.SearchActionParts')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>

    <el-divider />

    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row height="100%">
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
