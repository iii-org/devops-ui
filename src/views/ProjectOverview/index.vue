<template>
  <div v-loading="isLoading" class="app-container">
    <div class="d-flex justify-start">
      <project-list-selector />
      <el-select
        v-model="selectedVersion"
        :loading="isLoadingVersion"
        :disabled="isLoading"
        :placeholder="$t('Version.SelectVersion')"
        clearable
        @clear="clearSelectedVersion"
      >
        <el-option v-for="version in versionList" :key="version.id" :label="version.name" :value="version.id" />
      </el-select>
    </div>
    <el-divider />
    <el-row :gutter="10">
      <el-col :xs="24" :md="12">
        <IssueStatusCard ref="issueStatus" :progress-obj="progressObj" />
      </el-col>
      <el-col :xs="24" :md="12">
        <IssuePriorityCard ref="issuePriority" :statistics-obj="statisticsObj" />
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :md="12">
        <ProjectUserCard ref="projectUserList" :user-list="userList" />
      </el-col>
      <el-col :xs="24" :md="12">
        <TestStatusCard
          ref="testStatus"
          :is-loading="isProjectTestList"
          :project-test-obj="projectTestObj"
          @update="updateProjectTestList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getProjectVersion, getProjectIssueProgress, getProjectIssueStatistics, getProjectTest } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'
import { IssuePriorityCard, IssueStatusCard, ProjectUserCard, TestStatusCard } from './components'

export default {
  name: 'ProjectOverviewNew',
  components: { ProjectListSelector, IssuePriorityCard, IssueStatusCard, ProjectUserCard, TestStatusCard },
  data: () => ({
    versionList: [],
    selectedVersion: null,
    isLoading: false,
    isLoadingVersion: false,
    progressObj: {},
    statisticsObj: {},
    userList: [],
    projectTestObj: {},
    isProjectTestList: false
  }),
  computed: {
    ...mapGetters(['userProjectList', 'selectedProjectId'])
  },
  watch: {
    selectedProjectId() {
      this.fetchVersionList()
      this.fetchAllData()
    },
    selectedVersion() {
      this.fetchAllData()
    }
  },
  mounted() {
    this.fetchVersionList()
    this.fetchAllData()
  },
  methods: {
    ...mapActions('projects', ['getProjectUserList']),
    async fetchAllData() {
      let param = {}
      if (this.projectVersion !== null) {
        param = { fixed_version_id: this.selectedVersion }
      }
      this.isLoading = true
      const res = await Promise.all([
        getProjectIssueProgress(this.selectedProjectId, param),
        getProjectIssueStatistics(this.selectedProjectId, param),
        this.getProjectUserList(this.selectedProjectId),
        getProjectTest(this.selectedProjectId)
      ])
      const [progressObj, statisticsObj, userList, projectTestObj] = res
      this.progressObj = progressObj.data
      this.statisticsObj = statisticsObj.data
      this.userList = userList.data.user_list
      this.projectTestObj = projectTestObj.data.test_results
      this.isLoading = false
    },
    async fetchVersionList() {
      this.isLoadingVersion = true
      const res = await getProjectVersion(this.selectedProjectId)
      this.isLoadingVersion = false
      const hasVersion = res.data.versions.length > 0
      if (hasVersion) {
        this.versionList = res.data.versions.map(version => ({ id: version.id, name: version.name }))
      } else {
        this.clearSelectedVersion()
        this.versionList = []
      }
    },
    clearSelectedVersion() {
      this.selectedVersion = null
    },
    async updateProjectTestList() {
      this.isProjectTestList = true
      const res = await getProjectTest(this.selectedProjectId)
      this.projectTestObj = res.data.test_results
      this.isProjectTestList = false
    }
  }
}
</script>
