<template>
  <el-row>
    <el-row>
      <el-col :span="12">
        <el-select v-model="searchUser" value-key="user_id">
          <el-option v-for="item in user" :key="item.user_id" :label="item.user_name" :value="item.user_id" />
        </el-select>
        <el-input
          v-model="keyword"
          class="ob-search-input ob-shadow search-input"
          style="width: 250px"
          :placeholder="$t('Project.SearchProjectName')"
          clearable
        />
      </el-col>
      <el-col :span="12" class="text-right">
        統計日期：
        <!--        {{ listData[0].sync_date }}-->
      </el-col>
    </el-row>
    <el-table v-if="listData.length>0" :data="pagedData">
      <el-table-column sortable
                       prop="project_name"
                       label="專案名稱"
      />
      <el-table-column sortable
                       prop="issue_name"
                       label="議題名稱"
      />
      <el-table-column sortable
                       prop="issue_type"
                       label="議題類別"
      />
      <el-table-column sortable
                       prop="status_id"
                       label="狀態"
      />
      <el-table-column sortable
                       prop="start_date"
                       label="開立時間"
      />
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
  name: 'AdminIssueRankDetail',
  mixins: [MixinBasicTable],
  props: {
    detail: {
      type: Object,
      default: () => ({})
    },
    user: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 5
      },
      searchKeys: ['project_name'],
      searchUser: '',
      keyword: ''
    }
  },
  watch: {
    detail: {
      deep: true,
      handler() {
        this.searchUser = this.detail.user_id
        this.loadData(this.searchUser)
      }
    },
    searchUser(val) {
      this.$emit('update-detail', val)
    }
  },
  mounted() {
    this.searchUser = this.detail.user_id
    this.loadData(this.searchUser)
  },
  methods: {
    async loadData(value) {
      if (value && this.detail.hasOwnProperty('unclosedIssues')) {
        this.listLoading = true
        this.listData = await this.detail['unclosedIssues'](value)
        this.listLoading = false
      }
    }
  }
}
</script>

<style scoped>
</style>
