<template>
  <el-col v-loading="listLoading">
    <el-col>
      <el-table
        :data="listData"
        cell-class-name="align-center"
        row-class-name="cursor-pointer"
        header-cell-class-name="align-center"
        @row-click="showUnclosedIssuesDetail"
      >
        <el-table-column prop="user_name" :label="$t('Dashboard.ADMIN.IssueRank.user_name')">
          <template slot-scope="scope">
            {{ `${scope.row.user_name} (${scope.row.user_login})` }}
          </template>
        </el-table-column>
        <el-table-column prop="unclosed_count" :label="$t('Dashboard.ADMIN.IssueRank.unclosed_count')" />
        <el-table-column prop="project_count" :label="$t('Dashboard.ADMIN.IssueRank.project_count')" />
      </el-table>
    </el-col>
    <el-dialog
      :visible.sync="unclosedIssuesDialog"
      :title="$t('Dashboard.ADMIN.IssueRank.DETAIL', [issueRankDetail['user_name']])"
      top="3vh"
      @close="closeHandler"
    >
      <admin-issue-rank-unclosed-issues
        :detail="issueRankDetail"
        :user="listData"
        @update-detail="updateUnclosedIssuesDetail"
      />
    </el-dialog>
    <!--    <el-dialog :visible.sync="involvedProjectsDialog" :title="issueRankDetail['user_name'] +' - 參與專案'" @close="closeHandler">-->
    <!--      <admin-issue-rank-involved-projects :detail="issueRankDetail" />-->
    <!--    </el-dialog>-->
  </el-col>
</template>

<script>
import { getUnclosedIssues } from '@/api/dashboard'
import { BasicData } from '@/newMixins'
import AdminIssueRankUnclosedIssues from './widget/AdminIssueRankUnclosedIssues'

export default {
  name: 'AdminIssueRank',
  components: {
    AdminIssueRankUnclosedIssues
  },
  mixins: [BasicData],
  props: {
    data: {
      type: Function,
      default: () => []
    }
  },
  data() {
    return {
      issueRankDetail: {},
      involvedProjectsDialog: false,
      unclosedIssuesDialog: false,
      searchKeys: ['user_name']
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
    async showUnclosedIssuesDetail(row) {
      this.unclosedIssuesDialog = true
      this.issueRankDetail = row
      this.$set(this.issueRankDetail, 'unclosedIssues', this.getUnclosedIssuesData)
    },
    updateUnclosedIssuesDetail(id) {
      this.issueRankDetail = this.listData.find(item => item.user_id === id)
      this.$set(this.issueRankDetail, 'unclosedIssues', this.getUnclosedIssuesData)
    },
    closeHandler() {
      this.keyword = ''
    },
    async getUnclosedIssuesData(id) {
      const res = await getUnclosedIssues(id)
      return await Promise.resolve(res.data)
    }

    // onClickChart(row) {
    //   this.detailDialog = true
    //   this.keyword = row.name
    // },
    // getInvolvedProjectsData(id) {
    //   return getInvolvedProjects(id).then(res => {
    //     return Promise.resolve(res.data)
    //   })
    // },
  }
}
</script>
