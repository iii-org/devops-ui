<template>
  <div class="app-container">
    <PageHeader
      :project-id.sync="projectId"
      :filter-conditions.sync="filterConditions"
      :keyword.sync="keyword"
      :display-closed-issue.sync="displayClosedIssue"
      :display-closed-version.sync="displayClosedVersion"
      :active-tab="activeTab"
      @create-project="handleCreateProjectClick"
      @add-issue="showQuickAddIssue = !showQuickAddIssue"
    />

    <el-divider />

    <QuickAddIssue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="projectId"
      :visible.sync="showQuickAddIssue"
      @add-issue="advancedAddIssue"
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
import { QuickAddIssue } from '@/components/Issue'
import { CreateProjectDialog } from '@/views/Overview/ProjectList/components'
import { PageHeader, TabsHeader, IssueTable } from './components'
import { addIssue } from '@/api/issue'

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
  methods: {
    handleCreateProjectClick() {
      this.$refs.createProjectDialog.showDialog = true
      this.$refs.createProjectDialog.refreshTemplate()
    },
    updateTotalCount(tabId, $event) {
      this.tabs.find((tab) => tab.id === tabId).count = $event
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    async saveIssue(data) {
      return addIssue(data)
        .then((res) => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.backToFirstPage()
          this.loadData()
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.name = ''
          return res
        })
        .catch((error) => {
          return error
        })
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs__header {
  display: none;
}
</style>
