<template>
  <el-row v-loading="isLoading" class="app-container">
    <el-row>
      <el-col :md="24" :lg="14">
        <project-list-selector />
        <el-select
          v-model="versionValue"
          :placeholder="$t('Version.SelectVersion')"
          :disabled="selectedProjectId === -1"
          class="mr-4"
          filterable
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />
          <el-option v-for="item in projectVersionList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select
          v-model="memberValue"
          :placeholder="$t('Member.SelectMember')"
          :disabled="selectedProjectId === -1"
          filterable
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalMember')" :value="'-1'" />
          <el-option :key="-2" :label="$t('Dashboard.Unassigned')" value="" />
          <el-option v-for="item in projectUserList" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </el-col>
      <el-col :md="24" :lg="10" class="text-right">
        <el-form inline>
          <el-form-item label="篩選維度">
            <el-select
              v-model="filterDimension"
              :placeholder="$t('Version.SelectVersion')"
              :disabled="selectedProjectId === -1"
              class="mr-4"
              filterable
              @change="updateData"
            >
              <el-option label="議題狀態" value="issue_status" />
              <el-option label="議題類別" value="issue_type" />
              <el-option label="專案成員" value="user_name" />
              <el-option label="專案版本" value="project_version" />

            </el-select>
          </el-form-item>
          <el-select-all v-model="filterValue" filterable multiple collapse-tags :options="filterValueOptions" />
        </el-form>
      </el-col>
    </el-row>
    <el-divider />
    <el-col class="board">
      <Kanban
        v-for="(status, idx) in Object.keys(classifyIssueStatus)"
        :key="idx"
        :list="classifyIssueStatus[status]"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban"
        :header-text="$t('ProjectActive.'+status)"
        :c-name="status"
        :class="{[status.toLowerCase()]: true}"
        :focus-version="String(versionValue)"
        @update="updateIssueStatus"
        @updateBoard="updateIssueBoard"
      />
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Fuse from 'fuse.js'
import { Kanban } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssueStatus, updateIssue } from '@/api/issue'
import { getProjectIssueListByStatus, getProjectIssueListByTree, getProjectVersion } from '@/api/projects'
import ElSelectAll from '@/components/ElSelectAll'

export default {
  name: 'IssueBoards',
  components: {
    ElSelectAll,
    Kanban,
    ProjectListSelector
  },
  data: () => ({
    isLoading: true,
    filterDimension: 'issue_status',
    filterValue: [],
    issueStatusList: [],
    projectIssueList: [],
    classifyIssueStatus: {},
    group: 'mission',
    versionValue: '-1',
    memberValue: '-1',
    projectVersionList: [],
    projectUserList: '',
    relativeIssueList: []
  }),
  computed: {
    ...mapGetters(['selectedProjectId']),
    filterValueOptions() {
      return this.issueStatusList.map((item) => ({ key: item.id, label: item.name, value: item.name }))
    }
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    },
    filterValue: {
      deep: true,
      handler() {
        this.resetKanbanCard()
      }
    }
  },
  async created() {
    const issueStatusRes = await getIssueStatus()
    this.issueStatusList = issueStatusRes.data
    // this.issueStatusList.forEach((item) => {
    //   this.classifyIssueStatus[item.name] = []
    // })
    await this.fetchData()
  },
  methods: {
    ...mapActions('projects', ['getProjectUserList']),
    searchKanbanCard(value, opt) {
      this.issueStatusList.forEach((item) => {
        if (value === '') {
          this.classifyIssueStatus[item.name] = this.classifyIssueStatus[item.name].filter((item) => (item[opt['keys'][0]] === value))
        } else {
          const fuse = new Fuse(this.classifyIssueStatus[item.name], opt)
          const res = fuse.search(`="${value}"`)
          this.classifyIssueStatus[item.name] = res.map(items => items.item)
        }
      })
    },
    resetKanbanCard() {
      this.classifyIssueStatus = {}
      let objectArray = this.issueStatusList
      if (this.filterValue.length > 0) {
        objectArray = this.filterValue.map((item) => ({ name: item }))
      }
      objectArray.forEach(item => {
        this.classifyIssueStatus[item.name] = this.genKanbanCard(item.name)
      })
    },
    genKanbanCard(status) {
      if (!this.projectIssueList[status]) return [] // 該status不存在issue回傳空array
      return this.projectIssueList[status].map(issue => {
        let parentDetail = {}
        if (issue.parent_id) {
          const parent = this.relativeIssueList.find((item) => (item.id === issue.parent_id))
          parentDetail = {
            parent_name: parent.issue_name,
            parent_status: parent.issue_status,
            parent_status_id: parent.issue_status_id
          }
        }
        return {
          name: issue.issue_name,
          id: issue.id,
          date: issue.due_date,
          user: issue.assigned_to,
          version: issue.fixed_version_id,
          parent_id: issue.parent_id,
          ...parentDetail
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
      this.relativeIssueList = await this.updateRelativeList()
      await this.resetKanbanCard()
    },
    updateIssueBoard() {
      this.fetchData()
      this.versionValue = '-1'
      this.memberValue = '-1'
    },
    updateRelativeList() {
      this.isLoading = true
      return getProjectIssueListByTree(this.selectedProjectId).then(res => {
        return Promise.resolve(this.createRelativeList(res.data))
      })
        .catch((e) => {
          console.log(e)
          return Promise.reject()
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    async updateIssueStatus(evt) {
      this.isLoading = true
      const { to, newIndex } = evt
      const classList = to.className.split(' ')
      const className = classList[classList.length - 1]
      let issue = {}
      let newStatusId = 0
      issue = this.classifyIssueStatus[className][newIndex]
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
      console.log('updateData')
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

<style lang="scss" scoped>
$active: #85c1e9;
$assigned: #ff7b00;
$solved: #82e0aa;
$responded: #ffc300;
$finished: #a4bebe;
$closed: #aeb6bf;

.board {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  align-items: start;

  .kanban {
    > > > .parent {
      font-size: 0.75em;
      margin: 0;

      .el-tag {
        font-size: 0.5em;
      }

      .Active {
        background: $active;
      }

      .Assigned {
        background: $assigned;
      }

      .Solved {
        background: $solved;
      }

      .Responded {
        background: $responded;
      }

      .Finished {
        background: $finished;
      }

      .Closed {
        background: $closed;
      }
    }

    > > > &.active {
      .board-column-header {
        .header-bar {
          background: $active;
        }
      }
    }

    > > > &.assigned {
      .board-column-header {
        .header-bar {
          background: $assigned;
        }
      }
    }

    > > > &.solved {
      .board-column-header {
        .header-bar {
          background: $solved;
        }
      }
    }

    > > > &.responded {
      .board-column-header {
        .header-bar {
          background: $responded;
        }
      }
    }

    > > > &.finished {
      .board-column-header {
        .header-bar {
          background: $finished;
        }
      }
    }

    > > > &.closed {
      .board-column-header {
        .header-bar {
          background: $closed;
        }
      }
    }
  }
}
</style>
