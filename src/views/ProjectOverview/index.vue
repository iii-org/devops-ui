<template>
  <el-row v-loading="isLoading" class="app-container">
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
        <WorkloadCard
          ref="issuePriority"
          :statistics-obj="statisticsObj"
          class="cursor-point"
          @emitSelectedItem="handleSelectedItem"
          @showFullIssuePriority="showFullIssuePriority"
        />
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
    <el-dialog :visible.sync="fullIssuePriority" class="fullscreen" top="5vh">
      <WorkloadCard :key="reload" :statistics-obj="statisticsObj" :save-selected-item="saveSelectedItem" />
    </el-dialog>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getProjectVersion, getProjectIssueProgress, getProjectIssueStatistics, getProjectTest } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'
import { IssueStatusCard, WorkloadCard, ProjectUserCard, TestStatusCard } from './components'

export default {
  name: 'ProjectOverview',
  components: { ProjectListSelector, IssueStatusCard, WorkloadCard, ProjectUserCard, TestStatusCard },
  data: () => ({
    versionList: [],
    selectedVersion: null,
    isLoading: false,
    isLoadingVersion: false,
    progressObj: {},
    statisticsObj: {},
    userList: [],
    projectTestObj: {},
    isProjectTestList: false,
    fullIssuePriority: false,
    reload: 0,
    saveSelectedItem: ''
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
    },
    showFullIssuePriority() {
      this.fullIssuePriority = true
      this.reload += 1
    },
    handleSelectedItem (val) {
      this.saveSelectedItem = val
    }
  }
}
</script>

<style lang="scss" scoped>
.fullscreen > .el-dialog {
  width: 90%;
}
.cursor-point {
  cursor: pointer;
}
</style>
