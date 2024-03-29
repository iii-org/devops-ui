<template>
  <div class="app-container">
    <PageHeader
      :project-id.sync="projectId"
      :filter-conditions.sync="filterConditions"
      :keyword.sync="keyword"
      :display-closed-issue.sync="displayClosedIssue"
      :display-closed-version.sync="displayClosedVersion"
      :active-tab.sync="activeTab"
      @create-project="handleCreateProjectClick"
      @add-issue="showQuickAddIssue = !showQuickAddIssue"
    />

    <el-divider />

    <QuickAddIssue
      :project-id="projectId"
      :visible.sync="showQuickAddIssue"
      :filter-conditions="filterConditions"
      @close="showQuickAddIssue = false"
      @update="updateIssueTables"
    />
    <el-tabs v-model="activeTab">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.id"
        :name="tab.id"
      >
        <span slot="label">
          <span>{{ $t(`MyWork.${tab.name}`) }}</span>
          <span class="text-lg font-bold">
            ({{ tab.count !== '-' ? tab.count : 0 }})
          </span>
        </span>
        <IssueTable
          :ref="tab.id"
          :from="tab.id"
          :project-id="projectId"
          :filter-conditions-props="filterConditions"
          :display-closed-props="displayClosedIssue"
          :keyword-props="keyword"
          :show-quick-add-issue="showQuickAddIssue"
          @update="updateIssueTables"
          @total="updateTotalCount(tab.id, $event)"
        />
      </el-tab-pane>
    </el-tabs>

    <CreateProjectDialog
      ref="createProjectDialog"
      v-permission="['Administrator', 'Project Manager']"
      @update="$router.push({name: 'ProjectList'})"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { CreateProjectDialog } from '@/views/Overview/ProjectList/components'
import { PageHeader, QuickAddIssue, IssueTable } from './components'

