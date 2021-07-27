<template>
  <div class="app-container">
    <project-list-selector>
      <el-button
        id="btn-add-issue"
        slot="button"
        type="success"
        icon="el-icon-plus"
        :disabled="selectedProjectId === -1"
        class="text-left"
        @click="handleQuickAddClose"
      >
        {{ $t('Issue.AddIssue') }}
      </el-button>
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form>
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
                  v-for="item in $data[dimension.value]"
                  :key="item.id"
                  :label="getSelectionLabel(item)"
                  :value="item.id"
                >
                  <component :is="dimension.value" v-if="dimension.tag" :name="item.name" />
                </el-option>
              </el-select>
            </el-form-item>
          </template>
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
      <el-divider direction="vertical" />
      <span v-show="hasSelectedTestPlan">
        <el-divider direction="vertical" />
        <el-button type="text" icon="el-icon-download" @click="downloadCsv(selectedTestPlan)">{{
          $t('Dashboard.ADMIN.ProjectList.csv_download')
        }}</el-button>
      </span>
    </project-list-selector>
    <el-divider />
    <quick-add-issue ref="quickAddIssue"
                     :save-data="saveIssue"
                     :project-id="selectedProjectId"
                     :visible.sync="quickAddTopicDialogVisible"
                     :tracker="tracker"
                     @add-issue="advancedAddIssue"
    />
    <el-table
      ref="issueList"
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      row-key="id"
      height="60vh"
      :tree-props="{ children: 'child' }"
      :row-class-name="getRowClass"
      @cell-click="handleClick"
      @expand-change="getIssueFamilyData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column type="expand" class-name="informationExpand">
        <template slot-scope="scope">
          <el-col v-loading="scope.row.loadingRelation">
            <ul>
              <li v-if="scope.row.hasOwnProperty('parent')&&Object.keys(scope.row.parent).length>0">
                <b>{{ $t('Issue.ParentIssue') }}:</b>
                <el-link
                  class="font-weight-regular"
                  :style="{ 'font-size': '14px', cursor: 'pointer' }"
                  :underline="false"
                  @click="handleEdit(scope.row.parent.id)"
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
                        @onConfirm="removeIssueRelation(child.id)"
                      >
                        <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                          {{ $t('Issue.Unlink') }}
                        </el-button>
                      </el-popconfirm>
                    </li>
                  </template>
                </ol>
              </li>
              <li v-if="scope.row.hasOwnProperty('relations')">
                <b>{{ $t('Issue.RelatedIssue') }}:</b>
                <ol>
                  <template v-for="relation in scope.row.relations">
                    <li v-if="Object.keys(relation).length>0" :key="relation.id">
                      <el-link
                        class="font-weight-regular my-1"
                        :style="{ 'font-size': '14px', cursor: 'pointer' }"
                        :underline="false"
                        @click="handleEdit(relation.id)"
                      >
                        <status :name="relation.status.name" size="mini" />
                        <tracker :name="relation.tracker.name" />
                        #{{ relation.id }} - {{ relation.name }}
                        <span
                          v-if="relation.hasOwnProperty('assigned_to')&&Object.keys(relation.assigned_to).length>1"
                        >
                          ({{ $t('Issue.Assignee') }}: {{ relation.assigned_to.name }} - {{
                            relation.assigned_to.login
                          }})</span>
                      </el-link>
                    </li>
                  </template>
                </ol>
              </li>
            </ul>
          </el-col>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Type')" width="130">
        <template slot-scope="scope">
          <tracker v-if="scope.row.tracker.name" :name="scope.row.tracker.name" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('Issue.Id')" min-width="280" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="text-success mr-2">#{{ scope.row.id }}</span>
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Issue.Priority')" width="150">
        <template slot-scope="scope">
          <priority v-if="scope.row.priority.name" :name="scope.row.priority.name" />
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Status')" width="150">
        <template slot-scope="scope">
          <status
            v-if="scope.row.status.name"
            :name="scope.row.status.name"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180">
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
  </div>
</template>

