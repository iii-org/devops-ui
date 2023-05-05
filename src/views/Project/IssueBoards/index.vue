<template>
  <div
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    class="app-container"
  >
    <ProjectListSelector>
      <CustomFilter
        v-if="socket.connected"
        ref="customFilter"
        type="issue_board"
        :group-by="groupBy"
        :selection-options="contextOptions"
        @apply-filter="applyCustomFilter"
      />
      <el-popover
        v-if="socket.connected"
        popper-class="popper"
        placement="bottom"
        trigger="click"
        @hide="resetSaveFilterButtons"
      >
        <el-form v-loading="isLoading">
          <template v-for="dimension in filterOptionsWithProject">
            <el-form-item
              v-if="groupBy.dimension !== dimension.value"
              :key="dimension.id"
            >
              <div slot="label">
                {{ $t('Issue.' + dimension.value) }}
                <el-tag
                  v-if="dimension.value ==='fixed_version'"
                  type="info"
                  class="flex-1"
                >
                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
                </el-tag>
              </div>
              <el-select
                v-model="filterValue[dimension.value]"
                :placeholder="$t(`Issue.Select${dimension.placeholder}`)"
                :disabled="projectId === -1"
                filterable
                clearable
                value-key="id"
                :multiple="dimension.value === 'tags'"
                :collapse-tags="dimension.value === 'tags'"
                @change="onChangeFilter"
              >
                <el-option
                  v-for="item in (dimension.value === 'status') ? filterClosedStatus(getOptionsData(dimension.value)) : getOptionsData(dimension.value)"
                  :key="dimension.value === 'assigned_to' ? item.login : item.id"
                  :label="getSelectedLabel(item)"
                  :class="{[item.class]: item.class}"
                  :value="item.id"
                >
                  <component
                    :is="dimension.value"
                    v-if="dimension.tag"
                    :name="$t(`Issue.${item.name}`)"
                    :type="item.name"
                  />
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item
            :label="$t('Issue.DisplayClosedIssue')"
            class="checkbox"
          >
            <el-checkbox
              v-model="displayClosed"
              @change="onChangeFilter"
            />
          </el-form-item>
        </el-form>
        <SaveFilterButton
          ref="saveFilterButton"
          type="issue_board"
          :filter-value="filterValueClone"
          :group-by="groupBy"
          @update="onCustomFilterAdded"
        />

        <el-button
          slot="reference"
          :loading="isLoading"
          icon="el-icon-s-operation"
          class="headerTextColor"
          type="text"
        > {{ displayFilterValue }}
          <em class="el-icon-arrow-down el-icon--right" />
        </el-button>
      </el-popover>
      <el-divider v-if="socket.connected" direction="vertical" />
      <el-popover
        v-if="socket.connected"
        placement="bottom"
        trigger="click"
      >
        <el-form v-loading="isLoading">
          <el-form-item :label="$t('Issue.FilterDimensions.label')">
            <el-select
              v-model="groupBy.dimension"
              class="mr-4"
              filterable
              @change="onChangeGroupByDimension($event, true)"
            >
              <template v-for="item in filterOptions">
                <el-option
                  v-if="item.value !== 'tags'"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </template>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('Issue.Display')">
            <el-select-all
              ref="groupByValue"
              :value="groupBy.value"
              filterable
              multiple
              collapse-tags
              :loading="isLoading"
              :options="groupByOptions"
              value-key="id"
              @change="onChangeGroupByValue($event, true)"
            />
          </el-form-item>
        </el-form>
        <el-button
          slot="reference"
          :loading="isLoading"
          class="headerTextColor"
          type="text"
        >
          <i18n path="Issue.GroupBy">
            <strong slot="filter">{{ showSelectedGroupByName }}</strong>
          </i18n>
          ({{ showSelectedGroupByLength }})
          <em class="el-icon-arrow-down el-icon--right" />
        </el-button>
      </el-popover>
      <el-tooltip
        placement="bottom"
        :open-delay="100"
        :content="socket.connected ?
          $t('general.SocketConnected') :
          $t('general.ReconnectByReload')"
      >
        <div style="float:left;">
          <el-button slot="button" :disabled="isLoading" :type="(socket.connected)? 'success': 'danger'" @click="onSocketConnect">
            <div class="dot inline-block" :class="(socket.connected)? 'bg-success': 'bg-danger'" />
            {{ (socket.connected) ? $t('general.Connected') : $t('general.Disconnected') }}
          </el-button>
        </div>
      </el-tooltip>
      <el-tooltip
        v-if="socket.disconnected"
        placement="bottom"
        :open-delay="100"
        :content="$t('general.Reload')"
      >
        <el-button
          class="ml-2 buttonPrimaryReverse"
          icon="el-icon-refresh"
          style="float:left;"
          circle
          @click="reloadPage"
        />
      </el-tooltip>
      <el-divider v-if="socket.connected" direction="vertical" />
      <el-input
        v-if="searchVisible && socket.connected"
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
      <el-button
        v-if="!searchVisible && socket.connected"
        type="text"
        :loading="isLoading"
        class="headerTextColor"
        icon="el-icon-search"
        @click="searchVisible=!searchVisible"
      >
        {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
      </el-button>
      <template v-if="isFilterChanged && socket.connected">
        <el-divider direction="vertical" />
        <el-button
          size="small"
          icon="el-icon-close"
          class="buttonSecondaryReverse"
          :loading="isLoading"
          @click="cleanFilter"
        >
          {{ $t('Issue.CleanFilter') }}
        </el-button>
      </template>
    </ProjectListSelector>
    <el-divider />
    <Boards
      :group-by="groupBy"
      :display-closed="displayClosed"
      :filter-options="filterOptions"
      :context-options="contextOptions"
      :relative-issue-list="relativeIssueList"
      :classify-issue-list="classifyIssueList"
      :project-issue-list="projectIssueList"
      :fixed_version="fixed_version"
      :assigned_to="assigned_to"
      :element-ids="elementIds"
      :project-id="projectId"
      @getRelativeList="getRelativeList"
      @updateIssueList="updateIssueList"
      @updateData="updateData"
    />
  </div>
</template>

//TODO: move dimension filter into SearchFilter.vue
<script>
import { mapGetters, mapActions } from 'vuex'
import {
  getProjectIssueList,
  getProjectIssueListByTree,
  getProjectUserList,
  getProjectVersion,
  getTagsByProject
} from '@/api/projects'
import { getHasSon, getProjectRelation } from '@/api_v2/projects'
import axios from 'axios'
import Fuse from 'fuse.js'
import { io } from 'socket.io-client'
import { ProjectListSelector, ElSelectAll } from '@/components'
import { Status, Tracker, Priority, CustomFilter } from '@/components/Issue'
import SaveFilterButton from '@/components/Issue/components/SaveFilterButton'
import Boards from '@/views/Project/IssueBoards/components/Boards'

export default {
  name: 'IssueBoards',
  components: {
    Boards,
    ElSelectAll,
    ProjectListSelector,
    Status,
    Tracker,
    Priority,
    CustomFilter,
    SaveFilterButton
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
      fixed_version: [],
      assigned_to: [],
      tags: [],
      relativeIssueList: [],
      searchVisible: false,
      keyword: null,
      elementIds: [],
      hasChildren: false,
      project: [],
      filterOptions: [{
        id: 1,
        label: this.$t('Issue.FilterDimensions.status'),
        value: 'status',
        placeholder: 'Status',
        tag: true
      },
      {
        id: 3,
        label: this.$t('Issue.FilterDimensions.tracker'),
        value: 'tracker',
        placeholder: 'Type',
        tag: true
      },
      {
        id: 4,
        label: this.$t('Issue.FilterDimensions.assigned_to'),
        value: 'assigned_to',
        placeholder: 'Member'
      },
      {
        id: 5,
        label: this.$t('Issue.FilterDimensions.fixed_version'),
        value: 'fixed_version',
        placeholder: 'Version'
      },
      {
        id: 6,
        label: this.$t('Issue.FilterDimensions.priority'),
        value: 'priority',
        placeholder: 'Priority',
        tag: true
      }],
      socket: io(`/issues/websocket`, { // production socket
        reconnectionAttempts: 5,
        forceNew: true
      })
      // socket: io(`${process.env.VUE_APP_BASE_API}/issues/websocket`, { // development socket
      //   reconnectionAttempts: 5
      // })
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userId', 'tracker', 'status', 'priority', 'fixedVersionShowClosed']),
    contextOptions() {
      const result = {}
      const getOptions = ['assigned_to', 'fixed_version', 'tags']
      getOptions.forEach((item) => {
        result[item] = this[item]
      })
      return result
    },
    filterOptionsWithProject() {
      return this.hasChildren ? [{
        id: this.filterOptions.length + 1,
        value: 'project',
        placeholder: 'Project'
      }].concat(this.filterOptions) : this.filterOptions
    },
    groupByOptions() {
      return this.getStatusSort.map((item, idx) => ({
        id: idx,
        label: this.getTranslateHeader(item.name),
        value: item
      }))
    },
    groupByValueOnBoard() {
      if (this.groupBy.value.length <= 0) {
        return this.getStatusSort.map((item) => item)
      }
      return this.groupBy.dimension === 'assigned_to' ? this.filterMe(this.groupBy.value) : this.groupBy.value
    },
    getStatusSort() {
      const dimension = this.groupBy.dimension
      let sort = dimension === 'status' ? this.filterClosedStatus(this[dimension]) : this[dimension]
      sort = dimension === 'assigned_to' ? this.filterMe(sort) : sort
      return sort
    },
    filterClosedStatus() {
      return function (statusList) {
        if (this.displayClosed) return statusList
        return statusList.filter((item) => item.is_closed === false)
      }
    },
    showSelectedGroupByName() {
      return this.filterOptions.find((item) => item.value === this.groupBy.dimension).label
    },
    showSelectedGroupByLength() {
      if (this.groupByOptions.length === this.groupBy.value.length || this.groupBy.value.length === 0) {
        return this.$t('general.All')
      }
      return this.groupBy.value.length
    },
    displayFilterValue() {
      const selectedLabels = this.getSelectedLabels
      const colon = selectedLabels.length > 0 ? ': ' : ''
      const factor = selectedLabels.join(', ')
      return `${this.$t('general.Filter')}${colon}${factor}`
    },
    getSelectedLabels() {
      const selectedLabels = []
      Object.keys(this.filterValue).forEach((item) => {
        if (!this.filterValue[item]) return
        if (this.filterValue[item].length <= 0) {
          this.$delete(this.filterValue, item)
          return
        }
        const isArray = Array.isArray(this.filterValue[item]) && this.filterValue[item].length > 0
        isArray ? selectedLabels.push(this.handleArrayLabels(item)) : selectedLabels.push(this.handleLabels(item))
      })
      return selectedLabels
    },
    handleArrayLabels() {
      return function (item) {
        let label = ''
        const value = this.getOptionsData(item).filter((search) => this.filterValue[item].includes(search.id))
        if (value) {
          const joinedString = value.map((subItem) => this.getSelectedLabel(subItem)).join('/')
          label = `#${joinedString}`
        }
        return label
      }
    },
    handleLabels() {
      return function (item) {
        let label = ''
        const value = this.getOptionsData(item).find((search) => search.id === this.filterValue[item])
        if (value) label = this.getSelectedLabel(value)
        return label
      }
    },
    isFilterChanged() {
      return this.checkFilterValue('originFilterValue') || this.checkFilterValue('filterValue') || !!this.keyword || this.groupBy.dimension !== 'status'
    },
    getFilteredVersion() {
      return this.fixed_version.filter((item) => {
        const validDate = new Date(`${item.due_date}T23:59:59`) >= new Date()
        const closedStatus = item.status !== 'closed'
        return validDate && closedStatus
      })
    },
    checkInFilterValue() {
      return function (value) {
        if (this.groupBy.value.length <= 0) return true
        return this.groupBy.value.find((item) => item.id === value)
      }
    },
    filterValueClone() {
      return Object.assign({}, this.filterValue, {
        groupBy: this.groupBy,
        fixed_version_closed: this.fixed_version_closed,
        displayClosed: this.displayClosed
      })
    }
  },
  watch: {
    selectedProjectId: {
      async handler(newId, oldId) {
        this.socket.emit('leave', { project_id: oldId })
        this.socket.emit('join', { project_id: newId })
        await this.onCleanKeyWord()
        this.projectId = this.selectedProjectId
        this.filterValue = {}
        await this.fetchInitData()
      },
      immediate: true
    },
    isLoading(value) {
      if (!value) {
        this.updateData()
      }
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed({ board: value })
      this.loadVersionList(value)
    },
    async 'filterValue.project'(value) {
      if (value) this.projectId = value
      else this.projectId = this.selectedProjectId
      await this.onCleanKeyWord()
      if (value) this.filterValue.project = value
      await this.loadSelectionList()
      await this.getInitStoredData()
      await this.loadVersionList()
    }
  },
  async created() {
    this.connectSocket()
    this.projectId = this.selectedProjectId
    this.connectSocket()
    this.intervalTimer = window.setInterval(() => this.connectSocket(), 30000)
    // await this.fetchInitData()
  },
  beforeDestroy() {
    this.socket.disconnect()
    window.clearInterval(this.intervalTimer)
  },
  methods: {
    ...mapActions('projects', [
      'getProjectUserList',
      'getGroupBy',
      'getIssueFilter',
      'getKeyword',
      'getDisplayClosed',
      'getFixedVersionShowClosed',
      'setGroupBy',
      'setIssueFilter',
      'setKeyword',
      'setDisplayClosed',
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
      this.projectIssueList = []
      await this.syncLoadFilterData()
      await this.getRelativeList()
    },
    async fetchInitData() {
      this.groupBy = await this.getGroupBy()
      await this.checkProjectHasChildren()
      await this.getInitStoredData()
      await this.loadSelectionList()
      await this.loadData()
      await this.syncLoadFilterData()
    },
    async checkProjectHasChildren() {
      this.hasChildren = (await getHasSon(this.projectId)).has_child
      if (this.hasChildren) {
        const res = (await getProjectRelation(this.projectId)).data
        this.project = res[0].child
        this.project.unshift(res[0].parent)
      }
    },
    async getInitStoredData() {
      const key = 'board'
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed, storedVersionClosed } = storedData
      this.filterValue = storedFilterValue[key] ? storedFilterValue[key] : {}
      if (this.filterValue.hasOwnProperty('assigned_to')) {
        const findChangeIndex = this.assigned_to.findIndex(issue => parseInt(this.filterValue.assigned_to) === parseInt(issue.id))
        if (findChangeIndex < 0) this.$delete(this.filterValue, 'assigned_to')
      }
      this.$delete(this.filterValue, 'tags')
      this.keyword = storedKeyword[key] ? storedKeyword[key] : null
      this.displayClosed = storedDisplayClosed[key] ? storedDisplayClosed[key] : false
      this.fixed_version_closed = storedVersionClosed[key] ? storedVersionClosed[key] : false
    },
    async fetchStoredData() {
      let storedFilterValue, storedKeyword, storedDisplayClosed, storedVersionClosed
      await Promise.all([
        this.getIssueFilter(),
        this.getKeyword(),
        this.getDisplayClosed(),
        this.getFixedVersionShowClosed()
      ]).then((res) => {
        const [filterValue, keyword, displayClosed, fixedVersionClosed] = res.map((item) => item)
        storedFilterValue = filterValue
        storedKeyword = keyword
        storedDisplayClosed = displayClosed
        storedVersionClosed = fixedVersionClosed
      })
      return { storedFilterValue, storedKeyword, storedDisplayClosed, storedVersionClosed }
    },
    /**
     * if clicked to show closed issues, fetch the whole issues by tree in project
     * and then sort by status
     */
    async getRelativeList() {
      const hasClosed = this.groupByValueOnBoard.filter((item) => item.hasOwnProperty('is_closed') && item.is_closed)
      if (hasClosed.length > 0) {
        const projectIssueListRes = await getProjectIssueListByTree(this.projectId)
        this.relativeIssueList = this.createRelativeList(projectIssueListRes.data)
      }
    },
    classifyIssue() {
      const issueList = this.projectIssueList
      this.checkGroupByValueOnBoard()
      issueList.forEach((issue) => {
        if (issue) {
          let dimensionName = issue[this.groupBy.dimension].id
          dimensionName = dimensionName || 'null'
          if (!this.classifyIssueList[dimensionName]) return
          if (this.checkInFilterValue(dimensionName)) this.classifyIssueList[dimensionName].push(issue)
        }
      })
      this.sortIssue()
    },
    checkGroupByValueOnBoard() {
      this.groupByValueOnBoard.forEach((dimension) => {
        if (!this.classifyIssueList.hasOwnProperty(dimension.id)) {
          this.classifyIssueList[dimension.id] = []
        }
      })
    },
    getParams() {
      const result = {}
      if (!this.displayClosed && this.groupBy.dimension !== 'status') result['status_id'] = 'open'
      if (this.keyword) result['search'] = this.keyword
      Object.keys(this.filterValue).forEach((param) => {
        if (this.filterValue[param]) {
          const isArray = param === 'tags' && this.filterValue[param].length > 0
          if (isArray) {
            result[param] = this.filterValue[param].join(',')
          } else {
            result[`${param}_id`] = this.filterValue[param]
          }
        }
      })
      return result
    },
    async syncLoadFilterData() {
      await this.cancelLoadFilterData()
      this.projectIssueQueue = {}
      this.isLoading = true
      const getIssueList = this.getIssueList()
      this.projectIssueList = []
      await this.setIssueList(getIssueList)
      this.updateData()
      this.projectIssueQueue = {}
      this.isLoading = false
    },
    getIssueList() {
      const issueList = []
      this.groupByValueOnBoard.forEach((item) => {
        const { CancelToken, config } = this.getCancelToken()
        this.$set(this.projectIssueQueue, item.id, CancelToken)
        const dimension = this.groupBy.dimension === 'tags' ? this.groupBy.dimension : `${this.groupBy.dimension}_id`
        const params = { ...this.getParams(), [dimension]: item.id }
        const getIssueList = getProjectIssueList(this.projectId, params, config)
        issueList.push(getIssueList)
      })
      return issueList
    },
    getCancelToken() {
      const CancelToken = axios.CancelToken.source()
      const config = { cancelToken: CancelToken.token }
      return { CancelToken, config }
    },
    async setIssueList(getIssueList) {
      await Promise.all(getIssueList)
        .then((res) => {
          const issueList = res.map((item) => item.data)
          const list = [].concat.apply([], issueList)
          this.$set(this.$data, 'projectIssueList', list)
        })
        .catch((e) => {
          console.error(e)
        })
    },
    updateIssueList(index, issue) {
      this.$set(this.projectIssueList, index, issue)
    },
    cancelLoadFilterData() {
      Object.values(this.projectIssueQueue).forEach((item) => {
        item.cancel()
      })
    },
    async loadVersionList(status) {
      const params = status ? { status: 'open,locked,closed' } : { status: 'open,locked' }
      const versionList = await this.fetchVersionList(params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList]
      const version = this.getFilteredVersion
      if (version.length > 0) {
        this.setFilterValue(version)
      } else {
        this.$delete(this.originFilterValue, 'fixed_version')
        this.$delete(this.filterValue, 'fixed_version')
      }
      this.onChangeFilter()
    },
    setFilterValue(version) {
      // const sessionValue = sessionStorage.getItem('issueFilter')
      // if (!sessionValue || !JSON.parse(sessionValue)['board']) {
      //   this.$set(this.filterValue, 'fixed_version', version[0].id)
      // }
      this.$set(this.filterValue, 'fixed_version', version[0].id)
      this.$set(this.originFilterValue, 'fixed_version', version[0].id)
    },
    async fetchVersionList(params) {
      const res = await getProjectVersion(this.projectId, params)
      return res.data.versions
    },
    async loadSelectionList() {
      if (this.projectId === -1) return
      await Promise.all([getProjectUserList(this.projectId), getTagsByProject(this.projectId)]).then(
        (res) => {
          const [assigneeList, tagsList] = res.map((item) => item.data)
          this.setAssignedToData(assigneeList)
          this.tags = tagsList.tags
          // if (this.userRole === 'Engineer') {
          //   this.$set(this.filterValue, 'assigned_to', this.userId)
          //   this.$set(this.originFilterValue, 'assigned_to', this.userId)
          // }
        }
      )
      await this.loadVersionList(this.fixed_version_closed)
    },
    setAssignedToData(list) {
      const unassigned = {
        name: this.$t('Issue.Unassigned'),
        id: 'null'
      }
      const me = {
        name: this.$t('Issue.me'),
        login: '-Me-',
        id: this.userId,
        class: 'bg-yellow-100'
      }
      const userList = list.user_list
      this.assigned_to = [unassigned, me, ...userList]
    },
    getOptionsData(option_name) {
      return this[option_name]
    },
    resetClassifyIssue() {
      this.classifyIssueList = {}
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    searchKanbanCard(value, searchBy) {
      if (!value || value === '') return true
      Object.keys(this.classifyIssueList).forEach((item) => {
        value === 'null'
          ? this.searchUnassignedOrNoVersionIssues(item, searchBy)
          : this.searchByKeys(item, value, searchBy)
      })
    },
    searchUnassignedOrNoVersionIssues(item, searchBy) {
      this.classifyIssueList[item] = this.classifyIssueList[item].filter((subItem) => {
        const findKey = searchBy['keys'][0].split('.')
        const findName = findKey.reduce((total, current) => total[current], subItem)
        return findName === undefined && findKey[0] !== ''
      })
    },
    searchByKeys(item, value, searchBy) {
      const fuse = new Fuse(this.classifyIssueList[item], searchBy)
      let pattern = `="${value}"`
      if (Array.isArray(value) && value.length > 0) {
        pattern = { $or: value.map((items) => ({ $path: [searchBy['keys']], $val: `="${items}"` })) }
      }
      const res = fuse.search(pattern)
      this.classifyIssueList[item] = res.map((items) => items.item)
    },
    updateData() {
      this.resetClassifyIssue()
      this.classifyIssue()
      Object.keys(this.filterValue).forEach((item) => {
        const searchOpt = {
          keys: [`${item}.id`],
          useExtendedSearch: true
        }
        this.searchKanbanCard(this.filterValue[item], searchOpt)
      })
    },
    sortIssue() {
      const sortUpdateOn = (a, b) => new Date(b.updated_on) - new Date(a.updated_on)
      Object.keys(this.classifyIssueList).forEach((item) => {
        this.$set(this.classifyIssueList, item, this.classifyIssueList[item].sort(sortUpdateOn))
      })
    },

    checkFilterValue(key) {
      const comparedKey = this.getComparedKey(key)
      for (const item of Object.keys(this[key])) {
        const checkFilterValue = this[key]
        if (checkFilterValue[item] === '') delete checkFilterValue[item]
        if (this[comparedKey][item] !== checkFilterValue[item]) return true
      }
    },
    getComparedKey(key) {
      return key === 'filterValue' ? 'originFilterValue' : 'filterValue'
    },
    createRelativeList(list) {
      const result = []
      function flatList(parent) {
        for (const item of parent) {
          result.push(item)
          const children = item.children
          if (item.children.length) flatList(children)
        }
      }
      flatList(list)
      return result
    },
    getSelectedLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.getTranslateHeader(item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ` (${this.getTranslateHeader(item.status)})`
      }
      if (item.hasOwnProperty('login')) {
        result += ` (${item.login})`
      }
      return result
    },
    filterMe(userList) {
      return userList.filter((item) => item.login !== '-Me-')
    },
    async onCleanKeyWord() {
      this.keyword = ''
      const storedData = await this.fetchStoredData()
      storedData.storedKeyword['board'] = this.keyword
      await this.setKeyword(storedData.storedKeyword)
    },
    cleanFilter() {
      this.$emit('clean-filter')
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = ''
      this.displayClosed = false
      this.onChangeGroupByDimension('status')
      this.onChangeFilter()
      this.fixed_version_closed = false
      this.$refs.customFilter.resetApplyFilter()
    },
    async onChangeFilter() {
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
      if (this.filterValue['tags'] && this.filterValue['tags'].length <= 0) {
        this.$delete(this.filterValue, 'tags')
      }
      if (Object.prototype.hasOwnProperty.call(this.filterValue, this.groupBy.dimension)) {
        this.$delete(this.filterValue, this.groupBy.dimension)
      }
      storedFilterValue['board'] = this.filterValue
      storedKeyword['board'] = this.keyword
      storedDisplayClosed['board'] = this.displayClosed
      await this.setIssueFilter(storedFilterValue)
      await this.setKeyword(storedKeyword)
      await this.setDisplayClosed(storedDisplayClosed)
      await this.loadData()
    },
    onChangeGroupByDimension(value) {
      this.$set(this.groupBy, 'dimension', value)
      this.$set(this.groupBy, 'value', [])
      this.$refs['groupByValue'].selected = []
      this.updatedByGroupBy()
      this.onChangeFilter()
    },
    onChangeGroupByValue(value, loadData) {
      this.$set(this.groupBy, 'value', value)
      this.updatedByGroupBy(loadData)
    },
    updatedByGroupBy(loadData) {
      this.setGroupBy(this.groupBy)
      if (loadData) this.loadData()
    },
    applyCustomFilter(filters) {
      const { result, displayClosed, fixed_version_closed, groupBy } = filters
      this.filterValue = result
      this.displayClosed = displayClosed
      this.fixed_version_closed = fixed_version_closed
      this.$set(this.groupBy, 'dimension', groupBy.dimension)
      this.$set(this.groupBy, 'value', groupBy.value)
      this.setGroupBy(groupBy)
      this.onChangeFilter()
    },
    onCustomFilterAdded() {
      this.$refs.customFilter.fetchCustomFilter()
    },
    resetSaveFilterButtons() {
      this.$refs.saveFilterButton.reset()
    },
    setSocketListener() {
      const _this = this
      this.socket.on('connect', () => {
        console.log('connect')
      })
      this.socket.on('update_issue', async (data) => {
        for (const idx in data) {
          data[idx] = _this.socketDataFormat(data[idx])
          const findChangeIndex = this.projectIssueList.findIndex(issue => parseInt(data[idx].id) === parseInt(issue.id))
          this.$set(this.projectIssueList, findChangeIndex, data[idx])
          this.updateData()
          // this.showUpdateMessage(data[idx])
        }
        this.elementIds = data.map(s => s.id)
      })
      this.socket.on('delete_issue', async (data) => {
        const findChangeIndex = this.projectIssueList.findIndex(issue => parseInt(data.id) === parseInt(issue.id))
        this.$delete(this.projectIssueList, findChangeIndex)
        this.updateData()
        // this.showUpdateMessage(data)
      })
      this.socket.on('add_issue', async data => {
        for (const idx in data) {
          if ((this.filterValue.project) && (this.filterValue.project === data[idx].project.id) || !this.filterValue.project) {
            data[idx] = _this.socketDataFormat(data[idx])
            const findChangeIndex = this.projectIssueList.findIndex(issue => parseInt(data[idx].id) === parseInt(issue.id))
            if (findChangeIndex !== -1) {
              this.$set(this.projectIssueList, findChangeIndex, data[idx])
            } else {
              this.$set(this.projectIssueList, this.projectIssueList.length, data[idx])
            }
            this.updateData()
            // this.showUpdateMessage(data[idx])
          }
        }
        this.elementIds = data.map(s => s.id)
      })
      this.socket.on('disconnect', (reason) => {
        if (reason !== 'io client disconnect') {
          this.connectSocket()
        }
      })
      this.socket.on('connect_error', () => {
        console.log('connection error')
      })
    },
    socketDataFormat(data) {
      Object.keys(data).forEach(key => {
        const splitKey = key.split('_id')
        if (splitKey.length > 1) {
          if (this[splitKey[0]]) {
            const findObject = this[splitKey[0]].find(item => item.id === parseInt(data[key]) && item.login !== '-Me-')
            if (findObject) {
              data[splitKey[0]] = findObject
            }
          }
        }
      })
      return data
    },
    showUpdateMessage(data) {
      this.$message({
        message: this.$t('Notify.UpdateKanban', { issueName: data.name }),
        type: 'success'
      })
    },
    async connectSocket() {
      this.setSocketListener()
      await this.socket.connect()
      await this.socket.emit('join', { project_id: this.projectId })
    },
    async onSocketConnect() {
      this.isLoading = true
      // if (this.socket.connected) await this.socket.disconnect()
      await this.connectSocket()
      this.isLoading = false
    },
    reloadPage() {
      window.location.reload()
    }
  }
}
</script>