export default {
  name: 'MyWork',
  components: { PageHeader, QuickAddIssue, IssueTable, CreateProjectDialog },
  data() {
    return {
      projectId: null,
      filterConditions: {},
      displayClosedIssue: false,
      displayClosedVersion: false,
      keyword: '',

      showQuickAddIssue: false,

      tabs: [
        { id: 'assigned_to_id', name: 'AssignedToMe', count: '-' },
        { id: 'author_id', name: 'ReportedIssue', count: '-' }
      ],
      activeTab: 'assigned_to_id'
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'userId'])
  },
  watch: {
    projectId(id) {
      this.setStoredData('workProjectId', this.projectId)
      if (id) {
        this.setSelectedProject(this.projectOptions.find((elm) => elm.id === id))
        localStorage.setItem('projectId', id)
      } else {
        this.clearFilter()
        this.$router.push({ name: this.$route.name })
        sessionStorage.removeItem('workProjectId')
        return
      }
      const projectName = this.projectOptions.find((elm) => elm.id === this.projectId).name
      this.clearFilter()
      this.$router.push({ name: this.$route.name, params: { projectName }})
    },
    filterConditions: {
      handler() {
        this.onFilterChanged()
      },
      deep: true
    },
    displayClosedIssue() {
      this.onFilterChanged()
    },
    keyword() {
      this.onFilterChanged()
    },
    activeTab(value) {
      this.setStoredData('activeTab', value)
    },
    displayClosedVersion(value) {
      this.setStoredData('displayClosedVersion', value)
    }
  },
  mounted() {
    this.getStoredData()
  },
  methods: {
    ...mapActions('projects', [
      'getIssueFilter',
      'getKeyword',
      'getDisplayClosed',
      'setKeyword',
      'setIssueFilter',
      'setDisplayClosed',
      'setSelectedProject'
    ]),
    handleCreateProjectClick() {
      this.$refs.createProjectDialog.showDialog = true
      this.$refs.createProjectDialog.refreshTemplate()
    },
    updateTotalCount(tabId, $event) {
      this.tabs.find((tab) => tab.id === tabId).count = $event
    },
    updateIssueTables(assignedToId) {
      if (assignedToId !== undefined && this.userId !== assignedToId) this.activeTab = 'author_id'
      this.tabs.forEach((tab) => {
        this.$refs[tab.id][0].fetchData()
      })
    },
    async fetchStoredData() {
      let storedFilterValue, storedKeyword, storedDisplayClosed
      await Promise.all([this.getIssueFilter(), this.getKeyword(), this.getDisplayClosed()]).then((res) => {
        const [filterValue, keyword, displayClosed] = res
        storedFilterValue = filterValue
        storedKeyword = keyword
        storedDisplayClosed = displayClosed
      })
      return { storedFilterValue, storedKeyword, storedDisplayClosed }
    },
    clearFilter() {
      this.clearKeyword()
      this.clearIssueFilter()
      this.clearDisplayClosed()
      this.clearDisplayClosedVersion()
    },
    clearKeyword() {
      this.keyword = ''
      this.setStoredData('keyword', JSON.stringify({ work: '' }))
    },
    clearIssueFilter() {
      Object.assign({}, this.filterConditions)
      this.setStoredData('issueFilter', JSON.stringify({ work: {}}))
    },
    clearDisplayClosed() {
      this.displayClosedIssue = false
      this.setStoredData('displayClosed', JSON.stringify({ work: false }))
    },
    clearDisplayClosedVersion() {
      this.displayClosedVersion = false
      this.setStoredData('displayClosedVersion', false)
    },
    async getStoredData() {
      const key = 'work'
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
      if (storedFilterValue[key]) this.$set(this, 'filterConditions', storedFilterValue[key])
      if (storedKeyword[key]) this.keyword = storedKeyword[key]
      if (storedDisplayClosed[key]) this.displayClosedIssue = storedDisplayClosed[key]
      this.getMyWorkStoredData()
    },
    async onFilterChanged() {
      const key = 'work'
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
      storedFilterValue[key] = this.filterConditions
      storedKeyword[key] = this.keyword
      storedDisplayClosed[key] = this.displayClosedIssue
      await this.setIssueFilter(storedFilterValue)
      await this.setKeyword(storedKeyword)
      await this.setDisplayClosed(storedDisplayClosed)
    },
    setStoredData(key, value) {
      sessionStorage.setItem(key, value)
    },
    getMyWorkStoredData() {
      const storedProjectId = Number(sessionStorage.getItem('workProjectId'))
      const storedActiveTab = sessionStorage.getItem('activeTab')
      const storedDisplayClosedVersion = JSON.parse(sessionStorage.getItem('displayClosedVersion'))
      if (storedProjectId) this.projectId = storedProjectId
      if (storedActiveTab) this.activeTab = storedActiveTab
      if (storedDisplayClosedVersion) this.displayClosedVersion = storedDisplayClosedVersion
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

::v-deep .el-tabs__header {
  margin: 0;
  .el-tabs__item.is-active {
    background: #e4ecf7 ;
    color: #3e3f41;
    border-top: 5px solid #3e3f41;
    border-bottom-color: #e4ecf7 ;
    height: 45px;
    font-size: 16px;
  }
  .el-tabs__nav {
    border: none;
  }
  .el-tabs__item {
    padding: 0 0 0 20px;
    background: #3e3f41;
    color: #e4ecf7 ;
    border-radius: 5px;
    width: 125%;
    &:hover {
      color: $linkTextColor;
    }
    &.is-top:nth-child(2) {
      padding: 0 0 0 20px;
    }
  }
}

::v-deep .el-tabs__active-bar {
  display: none;
}

::v-deep .el-tabs__content {
  background: #e4ecf7 ;
  border-radius: 3px;
}

::v-deep .el-tab-pane {
  margin: 15px;
  background: #e4ecf7 ;
}
</style>
