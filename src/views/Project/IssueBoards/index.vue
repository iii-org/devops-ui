<template>
  <el-row class="app-container">
    <el-row>
      <project-list-selector>
        <el-popover
          placement="bottom"
          trigger="click"
        >
          <el-form v-loading="isLoading">
            <template v-for="dimension in filterOptions">
              <el-form-item v-if="groupBy.dimension!==dimension.value" :key="dimension.id">
                <div slot="label">
                  {{ $t('Issue.'+dimension.value) }}
                  <el-tag v-if="dimension.value==='fixed_version'" type="info" class="flex-1">
                    <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
                  </el-tag>
                </div>
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
                    :key="(dimension.value==='assigned_to')? item.login: item.id"
                    :label="getSelectionLabel(item)"
                    :class="{[item.class]:item.class}"
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
      </project-list-selector>
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
        :add-issue="saveIssue"
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
                {{ getTranslateHeader(subItem.name) }}
              </el-tag>
              <el-alert class="help_text" :closable="false">
                <i18n path="Issue.DragTip">
                  <b slot="key">{{ item.label }}</b>
                  <b slot="value">{{ getTranslateHeader(subItem.name) }}</b>
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
import Fuse from 'fuse.js'
import { Kanban, RightPanel } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import { addIssue, getIssuePriority, getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
import { getProjectIssueList, getProjectIssueListByTree, getProjectUserList, getProjectVersion } from '@/api/projects'
import ElSelectAll from '@/components/ElSelectAll'
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
      fixed_version_closed: false,
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
      'userId',
      'initKanban',
      'kanbanFilter',
      'kanbanGroupBy',
      'kanbanDisplayClosed',
      'kanbanKeyword',
      'fixedVersionShowClosed'
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
      let dimension = (this.groupBy.dimension === 'status') ? this.filterClosedStatus(this[this.groupBy.dimension]) : this[this.groupBy.dimension]
      dimension = (this.groupBy.dimension === 'assigned_to') ? this.filterMe(dimension) : dimension
      return dimension.map((item, idx) => ({
        id: idx,
        label: this.getTranslateHeader(item.name),
        value: item
      }))
    },
    groupByValueOnBoard() {
      if (this.groupBy.value.length <= 0) {
        let value = (this.groupBy.dimension === 'status') ? this.filterClosedStatus(this[this.groupBy.dimension]) : this[this.groupBy.dimension]
        value = (this.groupBy.dimension === 'assigned_to') ? this.filterMe(value) : value
        return value.map(item => item)
      }
      return (this.groupBy.dimension === 'assigned_to') ? this.filterMe(this.groupBy.value) : this.groupBy.value
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
            result.push(this.getSelectionLabel(value))
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
      await this.cleanFilter()
    },
    isLoading(value) {
      if (!value) {
        this.updateData()
      }
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    }
  },
  async created() {
    this.filterValue = this.kanbanFilter
    this.groupBy = this.kanbanGroupBy
    this.displayClosed = this.kanbanDisplayClosed
    this.keyword = this.kanbanKeyword
    this.fixed_version_closed = this.fixedVersionShowClosed
    await this.loadSelectionList()
    this.setInitKanban(true)
    await this.loadData()
  },
  methods: {
    ...mapActions('projects', [
      'getProjectUserList',
      'setInitKanban',
      'setKanbanFilter',
      'setKanbanGroupByDimension',
      'setKanbanGroupByValue',
      'setKanbanDisplayClosed',
      'setKanbanKeyword',
      'setFixedVersionShowClosed'
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
      await this.updateData()
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
      const issueList = this.projectIssueList
      this.groupByValueOnBoard.forEach((dimension) => {
        if (!this.classifyIssueList.hasOwnProperty(dimension.id)) {
          this.classifyIssueList[dimension.id] = []
        }
      })
      issueList.forEach(issue => {
        if (issue) {
          let dimensionName = issue[this.groupBy.dimension].id
          if (!dimensionName) {
            dimensionName = 'null'
          }
          if (this.checkInFilterValue(dimensionName)) {
            this.classifyIssueList[dimensionName].push(issue)
          }
        }
      })
      this.sortIssue()
    },
    getParams() {
      const result = {}
      if (!this.displayClosed && this.groupBy.dimension !== 'status') {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          result[item + '_id'] = this.filterValue[item]
        }
      })
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    async syncLoadFilterData() {
      await this.cancelLoadFilterData()
      this.projectIssueQueue = {}
      const getIssueList = []
      this.isLoading = true
      for (const item of this.groupByValueOnBoard) {
        const CancelToken = axios.CancelToken.source()
        getIssueList.push(getProjectIssueList(this.selectedProjectId,
          { ...this.getParams(), [this.groupBy.dimension + '_id']: item.id },
          { cancelToken: CancelToken.token }))
        this.$set(this.projectIssueQueue, item.id, CancelToken)
      }
      this.projectIssueList = []
      await Promise.all(getIssueList)
        .then((res) => {
          const issueList = res.map(item => item.data)
          const list = [].concat.apply([], issueList)
          this.$set(this.$data, 'projectIssueList', list)
        })
        .catch((e) => {
          console.error(e)
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
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      let versionList = await getProjectVersion(this.selectedProjectId, params)
      versionList = versionList.data.versions
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList]
      const version = this.fixed_version.filter((item) => ((new Date(item.due_date) >= new Date()) && item.status !== 'closed'))
      if (version.length > 0) {
        if (!this.initKanban) {
          this.$set(this.filterValue, 'fixed_version', version[0].id)
        }
        this.$set(this.originFilterValue, 'fixed_version', version[0].id)
      } else {
        this.$delete(this.filterValue, 'fixed_version')
        this.$delete(this.originFilterValue, 'fixed_version')
      }
    },
    async loadSelectionList() {
      await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority()
      ]).then(res => {
        const [assigneeList, typeList, statusList, priorityList] = res.map(
          item => item.data
        )

        this.tracker = typeList
        this.assigned_to = [
          { name: this.$t('Issue.Unassigned'), id: 'null' },
          {
            name: this.$t('Issue.me'),
            login: '-Me-',
            id: this.userId,
            class: 'bg-yellow-100'
          },
          ...assigneeList.user_list
        ]
        this.status = statusList
        this.priority = priorityList
        // if (this.userRole === 'Engineer') {
        //   this.$set(this.filterValue, 'assigned_to', this.userId)
        //   this.$set(this.originFilterValue, 'assigned_to', this.userId)
        // }
      })
      await this.loadVersionList(this.fixed_version_closed)
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
    searchKanbanCard(value, opt) {
      Object.keys(this.classifyIssueList).forEach(item => {
        if (value === 'null') {
          this.classifyIssueList[item] = this.classifyIssueList[item].filter(subItem => {
            const findKey = opt['keys'][0].split('.')
            const findName = findKey.reduce((total, current) => total[current], subItem)
            return findName === undefined && findKey[0] !== ''
          })
        } else {
          const fuse = new Fuse(this.classifyIssueList[item], opt)
          const res = fuse.search(`="${value}"`)
          this.classifyIssueList[item] = res.map(items => items.item)
        }
      })
    },
    updateData() {
      this.resetClassifyIssue()
      this.classifyIssue()
      Object.keys(this.filterValue).forEach((item) => {
        const searchOpt = {
          keys: [item + '.id'],
          useExtendedSearch: true
        }
        this.searchKanbanCard(this.filterValue[item], searchOpt)
      })
    },
    async updateIssueBoard() {
      await this.fetchData()
      await this.updateData()
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
        await this.updateData()
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
    async saveIssue(data) {
      return await addIssue(data)
        .then(res => {
          // noinspection JSCheckFunctionSignatures
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.loadData()
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.subject = ''
          return res
        })
        .catch(error => {
          return error
        })
    },
    sortIssue() {
      // const sortPriority = (a, b) => (a.priority.id - b.priority.id)
      const sortUpdateOn = (a, b) => (new Date(b.updated_on) - new Date(a.updated_on))
      Object.keys(this.classifyIssueList).forEach((item) => {
        this.$set(this.classifyIssueList, item, this.classifyIssueList[item].sort(sortUpdateOn))
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
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.getTranslateHeader(item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.getTranslateHeader(item.status)) + ')'
      }
      if (item.hasOwnProperty('login')) {
        result += ' (' + (item.login) + ')'
      }
      return result
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
    filterMe(userList) {
      return userList.filter((item) => (item.login !== '-Me-'))
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = null
      this.displayClosed = false
      this.onChangeGroupByDimension('status')
      this.onChangeFilter()
    },
    onChangeFilter() {
      this.setKanbanFilter(this.filterValue)
      this.setKanbanKeyword(this.keyword)
      this.setKanbanDisplayClosed(this.displayClosed)
      this.loadData()
    },
    onChangeGroupByDimension(value) {
      this.$set(this.groupBy, 'dimension', value)
      if (this.filterValue.hasOwnProperty(this.groupBy.dimension)) {
        this.$delete(this.filterValue, this.groupBy.dimension)
      }
      this.setKanbanGroupByDimension(this.groupBy.dimension)
      this.$set(this.groupBy, 'value', [])
      this.$refs['groupByValue'].selected = []
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
  height: calc(100vh - 70px - 40px - 40px - 25px - 10px);
  overflow-x: auto;

  &.is-panel {
    width: calc(100% - 260px);
  }

  .kanban {
    flex: 0 0 280px;
    margin-bottom: 0;

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
