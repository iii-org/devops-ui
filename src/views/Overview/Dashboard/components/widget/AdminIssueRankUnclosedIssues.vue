<template>
  <el-row v-loading="listLoading">
    <el-row type="flex" align="middle">
      <el-col :span="12">
        <el-select v-model="searchUser" value-key="user_id">
          <el-option v-for="item in user" :key="item.user_id" :label="item.user_name" :value="item.user_id" />
        </el-select>
        <el-input v-model="keyword" style="width: 250px" :placeholder="$t('Project.SearchProjectName')" clearable />
      </el-col>
      <el-col v-if="listData.length > 0" :span="12" class="text-right">
        {{ $t('Dashboard.ADMIN.sync_date', [listData[0].sync_date]) }}
      </el-col>
    </el-row>
    <el-card>
      <el-table v-if="listData.length > 0" :data="pagedData">
        <el-table-column sortable show-overflow-tooltip prop="project_name" :label="$t('Dashboard.ADMIN.IssueRank.project_name')" />
        <el-table-column sortable show-overflow-tooltip prop="issue_name" :label="$t('Dashboard.ADMIN.IssueRank.issue_name')" />
        <el-table-column sortable show-overflow-tooltip prop="issue_type" :label="$t('Dashboard.ADMIN.IssueRank.issue_type')">
          <template slot-scope="{row}">
            <Tracker :name="$t(`Issue.${row.issue_type}`)" :type="row.issue_type" />
          </template>
        </el-table-column>
        <el-table-column sortable show-overflow-tooltip prop="status" :label="$t('Dashboard.ADMIN.IssueRank.status_id')">
          <template slot-scope="{row}">
            <Status :name="$t(`Issue.${row.status}`)" :type="row.status" />
          </template>
        </el-table-column>
        <el-table-column sortable show-overflow-tooltip prop="start_date" :label="$t('Dashboard.ADMIN.IssueRank.start_date')" />
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
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'

export default {
  name: 'AdminIssueRankDetail',
  components: { Status, Tracker },
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    detail: {
      type: Object,
      default: () => ({})
    },
    user: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 5
      },
      searchKeys: ['project_name', 'issue_name'],
      searchUser: ''
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
