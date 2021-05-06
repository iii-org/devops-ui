<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <el-col>
      <div class="d-flex">
        <project-list-selector />
      </div>
      <el-divider />
      <el-timeline v-if="projectIssueList.length > 0">
        <el-timeline-item v-for="item in projectIssueList" :key="item.index" :timestamp="item.date" placement="top">
          <el-card v-for="issue in item.issues" :key="issue.id" :gutter="20" class="mb-3">
            <el-row type="flex" align="middle" :gutter="20">
              <el-col :span="5" :lg="5" :xl="3">
                <div class="text text-subtitle-1 font-weight-bold cursor-pointer mb-1" @click="onClick(issue.id)">
                  {{ issue.name }}
                </div>
                <div>
                  <svg-icon icon-class="mdi-clock-outline" />
                  {{ issue.updated_on | hmA }}, {{ issue.updated_on | relativeTime }}
                </div>
              </el-col>
              <el-col :span="13" :lg="15" :xl="18">
                <div class="text-subtitle-2">{{ issue.description || '-' }}</div>
              </el-col>
              <el-col :span="6" :lg="4" :xl="3">
                <el-row type="flex" align="middle">
                  <el-col :span="5" :sm="4">
                    <i class="text-success el-icon-user-solid pr-2" />
                  </el-col>
                  <el-col :span="19" :sm="20">
                    {{
                      Object.keys(issue.assigned_to).length === 0
                        ? '-'
                        : `${issue.assigned_to.name} (${issue.assigned_to.login})`
                    }}
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div v-else class="text-center">
        {{ $t('general.NoData') }}
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectIssueListByDate } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'

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
  data() {
    return {
      isLoading: true,
      projectIssueList: []
    }
  },
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
      const res = await getProjectIssueListByDate(this.selectedProjectId)
      this.projectIssueList = Object.keys(res.data).map((item, index) => ({
        index: index,
        date: item,
        issues: res.data[item].sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on))
      }))
      this.isLoading = false
    },
    onClick(issueId) {
      this.$router.push({ name: 'issue-detail', params: { issueId }})
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
