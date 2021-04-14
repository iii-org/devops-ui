<template>
  <el-col v-loading="listLoading">
    <el-col>
      <el-table :data="pagedData" cell-class-name="align-center" header-cell-class-name="align-center">
        <el-table-column prop="user_name" label="專案成員" />
        <el-table-column prop="unclosed_count" label="尚待解決">
          <template slot-scope="scope">
            <el-link type="primary" @click="showUnclosedIssuesDetail(scope.row)">{{ scope.row.unclosed_count }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="project_count" label="專案參與數">
          <template slot-scope="scope">
            <el-link type="primary" @click="showInvolvedProjectsDetail(scope.row)">{{ scope.row.project_count }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <!--    <el-dialog :visible.sync="detailDialog">-->
    <!--      <template slot="title">-->
    <!--        <span class="el-dialog__title">專案總覽</span>-->
    <!--      </template>-->
    <!--      <el-row>-->
    <!--        <el-col :span="12">-->
    <!--          <el-input-->
    <!--            v-model="keyword"-->
    <!--            class="ob-search-input ob-shadow search-input"-->
    <!--            style="width: 250px"-->
    <!--            :placeholder="$t('Project.SearchProjectName')"-->
    <!--            clearable-->
    <!--          />-->
    <!--        </el-col>-->
    <!--        <el-col :span="12" class="text-right">-->
    <!--          統計日期：-->
    <!--        </el-col>-->
    <!--      </el-row>-->
    <!--      <el-table v-if="listData.length>0" ref="tableData"-->
    <!--                :data="pagedData"-->
    <!--                row-key="project_id"-->
    <!--                @row-click="rowClicked"-->
    <!--                @expand-change="loadMembers"-->
    <!--      >-->
    <!--        <el-table-column type="expand">-->
    <!--          <template slot-scope="props">-->
    <!--            <el-table :key="reload"-->
    <!--                      v-loading="props.row.loading"-->
    <!--                      :data="props.row.children"-->
    <!--                      row-key="user_id"-->
    <!--            >-->
    <!--              <el-table-column-->
    <!--                label="角色"-->
    <!--                prop="role_name"-->
    <!--                sortable-->
    <!--              />-->
    <!--              <el-table-column-->
    <!--                label="專案成員"-->
    <!--                prop="user_name"-->
    <!--                sortable-->
    <!--              />-->
    <!--            </el-table>-->
    <!--          </template>-->
    <!--        </el-table-column>-->
    <!--        <el-table-column-->
    <!--          label="專案名稱"-->
    <!--          prop="project_name"-->
    <!--          sortable-->
    <!--        />-->
    <!--        <el-table-column-->
    <!--          label="專案經理"-->
    <!--          prop="pm_user_name"-->
    <!--          sortable-->
    <!--        />-->
    <!--        <el-table-column-->
    <!--          label="參與人數"-->
    <!--          prop="member_count"-->
    <!--          sortable-->
    <!--        />-->
    <!--        <el-table-column-->
    <!--          label="專案起始日"-->
    <!--          prop="start_date"-->
    <!--          sortable-->
    <!--        />-->
    <!--        <el-table-column-->
    <!--          prop="end_date"-->
    <!--          label="專案結束日"-->
    <!--          sortable-->
    <!--        />-->
    <!--      </el-table>-->
    <!--      <pagination-->
    <!--        :total="filteredData.length"-->
    <!--        :page="listQuery.page"-->
    <!--        :limit="listQuery.limit"-->
    <!--        :page-sizes="[listQuery.limit]"-->
    <!--        :layout="'total, prev, pager, next'"-->
    <!--        @pagination="onPagination"-->
    <!--      />-->
    <!--    </el-dialog>-->
    <el-dialog :visible.sync="unclosedIssuesDialog" width="80%" :title="issueRankDetail['user_name'] +' - 待解決議題'" @close="closeHandler">
      <admin-issue-rank-unclosed-issues :detail="issueRankDetail" :user="listData" @update-detail="updateUnclosedIssuesDetail" />
    </el-dialog>
    <el-dialog :visible.sync="involvedProjectsDialog" width="80%" :title="issueRankDetail['user_name'] +' - 參與專案'" @close="closeHandler">
      <admin-issue-rank-involved-projects :detail="issueRankDetail" />
    </el-dialog>
  </el-col>
</template>

<script>
import {
  getInvolvedProjects,
  getUnclosedIssues
} from '@/api/dashboard'
import MixinBasicTable from '@/components/MixinBasicTable'
import AdminIssueRankInvolvedProjects from './widget/admin_issue-rank-involved-projects'
import AdminIssueRankUnclosedIssues from './widget/admin_issue-rank-unclosed-issues'

export default {
  name: 'AdminProjectMember',
  components: {
    AdminIssueRankInvolvedProjects,
    AdminIssueRankUnclosedIssues
  },
  mixins: [MixinBasicTable],
  props: {
    data: {
      type: Function,
      default: () => ([])
    }
  },
  data() {
    return {
      detailData: [],
      issueRankDetail: {},
      involvedProjectsDialog: false,
      unclosedIssuesDialog: false,
      searchKeys: ['user_name'],
      reload: 0
    }
  },
  watch: {
    data() {
      this.loadData()
    }
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.data()
      this.listLoading = false
    },
    async showInvolvedProjectsDetail(row) {
      this.involvedProjectsDialog = true
      this.issueRankDetail = row
      this.$set(this.issueRankDetail, 'involvedProjects', this.getInvolvedProjectsData)
    },
    async showUnclosedIssuesDetail(row) {
      this.unclosedIssuesDialog = true
      this.issueRankDetail = row
      this.$set(this.issueRankDetail, 'unclosedIssues', this.getUnclosedIssuesData)
    },
    updateUnclosedIssuesDetail(id) {
      this.issueRankDetail = this.listData.find((item) => (item.user_id === id))
      this.$set(this.issueRankDetail, 'unclosedIssues', this.getUnclosedIssuesData)
    },
    // loadMembers(row, expandedRows) {
    //   const _this = this
    //   row.loading = true
    //   getProjectMembersByProjectID(row.project_id)
    //     .then((res) => {
    //       row['children'] = res.data
    //     })
    //     .finally(() => {
    //       row.loading = false
    //       _this.reload += 1
    //     })
    // },
    onClickChart(row) {
      this.detailDialog = true
      this.keyword = row.name
    },
    closeHandler() {
      this.keyword = ''
    },
    getInvolvedProjectsData(id) {
      return getInvolvedProjects(id)
        .then((res) => {
          return Promise.resolve(res.data)
        })
    },
    getUnclosedIssuesData(id) {
      return getUnclosedIssues(id)
        .then((res) => {
          return Promise.resolve(res.data)
        })
    }
  }
}
</script>

<style scoped>
.chart {
  height: 100%;
  min-height: 250px;
}
</style>
