<script>
import { mapGetters, mapActions } from 'vuex'
import Fuse from 'fuse.js'
import { Kanban } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssueStatus, updateIssue } from '@/api/issue'
import { getProjectIssueListByStatus, getProjectIssueListByTree, getProjectVersion } from '@/api/projects'

export default {
  name: 'IssueBoards',
  components: {
    Kanban,
    ProjectListSelector
  },
  data: () => ({
    isLoading: true,
    issueStatusList: [],
    projectIssueList: [],
    activeList: [],
    assignedList: [],
    solvedList: [],
    respondedList: [],
    finishedList: [],
    closedList: [],
    group: 'mission',
    versionValue: '-1',
    memberValue: '-1',
    projectVersionList: [],
    projectUserList: '',
    relativeIssueList: []
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
      this.versionValue = '-1'
      this.memberValue = '-1'
    }
  },
  async created() {
    const issueStatusRes = await getIssueStatus()
    this.issueStatusList = issueStatusRes.data
    this.fetchData()
  },
  methods: {
    ...mapActions('projects', ['getProjectUserList']),
    searchKanbanCard(value, opt) {
      const fuseActive = new Fuse(this.activeList, opt)
      const resActive = fuseActive.search(`="${value}"`)
      this.activeList = resActive.map(items => items.item)

      const fuseAssign = new Fuse(this.assignedList, opt)
      const resAssign = fuseAssign.search(`="${value}"`)
      this.assignedList = resAssign.map(items => items.item)

      const fuseSolved = new Fuse(this.solvedList, opt)
      const resSolved = fuseSolved.search(`="${value}"`)
      this.solvedList = resSolved.map(items => items.item)

      const fuseRespond = new Fuse(this.respondedList, opt)
      const resRespond = fuseRespond.search(`="${value}"`)
      this.respondedList = resRespond.map(items => items.item)

      const fuseFinish = new Fuse(this.finishedList, opt)
      const resFinish = fuseFinish.search(`="${value}"`)
      this.finishedList = resFinish.map(items => items.item)

      const fuseClosed = new Fuse(this.closedList, opt)
      const resClosed = fuseClosed.search(`="${value}"`)
      this.closedList = resClosed.map(items => items.item)
    },
    resetKanbanCard() {
      this.issueStatusList.forEach(item => {
        if (item.name === 'Active') this.activeList = this.genKanbanCard('Active')
        if (item.name === 'Assigned') this.assignedList = this.genKanbanCard('Assigned')
        if (item.name === 'Solved') this.solvedList = this.genKanbanCard('Solved')
        if (item.name === 'Responded') this.respondedList = this.genKanbanCard('Responded')
        if (item.name === 'Finished') this.finishedList = this.genKanbanCard('Finished')
        if (item.name === 'Closed') this.closedList = this.genKanbanCard('Closed')
      })
    },
    genKanbanCard(status) {
      if (!this.projectIssueList[status]) return [] // 該status不存在issue回傳空array
      return this.projectIssueList[status].map(issue => {
        return {
          name: issue.issue_name,
          id: issue.id,
          date: issue.due_date,
          user: issue.assigned_to,
          version: issue.fixed_version_id,
          parent_id: issue.parent_id
        }
      })
    },
    async fetchData() {
      this.isLoading = true
      const projectIssueListRes = await getProjectIssueListByStatus(this.selectedProjectId)

      const versionsRes = await getProjectVersion(this.selectedProjectId)
      this.projectVersionList = versionsRes.data.versions

      const userRes = await this.getProjectUserList(this.selectedProjectId)
      this.projectUserList = userRes.data.user_list

      this.isLoading = false
      this.projectIssueList = projectIssueListRes.data // 取得project全部issue by status
      this.issueStatusList.forEach(item => {
        if (item.name === 'Active') this.activeList = this.genKanbanCard('Active')
        if (item.name === 'Assigned') this.assignedList = this.genKanbanCard('Assigned')
        if (item.name === 'Solved') this.solvedList = this.genKanbanCard('Solved')
        if (item.name === 'Responded') this.respondedList = this.genKanbanCard('Responded')
        if (item.name === 'Finished') this.finishedList = this.genKanbanCard('Finished')
        if (item.name === 'Closed') this.closedList = this.genKanbanCard('Closed')
      })
      this.updateRelativeList()
    },
    async updateRelativeList() {
      this.isLoading = true
      await getProjectIssueListByTree(this.selectedProjectId).then(res => {
        this.relativeIssueList = this.createRelativeList(res.data)
      })
      this.isLoading = false
    },
    async updateIssueStatus(evt) {
      this.isLoading = true
      const { to, newIndex } = evt
      let issue = {}
      let newStatusId = 0
      if (to.className.search('Active') !== -1) issue = this.activeList[newIndex]
      if (to.className.search('Assigned') !== -1) issue = this.assignedList[newIndex]
      if (to.className.search('Solved') !== -1) issue = this.solvedList[newIndex]
      if (to.className.search('Responded') !== -1) issue = this.respondedList[newIndex]
      if (to.className.search('Finished') !== -1) issue = this.finishedList[newIndex]
      if (to.className.search('Closed') !== -1) issue = this.closedList[newIndex]
      this.issueStatusList.forEach(item => {
        if (to.className.search(item.name) !== -1) {
          newStatusId = item.id
        }
      })
      if (issue.id && newStatusId !== 0) {
        await updateIssue(issue.id, { status_id: newStatusId })
      }
      this.updateRelativeList()
      this.isLoading = false
    },
    updateData() {
      this.resetKanbanCard()
      const versionOpt = {
        keys: ['version'],
        useExtendedSearch: true
      }
      const userOpt = {
        keys: ['user'],
        useExtendedSearch: true
      }
      if (this.versionValue !== '-1' && this.memberValue === '-1') {
        this.searchKanbanCard(this.versionValue, versionOpt)
      }
      if (this.versionValue === '-1' && this.memberValue !== '-1') {
        this.searchKanbanCard(this.memberValue, userOpt)
      }
      if (this.versionValue !== '-1' && this.memberValue !== '-1') {
        this.searchKanbanCard(this.versionValue, versionOpt)
        this.searchKanbanCard(this.memberValue, userOpt)
      }
    },
    createRelativeList(list) {
      const result = []
      function flatList(parent) {
        for (let i = 0; i < parent.length; i++) {
          result.push(parent[i])
          const children = parent[i].children
          if (parent[i].children.length) flatList(children)
        }
      }
      flatList(list)
      return result
    }
  }
}
</script>

