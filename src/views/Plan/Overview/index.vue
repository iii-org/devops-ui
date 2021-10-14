<template>
  <el-row id="project-overview" v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container" :gutter="10">
    <el-backtop target="#project-overview" />
    <project-list-selector>
      <el-select
        v-show="filterVisible"
        ref="selectVersion"
        v-model="selectedVersion"
        :loading="isLoadingVersion"
        :disabled="isLoading"
        :placeholder="$t('Version.SelectVersion')"
        clearable
        filterable
        @clear="clearSelectedVersion"
        @change="onBlurSelectedVersion"
      >
        <el-option v-for="item in versionList" :key="item.id" :label="getSelectionLabel(item)" :value="item.id" />
      </el-select>
      <el-button v-show="!filterVisible" icon="el-icon-s-operation" type="text" @click="onFilterSelection"> {{ listFilter }}
        <em class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <template v-if="selectedVersion!==null">
        <el-divider direction="vertical" />
        <el-button size="small" icon="el-icon-close" @click="clearSelectedVersion">
          {{ $t('Issue.CleanFilter') }}
        </el-button>
      </template>
    </project-list-selector>
    <el-divider />
    <el-row :gutter="10">
      <el-col :xs="24" :md="12">
        <IssueTrackingStatusCard ref="issueStatus" :progress-obj="progressObj" />
      </el-col>
      <el-col :xs="24" :md="12">
        <WorkloadCard
          ref="issuePriority"
          :statistics-obj="statisticsObj"
          @emitSelectedItem="handleSelectedItem"
          @showFullIssuePriority="showFullIssuePriority"
        />
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :md="12">
        <ProjectUsersCard ref="projectUserList" :user-list="userList" />
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
    <el-dialog :visible.sync="fullIssuePriority" top="5vh" width="90%">
      <WorkloadCard :statistics-obj="statisticsObj" :save-selected-item="saveSelectedItem" />
    </el-dialog>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getProjectVersion, getProjectIssueProgress, getProjectIssueStatistics, getProjectTest } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'
import { IssueTrackingStatusCard, WorkloadCard, ProjectUsersCard, TestStatusCard } from './components'

export default {
  name: 'ProjectOverview',
  components: { ProjectListSelector, IssueTrackingStatusCard, WorkloadCard, ProjectUsersCard, TestStatusCard },
  data() {
    return {
      versionList: [],
      filterVisible: false,
      selectedVersion: null,
      isLoading: false,
      isLoadingVersion: false,
      progressObj: {},
      statisticsObj: {},
      userList: [],
      projectTestObj: {},
      isProjectTestList: false,
      fullIssuePriority: false,
      saveSelectedItem: ''
    }
  },
  computed: {
    ...mapGetters(['userProjectList', 'selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    listFilter() {
      if (!this.selectedVersion || this.selectedVersion === '') return this.$t('general.Filter')
      return this.$t('general.Filter') + ':' + this.getSelectionLabel(this.versionList.find((item) => (item.id === this.selectedVersion)))
    }
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
      if (this.selectedProjectId < 0) return
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
      if (this.selectedProjectId < 0) return
      this.isLoadingVersion = true
      const res = await getProjectVersion(this.selectedProjectId)
      this.isLoadingVersion = false
      const hasVersion = res.data.versions.length > 0
      if (hasVersion) {
        this.versionList = res.data.versions
      } else {
        this.clearSelectedVersion()
        this.versionList = []
      }
    },
    onFilterSelection() {
      this.filterVisible = true
      this.$nextTick(() => {
        this.$refs['selectVersion'].$refs['reference'].$el.children[0].focus()
        this.$refs['selectVersion'].toggleMenu()
      })
    },
    onBlurSelectedVersion() {
      this.filterVisible = false
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
      this.$forceUpdate()
    },
    handleSelectedItem(val) {
      this.saveSelectedItem = val
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    }
  }
}
</script>
