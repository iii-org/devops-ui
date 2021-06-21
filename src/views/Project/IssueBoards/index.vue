<template>
  <el-row class="app-container">
    <el-row>
      <project-list-selector />

      <div class="text-right">
        <!--      <div class="text-right float-right w-1/2">-->
        <el-popover
          placement="bottom"
          trigger="click"
        >
          <el-form v-loading="isLoading">
            <template v-for="dimension in filterOptions">
              <el-form-item v-if="groupBy.dimension!==dimension.value" :key="dimension.id" :label="dimension.label">
                <el-select
                  v-model="filterValue[dimension.value]"
                  :placeholder="$t('Issue.Select'+dimension.placeholder)"
                  :disabled="selectedProjectId === -1"
                  filterable
                  clearable
                  @change="onChangeFilter"
                >
                  <el-option
                    v-for="item in (dimension.value==='status')? filterClosedStatus($data[dimension.value]):$data[dimension.value]"
                    :key="item.id"
                    :label="$te('Issue.'+item.name)?$t('Issue.'+item.name):item.name"
                    :value="item.id"
                  >
                    <component :is="dimension.value" v-if="dimension.tag" :name="item.name" />
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
            <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">
              <el-checkbox v-model="displayClosed" @change="onChangeFilter" />
            </el-form-item>
          </el-form>
          <el-button slot="reference" :loading="isLoading" icon="el-icon-s-operation" type="text"> {{ listFilter }}
            <i class="el-icon-arrow-down el-icon--right" /></el-button>
        </el-popover>
        <el-divider direction="vertical" />
        <el-popover
          placement="bottom"
          trigger="click"
        >
          <el-form v-loading="isLoading">
            <el-form-item :label="$t('Issue.FilterDimensions.label')">
              <el-select
                v-model="groupBy.dimension"
                class="mr-4"
                filterable
                @change="onChangeGroupByDimension"
              >
                <el-option
                  v-for="item in filterOptions"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Issue.Display')">
              <el-select-all
                ref="groupByValue"
                :value="groupBy.value"
                filterable
                multiple
                collapse-tags
                :options="groupByOptions"
                value-key="id"
                @change="onChangeGroupByValue"
              />
            </el-form-item>
          </el-form>
          <el-button slot="reference" :loading="isLoading" type="text">
            <i18n path="Issue.GroupBy">
              <b slot="filter">{{ showSelectedGroupByName }}</b>
            </i18n>
            ({{ showSelectedGroupByLength }}) <i class="el-icon-arrow-down el-icon--right" /></el-button>
        </el-popover>
        <el-divider direction="vertical" />
        <el-input
          v-if="searchVisible"
          id="input-search"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('Issue.SearchNameOrAssignee')"
          style="width: 250px;"
          clearable
          :disabled="isLoading"
          @blur="searchVisible=!searchVisible"
          @change="onChangeFilter"
        />
        <el-button v-else type="text" :loading="isLoading" icon="el-icon-search" @click="searchVisible=!searchVisible">
          {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
        </el-button>
        <template v-if="isFilterChanged">
          <el-divider direction="vertical" />
          <el-button size="small" icon="el-icon-close" :loading="isLoading" @click="cleanFilter">
            {{ $t('Issue.CleanFilter') }}
          </el-button>
        </template>
      </div>
    </el-row>
    <el-divider />
    <el-col v-loading="isLoading" :element-loading-text="$t('Loading')" class="board"
            :class="{'is-panel':rightPanelVisible}"
    >
      <Kanban
        v-for="classObj in groupByValueOnBoard"
        :key="classObj.id"
        :status="status"
        :board-object="classObj"
        :list="classifyIssueList[classObj.id]"
        :dimension="groupBy.dimension"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban"
        :header-text="getTranslateHeader(classObj.name)"
        :c-name="classObj.name"
        :class="{ [classObj.name.toLowerCase()]: true }"
        :focus-version="String(kanbanFilter.version)"
        @update="updateIssueStatus"
        @update-board="updateIssueBoard"
        @update-drag="quickUpdateIssue"
      />
    </el-col>
    <right-panel ref="rightPanel" :click-not-close="true" @visible="handleRightPanelVisible">
      <el-row v-for="item in filterOptions" :key="item.id" class="panel">
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
              <component :is="item.value" v-if="isRightPanelItemHasComponents(item.value)" :name="subItem.name"
                         class="el-tag"
              />
              <el-tag v-else effect="dark">
                {{ $te(`Issue.${subItem.name}`) ? $t(`Issue.${subItem.name}`) : subItem.name }}
              </el-tag>
              <el-alert class="help_text" :closable="false">
                <i18n path="Issue.DragTip">
                  <b slot="key">{{ item.label }}</b>
                  <b slot="value">{{ $te(`Issue.${subItem.name}`) ? $t(`Issue.${subItem.name}`) : subItem.name }}</b>
                </i18n>
              </el-alert>
            </div>
          </template>
        </el-card>
      </el-row>
    </right-panel>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { Kanban } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssuePriority, getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
import { getProjectIssueList, getProjectIssueListByTree, getProjectUserList, getProjectVersion } from '@/api/projects'
import ElSelectAll from '@/components/ElSelectAll'
import RightPanel from './components/RightPanel'
import Status from '@/components/Issue/Status'
import Tracker from '@/components/Issue/Tracker'
import Priority from '@/components/Issue/Priority'
import axios from 'axios'

export default {
  name: 'IssueBoards',
  components: {
    RightPanel,
    ElSelectAll,
    Kanban,
    ProjectListSelector,
    Status,
    Tracker,
    Priority
  },
  data() {
    return {
      isLoading: false,
      groupBy: {
        dimension: 'status',
        value: []
      },
      filterValue: {},
      originFilterValue: {},
      displayClosed: false,
      projectIssueList: [],
      projectIssueQueue: {},
      classifyIssueList: {},
      group: 'mission',
      fixed_version: [],
      status: [],
      tracker: [],
      assigned_to: [],
      priority: [],
      relativeIssueList: [],

      searchVisible: false,
      keyword: null,

      rightPanelVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'selectedProjectId',
      'kanbanFilter',
      'kanbanGroupBy',
      'kanbanDisplayClosed',
      'kanbanKeyword'
    ]),
    filterOptions() {
      return [
        { id: 1, label: this.$t('Issue.FilterDimensions.status'), value: 'status', placeholder: 'Status', tag: true },
        { id: 2, label: this.$t('Issue.FilterDimensions.tracker'), value: 'tracker', placeholder: 'Type', tag: true },
        { id: 3, label: this.$t('Issue.FilterDimensions.assigned_to'), value: 'assigned_to', placeholder: 'Member' },
        {
          id: 4,
          label: this.$t('Issue.FilterDimensions.fixed_version'),
          value: 'fixed_version',
          placeholder: 'Version'
        },
        {
          id: 5,
          label: this.$t('Issue.FilterDimensions.priority'),
          value: 'priority',
          placeholder: 'Priority',
          tag: true
        }
      ]
    },
    groupByOptions() {
      const dimension = (this.groupBy.dimension === 'status') ? this.filterClosedStatus(this[this.groupBy.dimension]) : this[this.groupBy.dimension]
      return dimension.map((item, idx) => ({
        id: idx,
        label: this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name,
        value: item
      }))
    },
    groupByValueOnBoard() {
      if (this.groupBy.value.length <= 0) {
        return this[this.groupBy.dimension].map(item => item)
      }
      return this.groupBy.value
    },
    showSelectedGroupByName() {
      return this.filterOptions.find((item) => (item.value === this.groupBy.dimension)).label
    },
    showSelectedGroupByLength() {
      if (this.groupByOptions.length === this.groupBy.value.length || this.groupBy.value.length === 0) {
        return this.$t('general.All')
      }
      return this.groupBy.value.length
    },
    listFilter() {
      const result = []
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          const value = this[item].find((search) => (search.id === this.filterValue[item]))
          if (value) {
            result.push((this.$te('Issue.' + value.name)) ? this.$t('Issue.' + value.name) : value.name)
          }
        }
      })
      return this.$t('general.Filter') + ((result.length > 0) ? ': ' : '') + result.join(', ')
    },
    isFilterChanged() {
      for (const item of Object.keys(this.filterValue)) {
        const checkFilterValue = this.filterValue
        if (checkFilterValue[item] === '') {
          delete checkFilterValue[item]
        }
        if (this.originFilterValue[item] !== checkFilterValue[item]) {
          return true
        }
      }
      return !!this.keyword
    }
  },
  watch: {
    async selectedProjectId() {
      await this.loadSelectionList()
      await this.loadData()
      await this.cleanFilter()
    },
    isLoading(value) {
      if (!value) {
        this.classifyIssue()
      }
    }
  },
  async created() {
    this.filterValue = this.kanbanFilter
    this.groupBy = this.kanbanGroupBy
    this.displayClosed = this.kanbanDisplayClosed
    this.keyword = this.kanbanKeyword
    await this.loadSelectionList()
    await this.loadData()
  },
  methods: {
    ...mapActions('projects', [
      'getProjectUserList',
      'setKanbanFilter',
      'setKanbanGroupByDimension',
      'setKanbanGroupByValue',
      'setKanbanDisplayClosed',
      'setKanbanKeyword'
    ]),
    async loadData() {
      try {
        await this.fetchData()
      } catch (e) {
        // null
      }
    },
    async fetchData() {
      await this.resetClassifyIssue()
      this.projectIssueList = {}
      await this.syncLoadFilterData()
      await this.getRelativeList()
    },
    async getRelativeList() {
      const isHasClosed = this.groupByValueOnBoard.filter((item) => (item.hasOwnProperty('is_closed') && item.is_closed))
      if (isHasClosed.length > 0) {
        const projectIssueListRes = await getProjectIssueListByTree(this.selectedProjectId)
        this.relativeIssueList = this.createRelativeList(projectIssueListRes.data) // 取得project全部issue by status
      }
    },
    checkInFilterValue(value) {
      if (this.groupBy.value.length <= 0) return true
      return this.groupBy.value.find(item => item.id === value)
    },
    classifyIssue() {
      this.resetClassifyIssue()
      const issueList = this.projectIssueList
      issueList.forEach(issue => {
        if (issue) {
          let dimensionName = issue[this.groupBy.dimension].id
          if (!dimensionName) {
            dimensionName = ''
          }
          if (this.checkInFilterValue(dimensionName)) {
            if (!this.classifyIssueList.hasOwnProperty(dimensionName)) {
              this.classifyIssueList[dimensionName] = []
            }
            this.classifyIssueList[dimensionName].push(issue)
          }
        }
      })
      this.sortIssue()
    },
    getParams() {
      const result = {}
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          result[item + '_id'] = this.filterValue[item]
        }
      })
      if (!this.displayClosed && this.groupBy.dimension !== 'status') {
        result['status_id'] = 'open'
      }
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    async syncLoadFilterData() {
      await this.cancelLoadFilterData()
      this.projectIssueQueue = {}
      this.projectIssueList = []
      const getIssueList = []
      this.isLoading = true
      for (const item of this.groupByValueOnBoard) {
        const CancelToken = axios.CancelToken.source()
        getIssueList.push(getProjectIssueList(this.selectedProjectId,
          { ...this.getParams(), [this.groupBy.dimension + '_id']: item.id },
          CancelToken.token))
        this.$set(this.projectIssueQueue, item.id, CancelToken)
      }
      await Promise.all(getIssueList)
        .then((res) => {
          const issueList = res.map(item => item.data)
          const list = [].concat.apply([], issueList)
          this.$set(this.$data, 'projectIssueList', list)
        })
        .catch((e) => {
          console.log(e)
        })
        .finally(() => {
          this.projectIssueQueue = {}
          this.isLoading = false
        })
    },
    cancelLoadFilterData() {
      Object.values(this.projectIssueQueue).forEach((item) => {
        item.cancel()
      })
    },
    sortByDueDate(a, b) {
      return new Date(a.due_date) - new Date(b.due_date)
    },
    async loadSelectionList() {
      await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getProjectVersion(this.selectedProjectId),
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority()
      ]).then(res => {
        const [assigneeList, versionList, typeList, statusList, priorityList] = res.map(
          item => item.data
        )
        this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.versions]
        const version = this.fixed_version.sort(this.sortByDueDate).filter((item) => ((new Date(item.due_date) >= new Date()) && item.status === 'open'))
        if (version.length > 0) {
          if (Object.keys(this.kanbanFilter).length <= 0) {
            this.$set(this.filterValue, 'fixed_version', version[0].id)
          }
          this.$set(this.originFilterValue, 'fixed_version', version[0].id)
        }

        this.tracker = typeList
        this.assigned_to = [
          { name: this.$t('Issue.Unassigned'), id: 'null' },
          ...assigneeList.user_list
        ]
        this.status = statusList
        this.setGroupByUnclosedStatus(false)
        this.priority = priorityList
        // if (this.userRole === 'Engineer') {
        //   this.$set(this.filterValue, 'assigned_to', this.userId)
        //   this.$set(this.originFilterValue, 'assigned_to', this.userId)
        // }
      })
    },
    setGroupByUnclosedStatus(check) {
      if (check) {
        this.$set(this.groupBy, 'value', this.status)
      } else {
        this.$set(this.groupBy, 'value', this.status.filter((item) => (item.is_closed === false)))
      }
    },
    resetClassifyIssue() {
      this.classifyIssueList = {}
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    async updateIssueBoard() {
      await this.fetchData()
    },
    async updateIssueStatus(evt) {
      if (evt.event.hasOwnProperty('added')) {
        this.isLoading = true
        // const getUpdateDimension = this[this.groupBy.dimension].find((item) => ((evt.list === '') ? item.id === evt.list : item.name === evt.list))
        try {
          const res = await updateIssue(evt.event.added.element.id, { [this.groupBy.dimension + '_id']: evt.boardObject.id })
          await this.updateRelationIssue(this.projectIssueList, res.data)
          this.projectIssueList.forEach(item => {
            if (item.id === evt.event.added.element.id) {
              item[this.groupBy.dimension] = evt.boardObject
            }
          })
        } catch (e) {
          // error
        }
        this.isLoading = false
        await this.getRelativeList()
      }
    },
    updateRelationIssue(list, updatedIssue) {
      list.forEach((issue) => {
        if (issue.hasOwnProperty('parent') && issue.parent.id === updatedIssue.id) {
          this.$set(issue, 'parent', updatedIssue)
        }
        if (issue.hasOwnProperty('children')) {
          issue.children.forEach((subIssue, idx) => {
            if (subIssue.id === updatedIssue.id) {
              this.$set(issue['children'], idx, updatedIssue)
            }
          })
        }
        if (issue.hasOwnProperty('relations')) {
          issue.relations.forEach((subIssue, idx) => {
            if (subIssue.id === updatedIssue.id) {
              this.$set(issue['relations'], idx, updatedIssue)
            }
          })
        }
      })
    },
    async quickUpdateIssue(event) {
      const { id, value } = event
      this.isLoading = true
      const filterDimension = Object.keys(value)[0]
      try {
        await updateIssue(id, { [filterDimension + '_id']: value[filterDimension].id })
        this.projectIssueList.forEach(item => {
          if (item.id === id) {
            item[filterDimension] = value[filterDimension]
          }
        })
      } catch (e) {
        // error
      }
      this.isLoading = false
    },
    sortIssue() {
      const sortPriority = (a, b) => (a.priority.id - b.priority.id)
      const sortDueDate = (a, b) => (new Date(b.due_date) - new Date(a.due_date))
      Object.keys(this.classifyIssueList).forEach((item) => {
        this.$set(this.classifyIssueList, item, this.classifyIssueList[item].sort(sortDueDate).sort(sortPriority))
      })
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
      e.target.classList.add('draggingObject')
      e.dataTransfer.setData('json', JSON.stringify(item))
    },
    dragEnd(e) {
      e.target.classList.remove('draggingObject')
    },
    getFilterValueList(value) {
      return this[value]
    },
    isRightPanelItemHasComponents(name) {
      return ['status', 'tracker'].includes(name)
    },
    handleRightPanelVisible(value) {
      this.rightPanelVisible = value
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = null
      this.displayClosed = false
      this.setGroupByUnclosedStatus(this.displayClosed)
      this.onChangeGroupByDimension('status')
      this.onChangeFilter()
    },
    onChangeFilter() {
      this.setKanbanFilter(this.filterValue)
      this.setKanbanKeyword(this.keyword)
      this.setKanbanDisplayClosed(this.displayClosed)
      this.setGroupByUnclosedStatus(this.displayClosed)
      this.loadData()
    },
    onChangeGroupByDimension(value) {
      this.$set(this.groupBy, 'dimension', value)
      if (this.filterValue.hasOwnProperty(this.groupBy.dimension)) {
        this.$delete(this.filterValue, this.groupBy.dimension)
      }
      if (this.groupBy.dimension === 'status') {
        this.setGroupByUnclosedStatus(false)
      } else {
        this.setGroupByUnclosedStatus(true)
      }
      this.setKanbanGroupByDimension(this.groupBy.dimension)
      this.loadData()
    },
    onChangeGroupByValue(value) {
      this.$set(this.groupBy, 'value', value)
      this.setKanbanGroupByValue(this.groupBy.value)
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.app-container {
  overflow: hidden;
}

.board {
  display: flex;
  justify-content: start;
  flex-wrap: nowrap;
  height: calc(100vh - 50px - 40px - 40px - 25px - 10px);
  overflow-x: auto;

  &.is-panel {
    width: calc(100% - 260px);
  }

  .kanban {
    flex: 0 0 280px;

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

      .InProgress {
        background: $inProgress;
      }

      .Verified {
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

    > > > &.inprogress {
      .board-column-header {
        .header-bar {
          background: $inProgress;
        }
      }
    }

    > > > &.verified {
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

    > > > &.feature {
      .board-column-header {
        .header-bar {
          background: $feature;
        }
      }
    }

    > > > &.bug {
      .board-column-header {
        .header-bar {
          background: $bug;
        }
      }
    }

    > > > &.document {
      .board-column-header {
        .header-bar {
          background: $document;
        }
      }
    }

    > > > &.research {
      .board-column-header {
        .header-bar {
          background: $research;
        }
      }
    }
  }
}

> > > .rightPanel-items {
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
