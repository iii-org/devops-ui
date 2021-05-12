<template>
  <el-row v-loading="listLoading">
    <el-row type="flex" align="middle">
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
      <el-col v-if="listData.length>0" :span="12" class="text-right">
        {{ $t('Dashboard.ADMIN.sync_date', [listData[0].sync_date]) }}
      </el-col>
    </el-row>
    <el-card>
      <el-table v-if="listData.length>0" :data="pagedData">
        <el-table-column sortable
                         prop="project_name"
                         :label="$t('Dashboard.ADMIN.IssueRank.project_name')"
        />
        <el-table-column sortable
                         prop="issue_name"
                         :label="$t('Dashboard.ADMIN.IssueRank.issue_name')"
        />
        <el-table-column sortable
                         prop="issue_type"
                         :label="$t('Dashboard.ADMIN.IssueRank.issue_type')"
        >
          <template slot-scope="scope">
            <tracker :name="scope.row.issue_type" />
          </template>
        </el-table-column>
        <el-table-column sortable
                         prop="status"
                         :label="$t('Dashboard.ADMIN.IssueRank.status_id')"
        >
          <template slot-scope="scope">
            <status :name="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column sortable
                         prop="start_date"
                         :label="$t('Dashboard.ADMIN.IssueRank.start_date')"
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
    </el-card>
  </el-row>
</template>

<script>
import MixinBasicTable from '@/mixins/MixinBasicTable'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'

export default {
  name: 'AdminIssueRankDetail',
  components: { Status, Tracker },
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
      searchKeys: ['project_name', 'issue_name'],
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