<template>
  <div v-loading="isLoading" class="app-container">
    <div class="clearfix">
      <div>
        <project-list-selector />

        <el-select
          v-model="versionValue"
          :placeholder="$t('Version.SelectVersion')"
          :disabled="selectedProjectId === -1"
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />
          <el-option v-for="item in projectVersionList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <el-select
          v-model="memberValue"
          :placeholder="$t('Member.SelectMember')"
          :disabled="selectedProjectId === -1"
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalMember')" :value="'-1'" />
          <el-option v-for="item in projectUserList" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </div>
    </div>
    <el-divider />
    <div class="board">
      <Kanban
        key="1"
        :list="activeList"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban active"
        :header-text="$t('ProjectActive.Active')"
        c-name="Active"
        @update="updateIssueStatus"
        @updateBoard="fetchData"
      />
      <Kanban
        key="2"
        :list="assignedList"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban assigned"
        :header-text="$t('ProjectActive.Assigned')"
        c-name="Assigned"
        @update="updateIssueStatus"
        @updateBoard="fetchData"
      />
      <Kanban
        key="3"
        :list="solvedList"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban solved"
        :header-text="$t('ProjectActive.Solved')"
        c-name="Solved"
        @update="updateIssueStatus"
        @updateBoard="fetchData"
      />
      <Kanban
        key="4"
        :list="respondedList"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban responded"
        :header-text="$t('ProjectActive.Responded')"
        c-name="Responded"
        @update="updateIssueStatus"
        @updateBoard="fetchData"
      />
      <Kanban
        key="5"
        :list="finishedList"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban finished"
        :header-text="$t('ProjectActive.Finished')"
        c-name="Finished"
        @update="updateIssueStatus"
        @updateBoard="fetchData"
      />
      <Kanban
        key="6"
        :list="closedList"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban closed"
        :header-text="$t('ProjectActive.Closed')"
        c-name="Closed"
        @update="updateIssueStatus"
        @updateBoard="fetchData"
      />
    </div>
  </div>
</template>

<style lang="scss">
.board {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  align-items: start;
}
.kanban {
  &.active {
    .board-column-header {
      .header-bar {
        background: #85c1e9;
      }
    }
  }
  &.assigned {
    .board-column-header {
      .header-bar {
        background: #ff7b00;
      }
    }
  }
  &.solved {
    .board-column-header {
      .header-bar {
        background: #82e0aa;
      }
    }
  }
  &.responded {
    .board-column-header {
      .header-bar {
        background: #ffc300;
      }
    }
  }
  &.finished {
    .board-column-header {
      .header-bar {
        background: #a4bebe;
      }
    }
  }
  &.closed {
    .board-column-header {
      .header-bar {
        background: #aeb6bf;
      }
    }
  }
}
</style>
