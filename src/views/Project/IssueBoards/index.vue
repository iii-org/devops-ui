<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <el-row>
      <el-col :md="24" :lg="14">
        <project-list-selector />
        <el-select
          v-if="filterDimension !== 'fixed_version'"
          v-model="versionValue"
          :placeholder="$t('Version.SelectVersion')"
          :disabled="selectedProjectId === -1"
          class="mr-4"
          filterable
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />
          <el-option v-for="item in fixed_version" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select
          v-if="filterDimension !== 'assigned_to'"
          v-model="memberValue"
          :placeholder="$t('Member.SelectMember')"
          :disabled="selectedProjectId === -1"
          filterable
          @change="updateData"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalMember')" :value="'-1'" />
          <!--          <el-option :key="-2" :label="$t('Dashboard.Unassigned')" value="" />-->
          <el-option
            v-for="item in assigned_to"
            :key="item.id"
            :label="`${item.name}(${item.login})`"
            :value="searchNullValueOption(item)"
          />
        </el-select>
      </el-col>
      <el-col :md="24" :lg="10" class="text-right">
        <el-form inline>
          <el-form-item label="篩選維度">
            <el-select v-model="filterDimension" class="mr-4" filterable>
              <el-option
                v-for="(item, idx) in filterDimensionOptions"
                :key="idx"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-select-all
            ref="filterValue"
            v-model="filterValue"
            filterable
            multiple
            collapse-tags
            :options="filterValueOptions"
            value-key="id"
          />
        </el-form>
      </el-col>
    </el-row>
    <el-divider />
    <el-col class="board">
      <Kanban
        v-for="(classObj, idx) in filterValueOnBoard"
        :key="idx"
        :status="status"
        :board-object="classObj"
        :list="classifyIssueList[classObj.id]"
        :dimension="filterDimension"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban"
        :header-text="getTranslateHeader(classObj.name)"
        :c-name="classObj.name"
        :class="{ [classObj.name.toLowerCase()]: true }"
        :focus-version="String(versionValue)"
        @update="updateIssueStatus"
        @update-board="updateIssueBoard"
        @update-drag="quickUpdateIssue"
      />
      <right-panel ref="rightPanel" :click-not-close="true">
        <el-row v-for="(item, idx) in filterDimensionOptions" :key="idx" class="panel">
          <el-card>
            <template slot="header">{{ item.label }}</template>
            <template v-for="(subItem, index) in getFilterValueList(item.value)">
              <div
                v-if="subItem.status !== 'closed'"
                :id="index"
                :key="index"
                draggable="true"
                class="item"
                @dragstart="dragStart($event, { [item.value]: subItem })"
                @dragend="dragEnd"
              >
                <el-tag effect="dark" :type="getTagType(subItem.name)">{{
                  $te(`Issue.${subItem.name}`) ? $t(`Issue.${subItem.name}`) : subItem.name
                }}</el-tag>
                <el-alert class="help_text" :closable="false">
                  拖曳到議題，可以將 {{ item.label }} 改變成
                  {{ $te(`Issue.${subItem.name}`) ? $t(`Issue.${subItem.name}`) : subItem.name }}
                </el-alert>
              </div>
            </template>
          </el-card>
        </el-row>
      </right-panel>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Fuse from 'fuse.js'
import { Kanban } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
import { getProjectIssueListByTree, getProjectVersion } from '@/api/projects'
import ElSelectAll from '@/components/ElSelectAll'
import RightPanel from './components/RightPanel'

