<script>
import { mapGetters, mapActions } from 'vuex'
import Kanban from '@/components/Kanban'
import { getProjectList } from '@/api/projects'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getIssueStatus, updateIssue } from '@/api/issue'
import { getProjectIssueListByStatus } from '@/api/projects'

export default {
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
      group: 'mission'
    }
  },
  async created() {
    const issueStatusRes = await getIssueStatus()
    this.issueStatusList = issueStatusRes.data
    this.fetchData()
  },
  computed: {
    ...mapGetters(['projectSelectedId'])
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    }
  },
  methods: {
    genKanbanCard(status) {
      if (!this.projectIssueList[status])
        //該status不存在issue回傳空array
        return []
      return this.projectIssueList[status].map(issue => {
        return {
          name: issue.issue_name,
          id: issue.id,
          date: issue.due_date,
          user: issue.assigned_to
        }
      })
    },
    async fetchData() {
      this.isLoading = true
      const projectIssueListRes = await getProjectIssueListByStatus(this.projectSelectedId)
      this.isLoading = false
      this.projectIssueList = projectIssueListRes.data //取得project全部issue by status
      this.issueStatusList.forEach(item => {
        if (item.name == 'Active') this.activeList = this.genKanbanCard('Active')
        if (item.name == 'Assigned') this.assignedList = this.genKanbanCard('Assigned')
        if (item.name == 'Solved') this.solvedList = this.genKanbanCard('Solved')
        if (item.name == 'Responded') this.respondedList = this.genKanbanCard('Responded')
        if (item.name == 'Finished') this.finishedList = this.genKanbanCard('Finished')
        if (item.name == 'Closed') this.closedList = this.genKanbanCard('Closed')
      })
    },
    async updateIssueStatus(from, to, oldIndex, newIndex) {
      let issue = {}
      let newStatusId = 0
      if (to.className.search('Active') != -1) issue = this.activeList[newIndex]
      if (to.className.search('Assigned') != -1) issue = this.assignedList[newIndex]
      if (to.className.search('Solved') != -1) issue = this.solvedList[newIndex]
      if (to.className.search('Responded') != -1) issue = this.respondedList[newIndex]
      if (to.className.search('Finished') != -1) issue = this.finishedList[newIndex]
      if (to.className.search('Closed') != -1) issue = this.closedList[newIndex]
      this.issueStatusList.forEach(item => {
        if (to.className.search(item.name) != -1) {
          newStatusId = item.id
        }
      })
      if (issue.id && newStatusId != 0) {
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
      </div>
    </div>
    <el-divider />
    <div class="components-container board" style="overflow: auto">
      <div style="width: 100%; overflow: auto; padding-bottom: 10px; font-size: 0">
        <Kanban
          key="1"
          :updateStatus="updateIssueStatus"
          :list="activeList"
          :group="group"
          class="kanban active"
          :header-text="$t('ProjectActive.Active')"
          cName="Active"
        />
        <Kanban
          key="2"
          :updateStatus="updateIssueStatus"
          :list="assignedList"
          :group="group"
          class="kanban assigned"
          :header-text="$t('ProjectActive.Assigned')"
          cName="Assigned"
        />
        <Kanban
          key="3"
          :updateStatus="updateIssueStatus"
          :list="solvedList"
          :group="group"
          class="kanban solved"
          :header-text="$t('ProjectActive.Solved')"
          cName="Solved"
        />
        <Kanban
          key="4"
          :updateStatus="updateIssueStatus"
          :list="respondedList"
          :group="group"
          class="kanban responsed"
          :header-text="$t('ProjectActive.Responsed')"
          cName="Responsed"
        />
        <Kanban
          key="5"
          :updateStatus="updateIssueStatus"
          :list="finishedList"
          :group="group"
          class="kanban finished"
          :header-text="$t('ProjectActive.Finished')"
          cName="Finished"
        />
        <Kanban
          key="6"
          :updateStatus="updateIssueStatus"
          :list="closedList"
          :group="group"
          class="kanban closed"
          :header-text="$t('ProjectActive.Closed')"
          cName="Closed"
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
