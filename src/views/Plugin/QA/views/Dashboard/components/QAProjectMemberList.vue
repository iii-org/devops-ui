<template>
  <el-row v-loading="listLoading">
    <el-row v-if="inDialog" type="flex" align="middle">
      <el-col :span="12">
        <!--        <el-select v-model="searchStatus" value-key="user_id">-->
        <!--          <el-option label="全部" value="" />-->
        <!--          <el-option label="已超時" value="Overdue" />-->
        <!--          <el-option label="時限內" value="Started" />-->
        <!--          <el-option label="未開始" value="Not_Started" />-->
        <!--        </el-select>-->
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
    <component :is="showShadow">
      <el-table v-loading="listLoading" :data="pagedData" :row-class-name="tableRowClassName" cell-class-name="align-center"
                header-cell-class-name="align-center"
                @sort-change="onSortChange"
      >
        <el-table-column prop="department" label="部門" />
        <el-table-column prop="user_name" :label="$t('Dashboard.ADMIN.IssueRank.user_name')" />
        <el-table-column prop="project_count" :label="$t('Dashboard.ADMIN.IssueRank.project_count')" />
        <el-table-column prop="unclosed_count" :label="$t('Dashboard.ADMIN.IssueRank.unclosed_count')" />
        <el-table-column prop="closed_count" label="已解決數" />
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
    <el-dialog v-if="!inDialog" :visible.sync="detailDialog" :title="$t('Dashboard.ADMIN.ProjectList.NAME')">
      <QAProjectMemberList :data="getIssueRankData" :in-dialog="true" />
    </el-dialog>
  </el-row>
</template>

<script>
import { getIssueRank } from '@/api/dashboard'
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'

export default {
  name: 'QAProjectMemberList',
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    data: {
      type: Function,
      default: () => ([])
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
      searchKeys: ['user_name'],
      searchStatus: '',
      keyword: '',
      reload: 0
    }
  },
  computed: {
    showShadow() {
      return (this.inDialog) ? 'el-card' : 'div'
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
      data.map((item) => {
        item.department = '數位所/平台中心'
        item.closed_count = (Math.random() * 100).toFixed(0)
        return item
      })
      this.listData = data
      this.detailData = data
      this.listLoading = false
      this.filterData('')
    },
    filterData(value) {
      if (value) {
        this.listData = this.detailData.filter((item) => (item.project_status === value))
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
      this.listData = this.listData.sort((a, b) => (a[prop] > b[prop]) ? orderSign : ((b[prop] > a[prop]) ? -1 * orderSign : 0))
    },
    tableRowClassName({ row }) {
      if (row.project_status === 'Overdue') {
        return 'danger-row'
      }
      return ''
    },
    getIssueRankData() {
      return getIssueRank()
        .then((res) => {
          return Promise.resolve(res.data)
        })
    }
  }
}
</script>

<style scoped>

</style>
