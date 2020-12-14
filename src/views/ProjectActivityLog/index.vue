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
          <el-card v-for="issue in item.issues" :key="issue.id" :gutter="20" class="timeline-item">
            <el-row class="issue-row">
              <el-col :span="5" class="el-col-title">
                <span class="issue-name">{{ issue.issue_name }}</span>
                <span class="issue-date">{{ issue.updated_on | hmA }}, {{ issue.updated_on | relativeTime }}</span>
              </el-col>
              <el-col :span="17" class="el-col-content">
                <p>{{ issue.description || '-' }}</p>
              </el-col>
              <el-col :span="2" class="el-col-account">
                <el-tag class="el-tag-account">
                  <i class="el-icon-s-custom" />
                  {{ issue.assigned_to || '-' }}
                </el-tag>
              </el-col>
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