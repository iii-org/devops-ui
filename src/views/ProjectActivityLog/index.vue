<template>
  <div v-loading="isLoading" class="app-container">
    <div class="clearfix">
      <div>
        <project-list-selector />
      </div>
    </div>
    <el-divider />
    <div class="block" style="margin-top: 10px">
      <el-timeline>
        <el-timeline-item v-for="item in projectIssueList" :key="item.index" :timestamp="item.date" placement="top">
          <el-card>
            <el-row v-for="issue in item.issues" :key="issue.id" :gutter="20" class="issue-row">
              <el-col :span="4">
                <span class="issue-name">{{ issue.issue_name }}</span>
              </el-col>
              <el-col :span="16">
                {{ issue.description || '-' }}
              </el-col>
              <el-col :span="4">
                <el-tag><i class="el-icon-s-custom" /> {{ issue.assigned_to || '-' }} </el-tag></el-col
              >
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getActivityLog, getProjectList } from '@/api/projects'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectIssueListByDate } from '@/api/projects'
export default {
  components: {
    ProjectListSelector
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      projectIssueList: [],
      isLoading: true,
      projectList: []
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId'])
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      const projectIssueListRes = await getProjectIssueListByDate(this.projectSelectedId)
      this.isLoading = false
      this.projectIssueList = Object.keys(projectIssueListRes.data).map((item, index) => {
        const data = { index: index, date: item, issues: projectIssueListRes.data[item] }
        return data
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.issue-row {
  margin: 5px 0px;
  background: #f7f7f7;
  padding: 5px;
  height: 42px;
  line-height: 32px;
}
.issue-name {
  font-size: 15px;
  font-weight: 800;
  color: #4f4f4f;
  display: flex;
  align-items: center;
}
</style>