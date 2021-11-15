<template>
  <div v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <project-list-selector>
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form v-loading="isLoading">
          <template v-for="dimension in filterOptions">
            <el-form-item v-if="groupBy.dimension !== dimension.value" :key="dimension.id">
              <div slot="label">
                {{ $t('Issue.' + dimension.value) }}
                <el-tag v-if="dimension.value ==='fixed_version'" type="info" class="flex-1">
                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
                </el-tag>
              </div>
              <el-select
                v-model="filterValue[dimension.value]"
                :placeholder="$t(`Issue.Select${dimension.placeholder}`)"
                :disabled="selectedProjectId === -1"
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
                  <component :is="dimension.value" v-if="dimension.tag" :name="$t(`Issue.${item.name}`)" :type="item.name" />
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">
            <el-checkbox v-model="displayClosed" @change="onChangeFilter" />
          </el-form-item>
        </el-form>
        <el-button slot="reference" :loading="isLoading" icon="el-icon-s-operation" type="text"> {{ displayFilterValue }}
          <em class="el-icon-arrow-down el-icon--right" />
        </el-button>
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
        <el-button slot="reference" :loading="isLoading" type="text">
          <i18n path="Issue.GroupBy">
            <strong slot="filter">{{ showSelectedGroupByName }}</strong>
          </i18n>
          ({{ showSelectedGroupByLength }})
          <em class="el-icon-arrow-down el-icon--right" />
        </el-button>
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
      @getRelativeList="getRelativeList"
      @updateIssueList="updateIssueList"
      @loadData="loadData"
      @updateData="updateData"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Fuse from 'fuse.js'
import Boards from '@/views/Project/IssueBoards/components/Boards'
import ProjectListSelector from '@/components/ProjectListSelector'
import {
  getProjectIssueList,
  getProjectIssueListByTree,
  getProjectUserList,
  getProjectVersion,
  getTagsByProject
} from '@/api/projects'
import ElSelectAll from '@/components/ElSelectAll'
import Status from '@/components/Issue/Status'
import Tracker from '@/components/Issue/Tracker'
import Priority from '@/components/Issue/Priority'
import axios from 'axios'

