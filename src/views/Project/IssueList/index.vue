<template>
  <div class="app-container">
    <project-list-selector>
      <el-button id="btn-add-issue"
                 slot="button"
                 type="success"
                 icon="el-icon-plus"
                 :disabled="selectedProjectId === -1"
                 @click="handleQuickAddClose"
      >
        {{ $t('Issue.AddIssue') }}
      </el-button>
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form v-loading="listLoading">
          <template v-for="dimension in filterOptions">
            <el-form-item :key="dimension.id">
              <div slot="label">
                {{ $t('Issue.' + dimension.value) }}
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
        <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}
          <i class="el-icon-arrow-down el-icon--right" /></el-button>
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
        @blur="searchVisible=!searchVisible"
        @change="onChangeFilter"
      />
      <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">
        {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
      </el-button>
      <template v-if="isFilterChanged">
        <el-divider direction="vertical" />
        <el-button size="small" icon="el-icon-close" @click="cleanFilter">
          {{ $t('Issue.CleanFilter') }}
        </el-button>
      </template>
    </project-list-selector>
    <el-divider />
    <quick-add-issue ref="quickAddIssue"
                     :save-data="saveIssue"
                     :project-id="selectedProjectId"
                     :visible.sync="quickAddTopicDialogVisible"
                     :tracker="tracker"
                     @add-issue="advancedAddIssue"
    />
    <el-row v-loading="listLoading"
            :element-loading-text="$t('Loading')"
    >
      <el-table
        ref="issueList"
        :data="listData"
        border
        fit
        highlight-current-row
        row-key="id"
        height="60vh"
        :tree-props="{ children: 'child' }"
        :row-class-name="getRowClass"
        @row-contextmenu="handleContextMenu"
        @cell-click="handleClick"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
      >
        <el-table-column type="expand" class-name="informationExpand">
          <template slot-scope="scope">
            <el-col v-loading="scope.row.loadingRelation">
              <ul>
                <li v-if="scope.row.hasOwnProperty('parent')&&Object.keys(scope.row.parent).length>0">
                  <b>{{ $t('Issue.ParentIssue') }}:</b>
                  <el-link
                    :style="{ 'font-size': '14px', cursor: 'pointer' }"
                    :underline="false"
                    @click="handleEdit(scope.row.parent.id)"
                    @contextmenu.native="handleContextMenu(scope.row.parent,'',$event)"
                  >
                    <status :name="scope.row.parent.status.name" size="mini" />
                    <tracker :name="scope.row.parent.tracker.name" />
                    #{{ scope.row.parent.id }} - {{ scope.row.parent.name }}
                    <span
                      v-if="scope.row.parent.hasOwnProperty('assigned_to')&&Object.keys(scope.row.parent.assigned_to).length>1"
                    >
                      ({{ $t('Issue.Assignee') }}: {{ scope.row.parent.assigned_to.name }}
                      - {{ scope.row.parent.assigned_to.login }})
                    </span>
                  </el-link>
                  <el-popconfirm
                    :confirm-button-text="$t('general.Remove')"
                    :cancel-button-text="$t('general.Cancel')"
                    icon="el-icon-info"
                    icon-color="red"
                    :title="$t('Issue.RemoveIssueRelation')"
                    @onConfirm="removeIssueRelation(scope.row.id)"
                  >
                    <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">{{
                      $t('Issue.Unlink')
                    }}
                    </el-button>
                  </el-popconfirm>
                </li>
                <li v-if="scope.row.hasOwnProperty('children')">
                  <b>{{ $t('Issue.ChildrenIssue') }}:</b>
                  <ol>
                    <template v-for="child in scope.row.children">
                      <li v-if="Object.keys(child).length>0" :key="child.id">
                        <el-link
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                          @contextmenu.native="handleContextMenu(child, '', $event)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to')&&Object.keys(child.assigned_to).length>1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})</span>
                        </el-link>
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @onConfirm="removeIssueRelation(child.id)"
                        >
                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">{{ $t('Issue.Unlink') }}</el-button>
                        </el-popconfirm>
                      </li>
                    </template>
                  </ol>
                </li>
                <li v-if="scope.row.hasOwnProperty('relations')&&scope.row.relations.length>0">
                  <b>{{ $t('Issue.RelatedIssue') }}:</b>
                  <ol>
                    <template v-for="child in scope.row.relations">
                      <li v-if="Object.keys(child).length>0" :key="child.id">
                        <el-link
                          class="font-weight-regular my-1"
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to')&&Object.keys(child.assigned_to).length>1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{
                              child.assigned_to.login
                            }})</span>
                        </el-link>
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @onConfirm="removeRelationIssue(child.relation_id)"
                        >
                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                            {{ $t('Issue.Unlink') }}
                          </el-button>
                        </el-popconfirm>
                      </li>
                    </template>
                  </ol>
                </li>
              </ul>
            </el-col>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Type')" width="130" prop="tracker" sortable="custom">
          <template slot-scope="scope">
            <tracker v-if="scope.row.tracker.name" :name="scope.row.tracker.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('Issue.Id')" min-width="280" show-overflow-tooltip prop="id" sortable="custom">
          <template slot-scope="scope">
            <span class="text-success mr-2">#{{ scope.row.id }}</span>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Priority')" width="150" prop="priority" sortable="custom">
          <template slot-scope="scope">
            <priority v-if="scope.row.priority.name" :name="scope.row.priority.name" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Status')" width="150" prop="status" sortable="custom">
          <template slot-scope="scope">
            <status
              v-if="scope.row.status.name"
              :name="scope.row.status.name"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180" prop="assigned_to" sortable="custom" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.assigned_to.name }}</span>
            <span v-if="scope.row.assigned_to.login">({{ scope.row.assigned_to.login }})</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="pageInfo.total"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="handleCurrentChange"
      />
    </el-row>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update="loadData"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  addIssue, deleteIssueRelation,
  getIssueFamily,
  getIssuePriority,
  getIssueStatus,
  getIssueTracker,
  updateIssue
} from '@/api/issue'
import { getProjectIssueList, getProjectUserList, getProjectVersion } from '@/api/projects'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import QuickAddIssue from './components/QuickAddIssue'
import ProjectListSelector from '@/components/ProjectListSelector'
import axios from 'axios'
import { BasicData, Table, Pagination } from '@/newMixins'
import ContextMenu from './components/ContextMenu'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ProjectIssues',
  components: {
    ContextMenu,
    QuickAddIssue,
    Priority,
    Status,
    Tracker,
    ProjectListSelector
  },
  mixins: [BasicData, Table, Pagination],
  data() {
    return {
      remote: true,
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,
      fixed_version_closed: false,
      displayClosed: false,
      contextMenu: {
        row: { fixed_version: { id: 'null' }, assigned_to: { id: 'null' }},
        visible: false,
        left: 0,
        top: 0
      },
      search: '',
      sort: '',
      parentId: 0,
      parentName: '',
      fixed_version: [],
      tracker: [],
      assigned_to: [],
      status: [],
      priority: [],
      filterValue: {},
      originFilterValue: {},
      quickChangeDialogVisible: false,
      quickChangeForm: {},
      form: {},

      keyword: null,
      listQuery: {
        offset: 0,
        page: 1,
        limit: 10
      },
      pageInfo: {
        offset: 0,
        total: 0
      },
      lastIssueListCancelToken: null,
      expandedRow: []
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'issueListFilter', 'issueListKeyword', 'issueListDisplayClosed',
      'issueListListQuery', 'issueListPageInfo', 'initIssueList', 'fixedVersionShowClosed']),
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
    contextOptions() {
      const result = {}
      this.filterOptions.forEach((item) => {
        result[item.value] = this[item.value]
      })
      return result
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
    selectedProjectId() {
      this.loadSelectionList()
      this.initTableData()
    },
    filterValue: {
      deep: true,
      handler() {
        // TODO: RememberPageProblem
        this.backToFirstPage()
        this.onChangeFilter()
      }
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    }
  },
  async created() {
    // TODO: RememberPageProblem
    // if (Object.keys(this.issueListListQuery).length > 0) {
    //   this.listQuery = this.issueListListQuery
    // }
    // if (Object.keys(this.issueListPageInfo).length > 0) {
    //   this.pageInfo = this.issueListPageInfo
    // }
    this.filterValue = this.issueListFilter
    this.keyword = this.issueListKeyword
    this.fixed_version_closed = this.fixedVersionShowClosed
    this.displayClosed = this.issueListDisplayClosed
    await this.loadSelectionList()
  },
  methods: {
    ...mapActions('projects', ['setIssueListKeyword', 'setIssueListFilter', 'setFixedVersionShowClosed',
      'setIssueListDisplayClosed', 'setIssueListListQuery', 'setIssueListPageInfo', 'setInitIssueList']),
    showNoProjectWarning() {
      // noinspection JSCheckFunctionSignatures
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
      this.listLoading = false
    },
    getParams() {
      const result = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit
      }
      if (this.sort) {
        result['sort'] = this.sort
      }
      if (!this.displayClosed) {
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
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      let data
      try {
        // const params = await
        if (this.lastIssueListCancelToken && this.listLoading) {
          this.lastIssueListCancelToken.cancel()
        }
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        const listData = await getProjectIssueList(this.selectedProjectId, this.getParams(), { cancelToken: cancelTokenSource.token })
        data = listData.data.issue_list
        if (listData.data.hasOwnProperty('page')) {
          this.pageInfo = listData.data.page
        } else {
          this.pageInfo = {
            total: 0
          }
        }
        if (this.expandedRow.length > 0) {
          for (const row of this.expandedRow) {
            const getIssue = data.find((item) => (item.id === row.id))
            await this.getIssueFamilyData(getIssue, this.expandedRow)
          }
        }
        // TODO: RememberPageProblem
        // await this.setIssueListListQuery(this.listQuery)
        // await this.setIssueListPageInfo(this.pageInfo)
      } catch (e) {
        // null
      }
      return data
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
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
        if (this.userRole === 'Engineer') {
          this.$set(this.filterValue, 'assigned_to', this.userId)
          this.$set(this.originFilterValue, 'assigned_to', this.userId)
        }
      })
      await this.loadVersionList(this.fixed_version_closed)
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      if (item.hasOwnProperty('login')) {
        result += ' (' + (item.login) + ')'
      }
      return result
    },
    async getIssueFamilyData(row, expandedRows) {
      this.expandedRow = expandedRows
      if (expandedRows.find((item) => (item.id === row.id))) {
        try {
          await this.$set(row, 'loadingRelation', true)
          const family = await getIssueFamily(row.id)
          const data = family.data
          if (data.hasOwnProperty('parent')) { await this.$set(row, 'parent', data.parent) }
          if (data.hasOwnProperty('children')) { await this.$set(row, 'children', data.children) }
          if (data.hasOwnProperty('relations')) { await this.$set(row, 'relations', data.relations) }
          await this.$set(row, 'loadingRelation', false)
        } catch (e) {
          //   null
          return Promise.resolve()
        }
      }
      return Promise.resolve()
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    onChangeFilter() {
      this.setIssueListFilter(this.filterValue)
      this.setIssueListKeyword(this.keyword)
      this.setIssueListDisplayClosed(this.displayClosed)
      this.initTableData()
    },
    handleClick(row, column) {
      if (column.type === 'expand' && this.isRelationIssueLoading(row)) {
        this.$refs['issueList'].toggleRowExpansion(row)
      } else if (column.type === 'expand' && this.hasRelationIssue(row)) {
        this.$refs['issueList'].toggleRowExpansion(row)
      } else {
        this.$router.push({ name: 'issue-detail', params: { issueId: row.id }})
      }
    },
    handleEdit(id) {
      this.$router.push({ name: 'issue-detail', params: { issueId: id }})
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
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
          this.backToFirstPage()
          this.loadData()
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.subject = ''
          return res
        })
        .catch(error => {
          return error
        })
    },
    handleAddNewIssue() {
      this.addTopicDialogVisible = true
      this.parentId = 0
    },
    isRelationIssueLoading(row) {
      if (row.family && !row.hasOwnProperty('loadingRelation')) {
        this.$set(row, 'loadingRelation', false)
      }
      return row.loadingRelation
    },
    hasRelationIssue(row) {
      return row.family
    },
    handleQuickAddClose() {
      this.quickAddTopicDialogVisible = !this.quickAddTopicDialogVisible
    },
    handleSortChange({ prop, order }) {
      const orderBy = this.checkOrder(order)
      if (orderBy) {
        this.sort = prop + ':' + orderBy
      } else {
        this.sort = orderBy
      }
      this.loadData()
    },
    checkOrder(order) {
      switch (order) {
        case 'descending':
          return 'desc'
        case 'ascending':
          return 'asc'
        case null:
          return false
      }
    },
    getRowClass({ row }) {
      const result = []
      if (this.isRelationIssueLoading(row)) {
        result.push('row-expend-loading')
      } else if (!this.hasRelationIssue(row)) {
        result.push('row-expand-cover')
        const getTableRef = this.$refs['issueList']
        if (getTableRef) {
          const getExpanded = this.expandedRow
          if (Array.isArray(getExpanded) && getExpanded.length > 0) {
            const getRow = getExpanded.find((item) => item.id === row.id)
            if (getRow) {
              this.toggleExpandedRows(getRow, getExpanded)
              getTableRef.toggleRowExpansion(getRow, getExpanded)
            }
          }
        }
      }
      result.push('context-menu')
      return result.join(' ')
    },
    toggleExpandedRows(row, expandedRows) {
      this.expandedRow = expandedRows
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    async handleCurrentChange(val) {
      this.listLoading = true
      const offset = this.pageInfo.offset + ((val.page - this.listQuery.page) * val.limit)
      if (offset <= 0 || val.page === 1) {
        this.listQuery.offset = 0
      } else if (offset >= this.pageInfo.total || val.page >= val.totalPage) {
        this.listQuery.offset = this.pageInfo.total - val.limit
      } else {
        this.listQuery.offset = offset
      }
      this.listQuery.page = val.page
      await this.loadData()
      this.listLoading = false
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = null
      this.displayClosed = false
      this.onChangeFilter()
    },
    backToFirstPage() {
      this.listQuery.page = 1
      this.listQuery.offset = 0
    },
    async removeIssueRelation(child_issue_id) {
      this.listLoading = true
      try {
        await updateIssue(child_issue_id, { parent_id: '' })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.initTableData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    async removeRelationIssue(relation_id) {
      this.listLoading = true
      try {
        await deleteIssueRelation(relation_id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.initTableData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    handleContextMenu(row, column, event) {
      event.preventDefault()
      const eventX = event.pageX
      const eventY = event.pageY
      this.$refs.contextmenu.$refs.contextmenu.show()
      this.$nextTick(() => {
        const contextmenuPosition = {
          top: eventY,
          left: eventX
        }
        const contextmenuWidth = this.$refs.contextmenu.$refs.contextmenu.$el.clientWidth
        const contextmenuHeight = this.$refs.contextmenu.$refs.contextmenu.$el.clientHeight
        if (contextmenuWidth <= 50 && contextmenuWidth <= 50) {
          this.handleContextMenu(row, column, event)
        }
        if (contextmenuHeight + eventY >= window.innerHeight) {
          contextmenuPosition.top -= contextmenuHeight
        }
        if (contextmenuWidth + eventX >= window.innerWidth) {
          contextmenuPosition.left -= contextmenuWidth
        }
        this.contextMenu.top = contextmenuPosition.top
        this.contextMenu.left = contextmenuPosition.left
        this.contextMenu.row = row
        this.contextMenu.visible = true
        this.$refs.contextmenu.$refs.contextmenu.style = { top: this.contextMenu.top + 'px', left: this.contextMenu.left + 'px' }
        document.addEventListener('click', this.hideContextMenu)
      })
    },
    hideContextMenu() {
      this.contextMenu.visible = false
      document.removeEventListener('click', this.hideContextMenu)
    }
  }
}
</script>

<style lang="scss" scoped>
> > > .row-expand-cover .el-table__expand-column .cell {
  display: none;
}

> > > .el-table__expanded-cell {
  font-size: 0.875em;
  padding-top: 10px;
  padding-bottom: 10px;
}

> > > .row-expend-loading .el-table__expand-column .cell {
  padding: 0;

  .el-table__expand-icon {
    .el-icon-arrow-right {
      animation: rotating 2s linear infinite;
    }

    .el-icon-arrow-right:before {
      content: "\e6cf";
      font-size: 1.25em;
    }
  }

}

> > > .context-menu {
  cursor: context-menu;
}
</style>
