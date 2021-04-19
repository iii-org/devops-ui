<template>
  <el-row v-loading="isLoading" class="app-container">
    <el-row>
      <el-col :md="24" :lg="14">
        <project-list-selector />
        <el-select
          v-if="filterDimension!=='fixed_version_name'"
          v-model="versionValue"
          :placeholder="$t('Version.SelectVersion')"
          :disabled="selectedProjectId === -1"
          class="mr-4"
          filterable
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />
          <el-option v-for="item in fixed_version_name" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select
          v-if="filterDimension!=='assigned_to'"
          v-model="memberValue"
          :placeholder="$t('Member.SelectMember')"
          :disabled="selectedProjectId === -1"
          filterable
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalMember')" :value="'-1'" />
          <!--          <el-option :key="-2" :label="$t('Dashboard.Unassigned')" value="" />-->
          <el-option v-for="item in assigned_to" :key="item.id" :label="item.name"
                     :value="searchNullValueOption(item)"
          />
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
            >
              <el-option label="議題狀態" value="issue_status" />
              <el-option label="議題類別" value="issue_category" />
              <el-option label="專案成員" value="assigned_to" />
              <el-option label="專案版本" value="fixed_version_name" />
            </el-select>
          </el-form-item>
          <el-select-all ref="filterValue" v-model="filterValue" filterable multiple collapse-tags
                         :options="filterValueOptions"
          />
        </el-form>
      </el-col>
    </el-row>
    <el-divider />
    <el-col class="board">
      <Kanban
        v-for="(status, idx) in filterValueOnBoard"
        :key="idx"
        :list="classifyIssueList[status]"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban"
        :header-text="getTranslateHeader(status)"
        :c-name="status"
        :class="{[status.toLowerCase()]: true}"
        :focus-version="String(versionValue)"
        @update="updateIssueStatus"
      />
      <!--      @updateBoard="updateIssueBoard"-->
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Fuse from 'fuse.js'
import { Kanban } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
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
    projectIssueList: [],
    classifyIssueList: {},
    group: 'mission',
    versionValue: '-1',
    memberValue: '-1',
    fixed_version_name: [],
    issue_status: [],
    issue_category: [],
    assigned_to: [],
    relativeIssueList: []
  }),
  computed: {
    ...mapGetters(['selectedProjectId']),
    filterValueOptions() {
      // const result = [...new Set(this.projectIssueList.map((item) => (item[this.filterDimension])))]
      // return result.map((item, idx) => ({ id: idx, label: item, value: item }))
      return this[this.filterDimension].map((item, idx) => ({
        id: idx,
        label: item.name,
        value: this.searchNullValueOption(item)
      }))
    },
    filterValueOnBoard() {
      if (this.filterValue.length <= 0) {
        return this[this.filterDimension].map((item) => (this.searchNullValueOption(item)))
      }
      return this.filterValue
    }
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    },
    filterDimension() {
      this.$set(this.$data, 'filterValue', [])
      this.$refs['filterValue'].selected = []
      this.resetClassifyIssue()
      this.classifyIssue()
    },
    filterValue: {
      deep: true,
      handler() {
        // this.resetKanbanCard()
        this.resetClassifyIssue()
        this.classifyIssue()
      }
    }
  },
  async created() {
    const issueStatusRes = await getIssueStatus()
    this.issue_status = issueStatusRes.data
    const issueCategoryRes = await getIssueTracker()
    this.issue_category = issueCategoryRes.data
    // this.issue_status.forEach((item) => {
    //   this.classifyIssueList[item.name] = []
    // })
    await this.fetchData()
  },
  methods: {
    ...mapActions('projects', ['getProjectUserList']),
    async fetchData() {
      this.isLoading = true
      await this.resetClassifyIssue()
      const projectIssueListRes = await getProjectIssueListByTree(this.selectedProjectId)

      const versionsRes = await getProjectVersion(this.selectedProjectId)
      this.fixed_version_name = versionsRes.data.versions

      const userRes = await this.getProjectUserList(this.selectedProjectId)
      this.assigned_to = [{ name: '尚未指派', id: '' }, ...userRes.data.user_list]
      this.isLoading = false
      this.projectIssueList = this.createRelativeList(projectIssueListRes.data) // 取得project全部issue by status
      await this.classifyIssue()
      // this.relativeIssueList = await this.updateRelativeList()
      // await this.resetKanbanCard()
    },
    checkInFilterValue(value) {
      if (this.filterValue.length <= 0) return true
      return this.filterValue.includes(value)
    },
    classifyIssue() {
      this.projectIssueList.forEach((issue) => {
        if (this.checkInFilterValue(issue[this.filterDimension])) {
          if (!this.classifyIssueList.hasOwnProperty(issue[this.filterDimension])) {
            this.classifyIssueList[issue[this.filterDimension]] = []
          }
          let parentDetail = {}
          if (issue.parent_id) {
            const parent = this.projectIssueList.find((item) => (item.id === issue.parent_id))
            parentDetail = {
              parent_name: parent.issue_name,
              parent_status: parent.issue_status,
              parent_status_id: parent.issue_status_id
            }
          }
          this.classifyIssueList[issue[this.filterDimension]].push({
            ...issue,
            ...parentDetail
          })
        }
      })
    },
    resetClassifyIssue() {
      this.classifyIssueList = {}
    },
    getTranslateHeader(value) {
      return this.$te('ProjectActive.' + value) ? this.$t('ProjectActive.' + value) : value
    },
    searchKanbanCard(value, opt) {
      Object.keys(this.classifyIssueList).forEach((item) => {
        if (value === '') {
          this.classifyIssueList[item] = this.classifyIssueList[item].filter((item) => (item[opt['keys'][0]] === value))
        } else {
          const fuse = new Fuse(this.classifyIssueList[item], opt)
          const res = fuse.search(`="${value}"`)
          this.classifyIssueList[item] = res.map(items => items.item)
        }
      })
    },
    searchNullValueOption(item) {
      return (item.id === '') ? item.id : item.name
    },
    // resetKanbanCard() {
    //   this.classifyIssueList = {}
    //   let objectArray = this.issue_status
    //   if (this.filterValue.length > 0) {
    //     objectArray = this.filterValue.map((item) => ({ name: item }))
    //   }
    //   objectArray.forEach(item => {
    //     this.classifyIssueList[item.name] = this.genKanbanCard(item.name)
    //   })
    // },
    // genKanbanCard(status) {
    //   if (!this.projectIssueList[status]) return [] // 該status不存在issue回傳空array
    //   return this.projectIssueList[status].map(issue => {
    //   })
    // },
    // updateIssueBoard() {
    //   this.fetchData()
    //   this.versionValue = '-1'
    //   this.memberValue = '-1'
    // },
    // updateRelativeList() {
    //   this.isLoading = true
    //   return getProjectIssueListByTree(this.selectedProjectId).then(res => {
    //     return Promise.resolve(this.createRelativeList(res.data))
    //   })
    //     .catch((e) => {
    //       console.log(e)
    //       return Promise.reject()
    //     })
    //     .finally(() => {
    //       this.isLoading = false
    //     })
    // },
    async updateIssueStatus(evt) {
      if (evt.event.hasOwnProperty('added')) {
        this.isLoading = true
        const getUpdateDimension = this[this.filterDimension].find((item) => ((evt.list === '') ? item.id === evt.list : item.name === evt.list))
        await updateIssue(evt.event.added.element.id, { [this.filterDimension + '_id']: getUpdateDimension.id })
        this.projectIssueList.forEach((item) => {
          if (item.id === evt.event.added.element.id) {
            item[this.filterDimension] = evt.list
            item[this.filterDimension + '_id'] = getUpdateDimension.id
          }
        })
        this.resetClassifyIssue()
        this.classifyIssue()
        this.isLoading = false
      }
    },
    updateData() {
      console.log('updateData')
      this.resetClassifyIssue()
      this.classifyIssue()
      const versionOpt = {
        keys: ['fixed_version_name'],
        useExtendedSearch: true
      }
      const userOpt = {
        keys: ['assigned_to'],
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
