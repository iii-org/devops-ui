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
      @update="updateIssueTables"
    />

    <TabsHeader
      :tabs="tabs"
      :active-tab.sync="activeTab"
    />

    <el-tabs v-model="activeTab">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.id"
        :name="tab.id"
        :label="tab.name"
      >
        <IssueTable
          :ref="tab.id"
          :from="tab.id"
          :project-id="projectId"
          :filter-conditions-props="filterConditions"
          :display-closed-props="displayClosedIssue"
          :keyword-props="keyword"
          @total="updateTotalCount(tab.id, $event)"
        />
      </el-tab-pane>
    </el-tabs>

    <CreateProjectDialog
      ref="createProjectDialog"
      v-permission="['Administrator', 'Project Manager']"
      @update="$router.push({name: 'project-list'})"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { CreateProjectDialog } from '@/views/Overview/ProjectList/components'
import { PageHeader, QuickAddIssue, TabsHeader, IssueTable } from './components'

export default {
  name: 'MyWork',
  components: { PageHeader, QuickAddIssue, TabsHeader, IssueTable, CreateProjectDialog },
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
    ...mapGetters(['projectOptions'])
  },
  watch: {
    projectId(id) {
      this.setStoredData('workProjectId', this.projectId)
      if (id) {
        this.setSelectedProject(this.projectOptions.find((elm) => elm.id === id))
        localStorage.setItem('projectId', id)
      }
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
    updateIssueTables() {
      this.tabs.forEach((tab) => {
        this.$refs[tab.id][0].fetchData()
      })
    },
    async fetchStoredData() {
      let storedFilterValue, storedKeyword, storedDisplayClosed
      await Promise.all([this.getIssueFilter(), this.getKeyword(), this.getDisplayClosed()]).then((res) => {
        const [filterValue, keyword, displayClosed] = res.map((item) => item)
        storedFilterValue = filterValue
        storedKeyword = keyword
        storedDisplayClosed = displayClosed
      })
      return { storedFilterValue, storedKeyword, storedDisplayClosed }
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
>>> .el-tabs__header {
  display: none;
}
</style>