export default {
  name: 'IssueBoards',
  components: {
    Boards,
    ElSelectAll,
    ProjectListSelector,
    Status,
    Tracker,
    Priority
  },
  data() {
    this.filterOptions = [
      {
        id: 1,
        label: this.$t('Issue.FilterDimensions.status'),
        value: 'status',
        placeholder: 'Status',
        tag: true
      },
      {
        id: 2,
        label: this.$t('Issue.FilterDimensions.tags'),
        value: 'tags',
        placeholder: 'Tag'
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
      }
    ]
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
      keyword: null
    }
  },
  computed: {
    ...mapGetters([
      'selectedProjectId',
      'userId',
      'tracker',
      'status',
      'priority',
      'fixedVersionShowClosed'
    ]),
    contextOptions() {
      const result = {}
      const getOptions = ['assigned_to', 'fixed_version', 'tags']
      getOptions.forEach(item => {
        result[item] = this[item]
      })
      return result
    },
    groupByOptions() {
      const statusSort = this.getStatusSort.map((item, idx) => ({
        id: idx,
        label: this.getTranslateHeader(item.name),
        value: item
      }))
      return statusSort
    },
    groupByValueOnBoard() {
      if (this.groupBy.value.length <= 0) {
        return this.getStatusSort.map(item => item)
      }
      return this.groupBy.dimension === 'assigned_to' ? this.filterMe(this.groupBy.value) : this.groupBy.value
    },
    getStatusSort() {
      const dimension = this.groupBy.dimension
      let sort = dimension === 'status' ? this.filterClosedStatus(this[dimension]) : this[dimension]
      sort = dimension === 'assigned_to' ? this.filterMe(sort) : sort
      return sort
    },
    showSelectedGroupByName() {
      return this.filterOptions.find(item => item.value === this.groupBy.dimension).label
    },
    showSelectedGroupByLength() {
      if (this.groupByOptions.length === this.groupBy.value.length || this.groupBy.value.length === 0) {
        return this.$t('general.All')
      }
      return this.groupBy.value.length
    },
    listFilter() {
      const selectedLabels = []
      Object.keys(this.filterValue).forEach(item => {
        if (!this.filterValue[item]) return
        const isArray = Array.isArray(this.filterValue[item]) && this.filterValue[item].length > 0
        isArray ? selectedLabels.push(this.handleArrayLabels(item)) : selectedLabels.push(this.handleLabels(item))
      })
      const colon = selectedLabels.length > 0 ? ': ' : ''
      const factor = selectedLabels.join(', ')
      return `${this.$t('general.Filter')}${colon}${factor}`
    },
    handleArrayLabels() {
      let label = ''
      return function(item) {
        const value = this.getOptionsData(item).filter(search => this.filterValue[item].includes(search.id))
        if (value) {
          const joinedString = value.map(subItem => this.getSelectedLabel(subItem)).join('/')
          label = `#${joinedString}`
        }
        return label
      }
    },
    handleLabels() {
      let label = ''
      return function(item) {
        const value = this.getOptionsData(item).find(search => search.id === this.filterValue[item])
        if (value) label = this.getSelectedLabel(value)
        return label
      }
    },
    isFilterChanged() {
      return this.checkFilterValue('originFilterValue') || this.checkFilterValue('filterValue') || !!this.keyword
    },
    checkFilterValue() {
      return function(key) {
        const comparedKey = this.getComparedKey(key)
        for (const item of Object.keys(this[key])) {
          const checkFilterValue = this[key]
          if (checkFilterValue[item] === '') delete checkFilterValue[item]
          if (this[comparedKey][item] !== checkFilterValue[item]) return true
        }
      }
    },
    getComparedKey() {
      return function(key) {
        let comparedKey = ''
        comparedKey = key === 'filterValue' ? 'originFilterValue' : 'filterValue'
        return comparedKey
      }
    },
    getFilteredVersion() {
      return this.fixed_version.filter(item => {
        const validDate = new Date(`${item.due_date}T23:59:59`) >= new Date()
        const closedStatus = item.status !== 'closed'
        return validDate && closedStatus
      })
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
    this.groupBy = await this.getGroupBy()
    const storedData = await this.fetchStoredData()
    const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
    this.filterValue = storedFilterValue['board'] ? storedFilterValue['board'] : {}
    this.keyword = storedKeyword['board'] ? storedKeyword['board'] : null
    this.displayClosed = storedDisplayClosed['board'] ? storedDisplayClosed['board'] : false
    await this.loadSelectionList()
    await this.loadData()
  },
  methods: {
    ...mapActions('projects', [
      'getProjectUserList',
      'getGroupBy',
      'getIssueFilter',
      'getKeyword',
      'getDisplayClosed',
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
    async fetchStoredData() {
      let storedFilterValue, storedKeyword, storedDisplayClosed
      await Promise.all([this.getIssueFilter(), this.getKeyword(), this.getDisplayClosed()]).then(res => {
        const [filterValue, keyword, displayClosed] = res.map(item => item)
        storedFilterValue = filterValue
        storedKeyword = keyword
        storedDisplayClosed = displayClosed
      })
      return { storedFilterValue, storedKeyword, storedDisplayClosed }
    },
    async getRelativeList() {
      const hasClosed = this.groupByValueOnBoard.filter(item => item.hasOwnProperty('is_closed') && item.is_closed)
      if (hasClosed.length > 0) {
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
      this.checkGroupByValueOnBoard()
      issueList.forEach(issue => {
        if (issue) {
          let dimensionName = issue[this.groupBy.dimension].id
          dimensionName = dimensionName || 'null'
          if (this.checkInFilterValue(dimensionName)) this.classifyIssueList[dimensionName].push(issue)
        }
      })
      this.sortIssue()
    },
    checkGroupByValueOnBoard() {
      this.groupByValueOnBoard.forEach(dimension => {
        if (!this.classifyIssueList.hasOwnProperty(dimension.id)) {
          this.classifyIssueList[dimension.id] = []
        }
      })
    },
    getParams() {
      const result = {}
      if (!this.displayClosed && this.groupBy.dimension !== 'status') result['status_id'] = 'open'
      if (this.keyword) result['search'] = this.keyword
      Object.keys(this.filterValue).forEach(param => {
        if (this.filterValue[param]) {
          const isArray = param === 'tags' && this.filterValue[param].length > 0
          isArray ? result[param] = this.filterValue[param].join(',') : result[`${param}_id`] = this.filterValue[param]
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
      this.projectIssueQueue = {}
      this.isLoading = false
    },
    getIssueList() {
      const issueList = []
      this.groupByValueOnBoard.forEach(item => {
        const { CancelToken, config } = this.getCancelToken()
        this.$set(this.projectIssueQueue, item.id, CancelToken)
        const dimension = this.groupBy.dimension === 'tags' ? this.groupBy.dimension : `${this.groupBy.dimension}_id`
        const params = { ...this.getParams(), [dimension]: item.id }
        const getIssueList = getProjectIssueList(this.selectedProjectId, params, config)
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
        .then(res => {
          const issueList = res.map(item => item.data)
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
      Object.values(this.projectIssueQueue).forEach(item => { item.cancel() })
    },
    async loadVersionList(status) {
      const params = status ? { status: 'open,locked,closed' } : { status: 'open,locked' }
      const versionList = await this.fetchVersionList(params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList]
      const version = this.getFilteredVersion
      version.length > 0 ? this.setFilterValue(version) : this.$delete(this.originFilterValue, 'fixed_version')
    },
    setFilterValue(version) {
      const sessionValue = sessionStorage.getItem('issueFilter')
      if (!sessionValue || !JSON.parse(sessionValue)['board']) {
        this.$set(this.filterValue, 'fixed_version', version[0].id)
      }
      this.$set(this.originFilterValue, 'fixed_version', version[0].id)
    },
    async fetchVersionList(params) {
      const res = await getProjectVersion(this.selectedProjectId, params)
      return res.data.versions
    },
    async loadSelectionList() {
      if (this.selectedProjectId === -1) return
      await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getTagsByProject(this.selectedProjectId)
      ]).then(res => {
        const [assigneeList, tagsList] = res.map(item => item.data)
        this.setAssignedToData(assigneeList)
        this.tags = tagsList.tags
        // if (this.userRole === 'Engineer') {
        //   this.$set(this.filterValue, 'assigned_to', this.userId)
        //   this.$set(this.originFilterValue, 'assigned_to', this.userId)
        // }
      })
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
    setGroupByUnclosedStatus(check) {
      const isClosed = this.status.filter(item => item.is_closed === false)
      check ? this.$set(this.groupBy, 'value', this.status) : this.$set(this.groupBy, 'value', isClosed)
    },
    resetClassifyIssue() {
      this.classifyIssueList = {}
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    searchKanbanCard(value, opt) {
      if (!value || value === '') {
        return true
      }
      Object.keys(this.classifyIssueList).forEach(item => {
        if (value === 'null') {
          this.classifyIssueList[item] = this.classifyIssueList[item].filter(subItem => {
            const findKey = opt['keys'][0].split('.')
            const findName = findKey.reduce((total, current) => total[current], subItem)
            return findName === undefined && findKey[0] !== ''
          })
        } else {
          const fuse = new Fuse(this.classifyIssueList[item], opt)
          let pattern = `="${value}"`
          if (Array.isArray(value) && value.length > 0) {
            pattern = { $or: value.map(item => ({ $path: [opt['keys']], $val: `="${item}"` })) }
          }
          const res = fuse.search(pattern)
          this.classifyIssueList[item] = res.map(items => items.item)
        }
      })
    },
    updateData() {
      this.resetClassifyIssue()
      this.classifyIssue()
      Object.keys(this.filterValue).forEach(item => {
        const searchOpt = {
          keys: [`${item}.id`],
          useExtendedSearch: true
        }
        this.searchKanbanCard(this.filterValue[item], searchOpt)
      })
    },
    sortIssue() {
      // const sortPriority = (a, b) => (a.priority.id - b.priority.id)
      const sortUpdateOn = (a, b) => new Date(b.updated_on) - new Date(a.updated_on)
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
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter(item => item.is_closed === false)
    },
    filterMe(userList) {
      return userList.filter(item => item.login !== '-Me-')
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = ''
      this.displayClosed = false
      this.onChangeGroupByDimension('status')
      this.onChangeFilter()
    },
    async onChangeFilter() {
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
      if (this.filterValue['tags'] && this.filterValue['tags'].length <= 0) {
        this.$delete(this.filterValue, 'tags')
      }
      storedFilterValue['board'] = this.filterValue
      storedKeyword['board'] = this.keyword
      storedDisplayClosed['board'] = this.displayClosed
      await this.setIssueFilter(storedFilterValue)
      await this.setKeyword(storedKeyword)
      await this.setDisplayClosed(storedDisplayClosed)
      await this.loadData()
    },
    onChangeGroupByDimension(value, loadData) {
      this.$set(this.groupBy, 'dimension', value)
      this.$set(this.groupBy, 'value', [])
      this.$refs['groupByValue'].selected = []
      this.updatedByGroupBy(loadData)
    },
    onChangeGroupByValue(value, loadData) {
      this.$set(this.groupBy, 'value', value)
      this.updatedByGroupBy(loadData)
    },
    updatedByGroupBy(loadData) {
      this.setGroupBy(this.groupBy)
      if (loadData) this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  overflow: hidden;
}
</style>
