<script>
import { getProjectActivities } from '@/api/activities'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'ProjectActivities',
  mixins: [MixinElTableWithAProject],
  data: () => ({
    dialogVisible: false,
    searchKey: 'action_parts'
  }),
  methods: {
    async fetchData() {
      return (await getProjectActivities(this.selectedProjectId)).data
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />

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
      <el-table-column align="center" :label="$t('Activities.User')" min-width="30" prop="operator_name" />
      <el-table-column align="center" :label="$t('Activities.ActionType')" min-width="40" prop="action_type" />
      <el-table-column align="center" :label="$t('Activities.ActionParts')" min-width="80" prop="action_parts" />
      <el-table-column align="center" :label="$t('Activities.ActAt')" min-width="40">
        <template slot-scope="scope">
          {{ scope.row.act_at | UTCtoLocalTime }}
        </template>
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