<script>
import AddIssue from './components/AddIssue'
import { mapActions, mapGetters } from 'vuex'
import {
  addIssue,
  getIssue,
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
import { Parser } from 'json2csv'
import { getTestPlanDetail } from '@/views/Plugin/QA/api/qa'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'TestPlan',
  components: {
    AddIssue,
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
      search: '',
      parentId: 0,
      parentName: '',
      fixed_version: [],
      tracker: [],
      tracker_id: null,
      assigned_to: [],
      status: [],
      priority: [],
      filterValue: {},
      originFilterValue: {},
      quickChangeDialogVisible: false,
      quickChangeForm: {},
      assigneeList: [],
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
      selectedTestPlan: []
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'issueListFilter', 'issueListKeyword', 'fixedVersionShowClosed']),
    filterOptions() {
      return [
        { id: 1, label: this.$t('Issue.FilterDimensions.status'), value: 'status', placeholder: 'Status', tag: true },
        // { id: 2, label: this.$t('Issue.FilterDimensions.tracker'), value: 'tracker', placeholder: 'Type', tag: true },
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
    },
    hasSelectedTestPlan() {
      return this.selectedTestPlan.length > 0
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
        this.backToFirstPage()
        this.onChangeFilter()
      }
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    },
    tracker_id() {
      this.initTableData()
    }
  },
  async created() {
    this.filterValue = this.issueListFilter
    this.keyword = this.issueListKeyword
    this.fixed_version_closed = this.fixedVersionShowClosed
    await this.loadSelectionList()
  },
  methods: {
    ...mapActions('projects', ['setIssueListKeyword', 'setIssueListFilter', 'setFixedVersionShowClosed']),
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
        limit: this.listQuery.limit,
        tracker_id: this.tracker_id
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
        if (!this.tracker_id) {
          return []
        }
        const listData = await getProjectIssueList(this.selectedProjectId, this.getParams(), { cancelToken: cancelTokenSource.token })
        this.lastIssueListCancelToken = cancelTokenSource
        data = listData.data.issue_list
        if (listData.data.hasOwnProperty('page')) {
          this.pageInfo = listData.data.page
        } else {
          this.pageInfo = {
            total: 0
          }
        }
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
        // this.tracker = [{
        //   id: 8,
        //   name: 'Test Plan'
        // }]
        this.tracker_id = typeList.find((item) => (item.name === 'Test Plan')).id
        this.assigned_to = [
          { name: this.$t('Issue.Unassigned'), id: 'null' },
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
      return result
    },
    async getIssueFamilyData(row, expandedRows) {
      if (expandedRows.find((item) => (item.id === row.id))) {
        try {
          await this.$set(row, 'loadingRelation', true)
          const family = await getIssueFamily(row.id)
          const data = family.data
          if (data.hasOwnProperty('parent')) {
            await this.$set(row, 'parent', data.parent)
          }
          if (data.hasOwnProperty('children')) {
            await this.$set(row, 'children', data.children)
          }
          if (data.hasOwnProperty('relations')) {
            await this.$set(row, 'relations', data.relations)
          }
          await this.$set(row, 'loadingRelation', false)
        } catch (e) {
          //   null
        }
      }
    },
    onChangeFilter() {
      this.setIssueListFilter(this.filterValue)
      this.setIssueListKeyword(this.keyword)
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
    getRowClass({ row }) {
      const result = []
      if (this.isRelationIssueLoading(row)) {
        result.push('row-expend-loading')
      } else if (this.hasRelationIssue(row) === false) {
        result.push('row-expand-cover')
      }
      result.push('cursor-pointer')
      return result.join(' ')
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    handleCurrentChange(val) {
      const offset = this.pageInfo.offset + ((val.page - this.listQuery.page) * val.limit)
      if (offset <= 0 || val.page === 1) {
        this.listQuery.offset = 0
      } else if (offset >= this.pageInfo.total || val.page >= val.totalPage) {
        this.listQuery.offset = this.pageInfo.total - val.limit
      } else {
        this.listQuery.offset = offset
      }
      this.listQuery.page = val.page
      this.loadData()
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = null
      this.onChangeFilter()
    },
    backToFirstPage() {
      this.listQuery.page = 1
      this.listQuery.offset = 0
    },
    removeIssueRelation(child_issue_id) {
      this.isLoading = true
      updateIssue(child_issue_id, { parent_id: '' })
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.handleUpdated()
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
        })
    },
    handleSelectionChange(list) {
      this.selectedTestPlan = list
    },
    async fetchDataCSV(selectedTestPlan) {
      const apiRequest = []
      selectedTestPlan.forEach((item) => {
        apiRequest.push(getTestPlanDetail(this.selectedProjectId, item.id))
      })
      const apiResult = await Promise.all(apiRequest)
      const result = []
      for (const item of apiResult) {
        const data = item.data
        const relationApiRequest = []
        if (data.hasOwnProperty('relations')) {
          data['relation_details'] = []
          for (const [idx, issue] of data.relations.entries()) {
            let getIssueId
            if (data.id === issue.issue_id) {
              getIssueId = issue.issue_to_id
            } else {
              getIssueId = issue.issue_id
            }
            data.relations[idx] = getIssueId
            relationApiRequest.push(getIssue(getIssueId))
          }
          const relationResult = await Promise.all(relationApiRequest)
          data.relation_details = relationResult.map((subItem) => (subItem.data))
        }
        result.push(data)
      }
      return result
    },
    dataCleanCSV(fetchData) {
      const exportColumn = {
        name: { column: ['id', 'subject'], root: true },
        relations: { column: ['id', 'subject'], children: 'relation_details' },
        software_name: { column: ['software_name'], children: 'test_files' },
        file_name: { column: ['file_name'], children: 'test_files' },
        test_result: { column: ['the_last_test_result'], children: 'test_files' },
        branch: { column: ['branch', 'commit_id'], children: 'test_files' }
      }
      const result = []
      fetchData.forEach((item, idx) => {
        const itemResult = { [this.$t('Test.TestPlan.no')]: idx + 1 }
        Object.keys(exportColumn).forEach((column) => {
          let resultArray
          if (exportColumn[column]['root']) {
            resultArray = exportColumn[column].column.map((subColumn) => this.confirmExist(item, subColumn))
            resultArray = resultArray.join(' - ')
            console.log(resultArray)
          }
          if (exportColumn[column]['children']) {
            const childrenSplit = exportColumn[column]['children'].split('.')
            const getChildrenData = childrenSplit.reduce((total, current) => (total[current]), item)
            if (column === 'test_result') {
              resultArray = this.getTestResult(getChildrenData)
            } else if (column === 'branch') {
              resultArray = this.getBranch(getChildrenData)
            } else if (Array.isArray(getChildrenData)) {
              resultArray = getChildrenData.map((item) => exportColumn[column].column.map((subColumn) => this.confirmExist(item, subColumn))).map((check) => this.joinResult(check, ' - '))
            } else {
              resultArray = exportColumn[column].column.map((subColumn) => this.confirmExist(getChildrenData, subColumn))
            }
          }
          if (Array.isArray(resultArray)) {
            resultArray = this.joinResult(resultArray, ',')
          }
          itemResult[this.$t('Test.TestPlan.' + column)] = resultArray
        })
        result.push(itemResult)
      })
      return result
    },
    confirmExist(data, column) {
      if (!data) {
        return null
      }
      return data[column]
    },
    joinResult(columnResult, joinStr) {
      const checkNull = columnResult.reduce((total, current) => (!!total && !!current), true)
      if (!checkNull) return null
      return columnResult.join(joinStr)
    },
    getBranch(data) {
      const result = []
      data.forEach((item) => {
        const last_result = item.the_last_test_result
        if (last_result.hasOwnProperty('branch') && last_result.hasOwnProperty('commit_id')) {
          result.push(last_result.branch + ' - ' + last_result.commit_id)
        } else {
          result.push(null)
        }
      })
      return result
    },
    getTestResult(data) {
      const result = []
      data.forEach((item) => {
        const last_result = item.the_last_test_result
        if (item.software_name === 'Postman') {
          console.log(item.software_name, last_result.success, last_result.failure)
          if (last_result.hasOwnProperty('success') && last_result.hasOwnProperty('failure')) {
            result.push(last_result.success + '/' + (last_result.success + last_result.failure))
          } else {
            result.push(null)
          }
        } else if (item.software_name === 'SideeX') {
          if (last_result.result && last_result.result.casesPassed && last_result.result.casesTotal) {
            result.push(last_result.result.casesPassed + '/' + last_result.result.casesTotal)
          } else {
            result.push(null)
          }
        }
      })
      return result
    },
    prepareCSV(result) {
      const jsonToCSVParser = new Parser()
      const attr = 'data:text/csv;charset=utf-8,'
      const csvContent = `${attr} ${jsonToCSVParser.parse(result)}`
      const encodeUri = encodeURI(csvContent)
      const a = document.createElement('a')
      const url = encodeUri
      const filename = 'testplan.csv'
      a.href = url
      a.download = filename
      a.click()
    },
    async downloadCsv(selectedTestPlan) {
      let result = await this.fetchDataCSV(selectedTestPlan)
      result = await this.dataCleanCSV(result)
      console.log('fetch', result)
      await this.prepareCSV(result)
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
