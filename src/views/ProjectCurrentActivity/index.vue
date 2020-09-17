<script>
import { mapGetters, mapActions } from 'vuex'
import Kanban from '@/components/Kanban'
import { getProjectList } from '@/api/projects'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getIssueStatus } from '@/api/issue'
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
    async fetchData() {
      this.isLoading = true
      const projectIssueListRes = await getProjectIssueListByStatus(this.projectSelectedId)
      this.isLoading = false
      const projectIssueList = projectIssueListRes.data
      this.issueStatusList = this.issueStatusList.map(item => {
        if (projectIssueList[item['name']]) {
          item['issues'] = projectIssueList[item['name']].map(issue => {
            issue['name'] = issue.issue_name
            issue['iss'] = issue.assigned_to
            issue['iat'] = issue.due_date
            return issue
          })
        } else {
          item['issues'] = []
        }
        return item
      })
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
    <div class="components-container board" style="overflow: auto;">
      <div style="width: 100%; display: flex; overflow: auto">
        <Kanban
          v-for="item in issueStatusList"
          :key="item.id"
          style="margin: 10px 10px"
          :header-text="item.name"
          :list="item.issues"
          :group="group"
          class="kanban todo"
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
  &.todo {
    .board-column-header {
      .header-bar {
        background: #85c1e9;
      }
    }
  }
  &.in-progress {
    .board-column-header {
      .header-bar {
        background: #ffc300;
      }
    }
  }
  &.done {
    .board-column-header {
      .header-bar {
        background: #82e0aa;
      }
    }
  }
  &.close {
    .board-column-header {
      .header-bar {
        background: #aeb6bf;
      }
    }
  }
}
</style>
