<template>
  <el-row v-loading="listLoading">
    <el-row v-if="inDialog" type="flex" align="middle">
      <el-col :span="12">
        <el-select v-model="searchStatus" value-key="user_id">
          <el-option :label="$t('Dashboard.ADMIN.ProjectList.all')" value="" />
          <el-option :label="$t('Dashboard.ADMIN.ProjectList.overdue')" value="overdue" />
          <el-option :label="$t('Dashboard.ADMIN.ProjectList.in_progress')" value="in_progress" />
          <el-option :label="$t('Dashboard.ADMIN.ProjectList.not_started')" value="not_started" />
        </el-select>
        <el-input v-model="keyword" style="width: 250px" :placeholder="$t('Project.SearchProjectName')" clearable />
      </el-col>
      <el-col v-if="listData.length > 0" :span="12" class="text-right">
        {{ $t('Dashboard.ADMIN.sync_date', [listData[0].sync_date]) }}
      </el-col>
    </el-row>
    <component :is="showShadow">
      <el-table
        v-loading="listLoading"
        :data="tableData"
        :row-class-name="tableRowClassName"
        cell-class-name="align-center"
        header-cell-class-name="align-center"
        :height="tableHeight"
        @sort-change="onSortChange"
      >
        <el-table-column sortable prop="project_name" :label="$t('Dashboard.ADMIN.ProjectList.project_name')" />
        <el-table-column sortable prop="owner_name" :label="$t('Dashboard.ADMIN.ProjectList.owner_name')">
          <template slot-scope="scope">
            {{ `${scope.row.owner_name} (${scope.row.owner_login})` }}
          </template>
        </el-table-column>
        <el-table-column sortable prop="project_status" :label="$t('Dashboard.ADMIN.ProjectList.project_status')">
          <template slot-scope="scope">
            <project-status :name="scope.row.project_status" />
          </template>
        </el-table-column>
        <el-table-column sortable prop="complete_percent" :label="$t('Dashboard.ADMIN.ProjectList.complete_percent')" />
        <el-table-column
          sortable
          prop="unclosed_issue_count"
          :label="$t('Dashboard.ADMIN.ProjectList.unclosed_issue_count')"
        />
        <el-table-column
          sortable
          prop="closed_issue_count"
          :label="$t('Dashboard.ADMIN.ProjectList.closed_issue_count')"
        />
        <el-table-column sortable prop="member_count" :label="$t('Dashboard.ADMIN.ProjectList.member_count')" />
        <el-table-column sortable prop="expired_day" :label="$t('Dashboard.ADMIN.ProjectList.expired_day')" />
        <el-table-column sortable prop="end_date" :label="$t('Dashboard.ADMIN.ProjectList.end_date')" />
      </el-table>
      <pagination
        v-if="inDialog"
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
    </component>
    <el-dialog v-if="!inDialog" :visible.sync="detailDialog" :title="$t('Dashboard.ADMIN.ProjectList.NAME')" top="3vh">
      <admin-project-list :data="getProjectListDetailData" :in-dialog="true" />
    </el-dialog>
  </el-row>
</template>

<script>
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import { getProjectListDetail } from '@/api/dashboard'
import ProjectStatus from './widget/ProjectStatus'

export default {
  name: 'AdminProjectList',
  components: { ProjectStatus },
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    data: {
      type: Function,
      default: () => []
    },
    inDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10
      },
      detailDialog: false,
      detailData: [],
      searchKeys: ['project_name', 'owner_name'],
      searchStatus: '',
      reload: 0
    }
  },
  computed: {
    showShadow() {
      return this.inDialog ? 'el-card' : 'div'
    },
    tableData() {
      return this.inDialog ? this.pagedData : this.listData
    },
    tableHeight() {
      return this.inDialog ? 'calc(100vh - 370px)' : '500px'
    }
  },
  watch: {
    searchStatus(value) {
      this.filterData(value)
    }
  },
  methods: {
    async loadData() {
      this.listLoading = true
      const data = await this.data()
      this.listData = data
      this.$emit('update', this.listData[0].sync_date)
      this.detailData = data
      this.listLoading = false
    },
    filterData(value) {
      if (value) {
        this.listData = this.detailData.filter(item => item.project_status === value)
      } else {
        this.listData = this.detailData
      }
    },
    onSortChange(sort) {
      const { prop, order } = sort
      let orderSign = 1
      switch (order) {
        case 'descending':
          orderSign = -1
          break
        default:
          orderSign = 1
          break
      }
      this.listData = this.listData.sort((a, b) =>
        a[prop] > b[prop] ? orderSign : b[prop] > a[prop] ? -1 * orderSign : 0
      )
    },
    tableRowClassName({ row }) {
      if (row.project_status === 'overdue') {
        return 'danger-row'
      }
      return ''
    },
    async getProjectListDetailData() {
      return getProjectListDetail().then(res => Promise.resolve(res.data))
    }
  }
}
</script>
