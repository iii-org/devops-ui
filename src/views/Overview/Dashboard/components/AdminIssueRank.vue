<template>
  <el-col v-loading="listLoading">
    <el-col>
      <el-table :data="pagedData" cell-class-name="align-center" row-class-name="pointer" header-cell-class-name="align-center" @row-click="showUnclosedIssuesDetail">
        <el-table-column prop="user_name" :label="$t('Dashboard.ADMIN.IssueRank.user_name')" />
        <el-table-column prop="unclosed_count" :label="$t('Dashboard.ADMIN.IssueRank.unclosed_count')" />
        <el-table-column prop="project_count" :label="$t('Dashboard.ADMIN.IssueRank.project_count')" />
      </el-table>
    </el-col>
    <el-dialog :visible.sync="unclosedIssuesDialog" :title="$t('Dashboard.ADMIN.IssueRank.DETAIL', [issueRankDetail['user_name']])" @close="closeHandler">
      <admin-issue-rank-unclosed-issues :detail="issueRankDetail" :user="listData" @update-detail="updateUnclosedIssuesDetail" />
    </el-dialog>
    <!--    <el-dialog :visible.sync="involvedProjectsDialog" :title="issueRankDetail['user_name'] +' - 參與專案'" @close="closeHandler">-->
    <!--      <admin-issue-rank-involved-projects :detail="issueRankDetail" />-->
    <!--    </el-dialog>-->
  </el-col>
</template>

<script>
import {
  getInvolvedProjects,
  getUnclosedIssues
} from '@/api/dashboard'
import MixinBasicTable from '@/components/MixinBasicTable'
import AdminIssueRankUnclosedIssues from './widget/AdminIssueRankUnclosedIssues'

export default {
  name: 'AdminProjectMember',
  components: {
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
    async showUnclosedIssuesDetail(row) {
      this.unclosedIssuesDialog = true
      this.issueRankDetail = row
      this.$set(this.issueRankDetail, 'unclosedIssues', this.getUnclosedIssuesData)
    },
    updateUnclosedIssuesDetail(id) {
      this.issueRankDetail = this.listData.find((item) => (item.user_id === id))
      this.$set(this.issueRankDetail, 'unclosedIssues', this.getUnclosedIssuesData)
    },
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

<style lang="scss" scoped>
// noinspection
>>>.pointer{
  cursor: pointer;
}
</style>
