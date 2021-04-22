<template>
  <div v-loading="isLoading" class="app-container">
    <div class="clearfix">
      <div>
        <project-list-selector />
      </div>
    </div>
    <el-divider />
    <el-timeline>
      <el-timeline-item v-for="item in projectIssueList" :key="item.index" :timestamp="item.date" placement="top">
        <el-card v-for="issue in item.issues" :key="issue.id" :gutter="20" class="timeline-item">
          <el-row class="issue-row">
            <el-col :span="5" class="el-col-title">
              <span class="issue-name">{{ issue.issue_name }}</span>
              <span class="issue-date">{{ issue.updated_on | hmA }}, {{ issue.updated_on | relativeTime }}</span>
            </el-col>
            <el-col :span="15" class="el-col-content">
              <p>{{ issue.description || '-' }}</p>
            </el-col>
            <el-col :span="2" class="el-col-account">
              <el-tag class="el-tag--circle el-tag-account" effect="dark">
                <i class="el-icon-s-custom" />
                {{ issue.assigned_to || '-' }}
              </el-tag>
            </el-col>
          </el-row>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '../components/ProjectListSelector'
import { getProjectIssueListByDate } from '@/api/projects'

export default {
  name: 'ProjectActivityLog',
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
  data: () => ({
    projectIssueList: [],
    isLoading: true,
    projectList: []
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      const projectIssueListRes = await getProjectIssueListByDate(this.selectedProjectId)
      this.isLoading = false
      this.projectIssueList = Object.keys(projectIssueListRes.data).map((item, index) => {
        return {
          index: index,
          date: item,
          issues: projectIssueListRes.data[item].sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-timeline-item__timestamp {
  color: #3ecbbc;
  font-size: 16px;
}
</style>
