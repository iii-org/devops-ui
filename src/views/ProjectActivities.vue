<script>
import { getProjectActivities } from '@/api/activities'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ProjectActivities',
  components: { ElTableColumnTime },
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

    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row height="100%" row-height="70">
      <el-table-column align="center" :label="$t('Activities.User')" prop="operator_name" />
      <el-table-column align="center" :label="$t('Activities.ActionType')" prop="action_type" />
      <el-table-column align="center" :label="$t('Activities.ActionParts')" prop="action_parts" min-width="200" />
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