export default {
  name: 'IssueBoards',
  components: {
    RightPanel,
    ElSelectAll,
    Kanban,
    ProjectListSelector
  },
  data: () => ({
    isLoading: true,
    filterDimension: 'status',
    filterValue: [],
    projectIssueList: [],
    classifyIssueList: {},
    group: 'mission',
    versionValue: '-1',
    memberValue: '-1',
    fixed_version: [],
    status: [],
    tracker: [],
    assigned_to: [],
    relativeIssueList: []
  }),
  computed: {
    ...mapGetters(['selectedProjectId']),
    filterDimensionOptions() {
      return [
        { label: '議題狀態', value: 'status' },
        { label: '議題類別', value: 'tracker' },
        { label: '專案成員', value: 'assigned_to' },
        { label: '專案版本', value: 'fixed_version' }
      ]
    },
    filterValueOptions() {
      // const result = [...new Set(this.projectIssueList.map((item) => (item[this.filterDimension])))]
      // return result.map((item, idx) => ({ id: idx, label: item, value: item }))
      return this[this.filterDimension].map((item, idx) => ({
        id: idx,
        label: item.name,
        value: item
      }))
    },
    filterValueOnBoard() {
      if (this.filterValue.length <= 0) {
        return this[this.filterDimension].map(item => item)
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
    this.status = issueStatusRes.data
    const issueTrackerRes = await getIssueTracker()
    this.tracker = issueTrackerRes.data
    // this.status.forEach((item) => {
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
      this.fixed_version = [{ name: '版本未定', id: '' }, ...versionsRes.data.versions]

      const userRes = await this.getProjectUserList(this.selectedProjectId)
      this.assigned_to = [{ name: this.$t('Dashboard.Unassigned'), id: '' }, ...userRes.data.user_list]
      this.isLoading = false
      this.projectIssueList = this.createRelativeList(projectIssueListRes.data) // 取得project全部issue by status
      await this.classifyIssue()
      // this.relativeIssueList = await this.updateRelativeList()
      // await this.resetKanbanCard()
    },
    checkInFilterValue(value) {
      if (this.filterValue.length <= 0) return true
      return this.filterValue.filter(item => item.id === value)
    },
    classifyIssue() {
      let issueList = this.projectIssueList
      if (this.filterDimension !== 'status') {
        issueList = this.projectIssueList.filter((issue) => (issue.status.id !== 6))
      }
      issueList.forEach(issue => {
        let dimensionName = issue[this.filterDimension].id
        if (!dimensionName) {
          dimensionName = ''
        }
        if (this.checkInFilterValue(dimensionName)) {
          if (!this.classifyIssueList.hasOwnProperty(dimensionName)) {
            this.classifyIssueList[dimensionName] = []
          }
          let parentDetail = {}
          if (issue.parent_id) {
            const parent = this.projectIssueList.find(item => item.id === issue.parent_id)
            parentDetail = {
              parent_name: parent.name,
              parent_status: parent.status
            }
          }
          this.classifyIssueList[dimensionName].push({
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
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    searchKanbanCard(value, opt) {
      Object.keys(this.classifyIssueList).forEach(item => {
        if (value === '') {
          this.classifyIssueList[item] = this.classifyIssueList[item].filter(subItem => {
            const findKey = opt['keys'][0].split('.')
            const findName = findKey.reduce((total, current) => total[current], subItem)
            return findName === undefined || findKey[0] === ''
          })
        } else {
          const fuse = new Fuse(this.classifyIssueList[item], opt)
          const res = fuse.search(`="${value}"`)
          this.classifyIssueList[item] = res.map(items => items.item)
        }
      })
    },
    searchNullValueOption(item) {
      return item.id === '' ? item.id : item.name
    },
    updateIssueBoard() {
      this.fetchData()
      this.versionValue = '-1'
      this.memberValue = '-1'
    },
    async updateIssueStatus(evt) {
      if (evt.event.hasOwnProperty('added')) {
        this.isLoading = true
        // const getUpdateDimension = this[this.filterDimension].find((item) => ((evt.list === '') ? item.id === evt.list : item.name === evt.list))
        await updateIssue(evt.event.added.element.id, { [this.filterDimension + '_id']: evt.boardObject.id })
        this.projectIssueList.forEach(item => {
          if (item.id === evt.event.added.element.id) {
            item[this.filterDimension] = evt.boardObject
          }
        })
        this.resetClassifyIssue()
        this.classifyIssue()
        this.isLoading = false
      }
    },
    async quickUpdateIssue(event) {
      const { id, value } = event
      this.isLoading = true
      const filterDimension = Object.keys(value)[0]
      // const getUpdateDimension = this[filterDimension].find((item) => (item.id === value[filterDimension].id))
      // console.log(id, getUpdateDimension)
      await updateIssue(id, { [filterDimension + '_id']: value[filterDimension].id })
      this.projectIssueList.forEach(item => {
        if (item.id === id) {
          item[filterDimension] = value[filterDimension]
        }
      })
      this.resetClassifyIssue()
      this.classifyIssue()
      this.isLoading = false
    },
    updateData() {
      console.log('updateData')
      this.resetClassifyIssue()
      this.classifyIssue()
      const versionOpt = {
        keys: ['fixed_version.name'],
        useExtendedSearch: true
      }
      const userOpt = {
        keys: ['assigned_to.name'],
        useExtendedSearch: true
      }
      if (this.versionValue !== '-1') {
        this.searchKanbanCard(this.versionValue, versionOpt)
      }
      if (this.memberValue !== '-1') {
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
    },
    dragStart(e, item) {
      e.effectAllowed = 'copy'
      console.log(e.target)
      e.target.classList.add('draggingObject')
      e.dataTransfer.setData('json', JSON.stringify(item))
      // console.log('dragStart')
      // console.log(e)
    },
    dragEnd(e) {
      e.target.classList.remove('draggingObject')
      console.log(e)
    },
    getFilterValueList(value) {
      return this[value]
    },
    getTagType(name) {
      switch (name) {
        case 'Active':
          return ''
        case 'Assigned':
          return 'danger'
        case 'Closed':
          return 'info'
        case 'Solved':
          return 'secondary'
        case 'Responded':
          return 'warning'
        case 'Finished':
          return 'success'
        case 'Feature':
          return 'feature'
        case 'Bug':
          return 'bug'
        case 'Document':
          return 'document'
        case 'Research':
          return 'research'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.board {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  align-items: start;

  .kanban {
    >>> .parent {
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

    >>> &.active {
      .board-column-header {
        .header-bar {
          background: $active;
        }
      }
    }

    >>> &.assigned {
      .board-column-header {
        .header-bar {
          background: $assigned;
        }
      }
    }

    >>> &.solved {
      .board-column-header {
        .header-bar {
          background: $solved;
        }
      }
    }

    >>> &.responded {
      .board-column-header {
        .header-bar {
          background: $responded;
        }
      }
    }

    >>> &.finished {
      .board-column-header {
        .header-bar {
          background: $finished;
        }
      }
    }

    >>> &.closed {
      .board-column-header {
        .header-bar {
          background: $closed;
        }
      }
    }

    >>> &.feature {
      .board-column-header {
        .header-bar {
          background: $feature;
        }
      }
    }

    >>> &.bug {
      .board-column-header {
        .header-bar {
          background: $bug;
        }
      }
    }

    >>> &.document {
      .board-column-header {
        .header-bar {
          background: $document;
        }
      }
    }

    >>> &.research {
      .board-column-header {
        .header-bar {
          background: $research;
        }
      }
    }
  }
}

>>> .rightPanel-items {
  overflow-y: auto;
  height: 100%;
  .panel {
    padding: 30px 20px;
    .item {
      width: fit-content;
      cursor: move;
      .el-tag {
        font-size: 1.05em;
        margin: 3px;
      }
      .help_text {
        display: none;
      }
    }
  }
}

// For drag sources
.dragging {
  opacity: 0.25;
}
.draggingObject {
  width: 100%;
  .help_text {
    display: block !important;
    opacity: 1 !important;
  }
}

// For drop target
.hover {
  background-color: rgba(0, 191, 165, 0.04);
}

$tag-options: (
  secondary: $secondary,
  document: $document,
  research: $research,
  bug: $bug,
  feature: $feature
);

@each $key, $value in $tag-options {
  .el-tag--#{$key} {
    background-color: $value;
    border-color: $value;
  }
}
</style>
