<template>
  <el-row class="app-container">
    <el-col>
      <div class="d-flex justify-space-between">
        <project-list-selector />
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('Activities.SearchPlaceholder')"
          style="width: 300px"
        />
      </div>
      <el-divider />
      <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit>
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
    </el-col>
  </el-row>
</template>

<script>
import { getProjectActivities } from '@/api/activities'
import MixinBasicTableWithProject from '@/mixins/MixinBasicTableWithProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ProjectActivities',
  components: { ElTableColumnTime },
  mixins: [MixinBasicTableWithProject],
  data() {
    return {
      dialogVisible: false,
      searchKeys: ['operator_name', 'action_type', 'action_parts']
    }
  },
  methods: {
    async fetchData() {
      return (await getProjectActivities(this.selectedProjectId)).data
    }
  }
}
</script>
