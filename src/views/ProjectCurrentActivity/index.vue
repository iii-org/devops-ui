<script>
import { mapGetters, mapActions } from 'vuex'
import Kanban from '@/components/Kanban'
import { getProjectList, getProjectVersion } from '@/api/projects'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getIssueStatus, updateIssue } from '@/api/issue'
import { getProjectIssueListByStatus } from '@/api/projects'
import Fuse from 'fuse.js'

export default {
  name: 'ProjectCurrentActivity',
  components: {
    Kanban,
    ProjectListSelector
  },
  data() {
    return {
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
      projectUserList: ''
    }
  },

  computed: {
    ...mapGetters(['projectSelectedId'])
  },

  watch: {
    projectSelectedId() {
      this.fetchData()
    },
    versionValue(value) {
      if (value === '-1' && this.memberValue === '-1') return this.resetKanbanCard()
      if (this.memberValue === '-1') this.resetKanbanCard()
      if (value === '-1') {
        this.resetKanbanCard()
        const tmp = this.memberValue
        this.memberValue = ''
        this.$nextTick(() => {
          this.memberValue = tmp
        })
        return
      }
      const opt = {
        keys: ['version'],
        useExtendedSearch: true
      }
      this.searchKanbanCard(value, opt)
    },
    memberValue(value) {
      if (value === '-1' && this.versionValue === '-1') return this.resetKanbanCard()
      if (this.versionValue === '-1') this.resetKanbanCard()
      if (value === '-1') {
        this.resetKanbanCard()
        const tmp = this.versionValue
        this.versionValue = ''
        this.$nextTick(() => {
          this.versionValue = tmp
        })
        return
      }
      const opt = {
        keys: ['user'],
        useExtendedSearch: true
      }
      this.searchKanbanCard(value, opt)
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
      const resActive = fuseActive.search(`=${value}`)
      this.activeList = resActive.map(items => items.item)

      const fuseAssign = new Fuse(this.assignedList, opt)
      const resAssign = fuseAssign.search(`=${value}`)
      this.assignedList = resAssign.map(items => items.item)

      const fuseSolved = new Fuse(this.solvedList, opt)
      const resSolved = fuseSolved.search(`=${value}`)
      this.solvedList = resSolved.map(items => items.item)

      const fuseRespond = new Fuse(this.respondedList, opt)
      const resRespond = fuseRespond.search(`=${value}`)
      this.respondedList = resRespond.map(items => items.item)

      const fuseFinish = new Fuse(this.finishedList, opt)
      const resFinish = fuseFinish.search(`=${value}`)
      this.finishedList = resFinish.map(items => items.item)

      const fuseClosed = new Fuse(this.closedList, opt)
      const resClosed = fuseClosed.search(`=${value}`)
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
          version: issue.fixed_version_id
        }
      })
    },
    async fetchData() {
      this.isLoading = true
      const projectIssueListRes = await getProjectIssueListByStatus(this.projectSelectedId)

      const versionsRes = await getProjectVersion(this.projectSelectedId)
      this.projectVersionList = versionsRes.data.versions
      if (this.projectVersionList.length !== 0) {
        this.versionValue = this.projectVersionList[0].id
      } else {
        this.versionValue = '-1'
      }

      const userRes = await this.getProjectUserList(this.projectSelectedId)
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
    },
    async updateIssueStatus(from, to, oldIndex, newIndex) {
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
    }
  }
}
</script>

<template>
  <div v-loading="isLoading" class="app-container">
    <div class="clearfix">
      <div>
        <project-list-selector />

        <el-select v-model="versionValue" :placeholder="$t('Version.SelectVersion')">
          <el-option :key="-1" :label="$t('Dashboard.Total')" :value="'-1'" />
          <el-option v-for="item in projectVersionList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <el-select v-model="memberValue" :placeholder="$t('Member.SelectMember')">
          <el-option :key="-1" :label="$t('Dashboard.Total')" :value="'-1'" />
          <el-option v-for="item in projectUserList" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </div>
    </div>

    <el-divider />

    <div class="components-container board" style="overflow: auto">
      <div style="width: 100%; overflow: auto; padding-bottom: 10px; font-size: 0">
        <Kanban
          key="1"
          :update-status="updateIssueStatus"
          :list="activeList"
          :group="group"
          class="kanban active"
          :header-text="$t('ProjectActive.Active')"
          c-name="Active"
        />
        <Kanban
          key="2"
          :update-status="updateIssueStatus"
          :list="assignedList"
          :group="group"
          class="kanban assigned"
          :header-text="$t('ProjectActive.Assigned')"
          c-name="Assigned"
        />
        <Kanban
          key="3"
          :update-status="updateIssueStatus"
          :list="solvedList"
          :group="group"
          class="kanban solved"
          :header-text="$t('ProjectActive.Solved')"
          c-name="Solved"
        />
        <Kanban
          key="4"
          :update-status="updateIssueStatus"
          :list="respondedList"
          :group="group"
          class="kanban responded"
          :header-text="$t('ProjectActive.Responded')"
          c-name="Responded"
        />
        <Kanban
          key="5"
          :update-status="updateIssueStatus"
          :list="finishedList"
          :group="group"
          class="kanban finished"
          :header-text="$t('ProjectActive.Finished')"
          c-name="Finished"
        />
        <Kanban
          key="6"
          :update-status="updateIssueStatus"
          :list="closedList"
          :group="group"
          class="kanban closed"
          :header-text="$t('ProjectActive.Closed')"
          c-name="Closed"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.board {
  margin-left: 20px;
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  align-items: flex-start;
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
