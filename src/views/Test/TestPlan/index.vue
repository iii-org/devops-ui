<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        id="btn-add-issue"
        slot="button"
        v-permission="['Administrator','Project Manager', 'Engineer']"
        class="buttonSecondary"
        icon="el-icon-plus"
        :disabled="selectedProjectId === -1 || disableAddIssue"
        @click="handleQuickAddClose"
      >
        {{ $t('Issue.AddIssue') }}
      </el-button>
      <SearchFilter
        :filter-options="filterOptions"
        :list-loading="listLoading"
        :selection-options="contextOptions"
        :prefill="{ filterValue: filterValue, keyword: keyword, displayClosed: displayClosed }"
        @change-filter="onChangeFilterForm"
        @change-fixed-version="onChangeFixedVersionStatus"
      >
        <span slot="download">
          <el-divider direction="vertical" />
          <el-popover
            placement="bottom"
            trigger="click"
          >
            <el-menu class="download">
              <el-menu-item
                :disabled="selectedProjectId === -1 || allDataLoading"
                @click="downloadExcel(allDownloadData)"
              >
                <em class="el-icon-download" />{{ $t('Dashboard.ADMIN.ProjectList.all_download') }}
              </el-menu-item>
              <el-menu-item
                v-show="hasSelectedTestPlan"
                :disabled="selectedProjectId === -1"
                @click="downloadExcel(selectedTestPlan)"
              >
                <em class="el-icon-download" />{{ $t('Dashboard.ADMIN.ProjectList.excel_download') }}
              </el-menu-item>
            </el-menu>
            <el-button slot="reference" class="buttonPrimaryReverse" icon="el-icon-download">{{ $t('File.Download') }}</el-button>
          </el-popover>
        </span>
      </SearchFilter>
    </ProjectListSelector>
    <el-divider />
    <QuickAddIssue
      v-if="selectedProjectId > 0 && !disableAddIssue"
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      tracker-name="Test Plan"
      @add-issue="advancedAddIssue"
    />
    <div ref="wrapper" class="wrapper" :class="{'show-quick':quickAddTopicDialogVisible}">
      <el-row v-loading="listLoading"
              :element-loading-text="$t('Loading')"
      >
        <!-- tree-props 取消第二個子議題箭頭-->
        <el-table
          ref="issueList"
          :data="listData"
          fit
          highlight-current-row
          row-key="id"
          :tree-props="{ children: 'child' }"
          :row-class-name="getRowClass"
          @row-contextmenu="handleContextMenu"
          @cell-click="handleClick"
          @expand-change="getIssueFamilyData"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" reserve-selection width="55" />
          <el-table-column type="expand" class-name="informationExpand">
            <template slot-scope="{row}">
              <ExpandSection
                :issue="row"
                @on-context-menu="onContextMenu"
                @update-list="loadData"
                @collapse-expend-row="collapseExpendRow"
              />
              <ul class="family">
                <li v-if="row.hasOwnProperty('test_files') && row.test_files.length>0">
                  <span class="title">{{ $t('Issue.TestFile') }}:</span>
                  <ol class="issue-list">
                    <template v-for="child in row.test_files">
                      <li v-if="Object.keys(child).length > 0" :key="child.id" class="issue-item">
                        {{ child.software_name }} - {{ child.file_name }}
                        <template v-if="child.the_last_test_result">
                          ({{ child.the_last_test_result.branch }} -
                          <el-link
                            class="linktextColor"
                            target="_blank"
                            style="font-size: 16px"
                            :href="child.the_last_test_result.commit_url"
                          >
                            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
                            {{ child.the_last_test_result.commit_id }}
                          </el-link>
                          -
                          <Result :test-file="child" />
                          )
                        </template>
                      </li>
                    </template>
                  </ol>
                </li>
              </ul>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('general.Type')"
            width="130"
            prop="tracker"
            sortable="custom"
          >
            <template slot-scope="{row}">
              <Tracker v-if="row.tracker.name" :name="$t(`Issue.${row.tracker.name}`)" :type="row.tracker.name" />
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('Issue.Id')"
            min-width="280"
            show-overflow-tooltip
            prop="id"
            sortable="custom"
          >
            <template slot-scope="scope">
              <span class="text-success mr-2">#{{ scope.row.id }}</span>
              <el-tag
                v-for="item in scope.row.tags"
                :key="item.id"
                size="mini"
                class="mr-1"
              >[{{ item.name }}]</el-tag>
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="$t('Issue.Priority')"
            width="150"
            prop="priority"
            sortable="custom"
          >
            <template slot-scope="{row}">
              <Priority v-if="row.priority.name" :name="$t(`Issue.${row.priority.name}`)" :type="row.priority.name" />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="$t('general.Status')"
            width="150"
            prop="status"
            sortable="custom"
          >
            <template slot-scope="{row}">
              <Status
                v-if="row.status.name"
                :name="$t(`Issue.${row.status.name}`)" :type="row.status.name"
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="$t('Issue.Assignee')"
            min-width="180"
            prop="assigned_to"
            sortable="custom"
            show-overflow-tooltip
          >
            <template v-if="scope.row.assigned_to" slot-scope="scope">
              <span>{{ scope.row.assigned_to.name }}</span>
              <span v-if="scope.row.assigned_to.login">({{ scope.row.assigned_to.login }})</span>
            </template>
          </el-table-column>
          <template slot="empty">
            <el-empty :description="$t('general.NoData')" />
          </template>
        </el-table>
        <Pagination
          :total="pageInfo.total"
          :page="listQuery.page"
          :limit="listQuery.limit"
          :layout="'total, sizes, prev, pager, next'"
          @pagination="handleCurrentChange"
        />
      </el-row>
    </div>
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
import { getProjectUserList, getProjectIssueList } from '@/api/projects'
import { getIssue, getIssueFamily } from '@/api/issue'
import { getTestFileByTestPlan } from '@/api/qa'
import { IssueList, ContextMenu } from '@/mixins'
import { ProjectListSelector } from '@/components'
import { QuickAddIssue, ExpandSection, SearchFilter } from '@/components/Issue'
import Result from '@/components/Test/Result'
import XLSX from 'xlsx'
/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'TestPlan',
  components: {
    ExpandSection,
    Result,
    QuickAddIssue,
    ProjectListSelector,
    SearchFilter
  },
  mixins: [IssueList, ContextMenu],
  data() {
    return {
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,
      tracker_id: null,
      assigned_to: [],
      fixed_version: [],
      form: {},
      filterOptions: Object.freeze([
        { id: 1, label: this.$t('Issue.FilterDimensions.status'), value: 'status', placeholder: 'Status', tag: true },
        { id: 2, label: this.$t('Issue.FilterDimensions.assigned_to'), value: 'assigned_to', placeholder: 'Member' },
        {
          id: 3,
          label: this.$t('Issue.FilterDimensions.fixed_version'),
          value: 'fixed_version',
          placeholder: 'Version'
        },
        {
          id: 4,
          label: this.$t('Issue.FilterDimensions.priority'),
          value: 'priority',
          placeholder: 'Priority',
          tag: true
        }
      ]),
      allDownloadData: [],
      allDataLoading: false,
      selectedTestPlan: []
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'tracker', 'status', 'priority', 'fixedVersionShowClosed', 'forceTracker']),
    refTable() {
      return this.$refs['issueList']
    },
    hasSelectedTestPlan() {
      return this.selectedTestPlan.length > 0
    },
    trackerList() {
      return this.tracker.filter(item => item.name === 'Test Plan')
    },
    disableAddIssue () {
      const foundTracker = this.forceTracker.find((tracker) => tracker.id === 8 && tracker.name === 'Test Plan')
      return !!foundTracker
    }
  },
  watch: {
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    },
    trackerList(value) {
      this.tracker_id = value[0].id
    },
    tracker_id() {
      this.loadData()
    },
    listData() {
      this.fetchAllDownloadData()
    }
  },
  async created() {
    this.fixed_version_closed = this.fixedVersionShowClosed
    this.tracker_id = this.trackerList[0].id
    await this.loadSelectionList()
  },
  mounted() {
    this.fetchAllDownloadData()
    this.getInitPage()
  },
  methods: {
    ...mapActions('projects', ['setFixedVersionShowClosed']),
    async fetchAllDownloadData() {
      this.allDataLoading = true
      const res = await getProjectIssueList(this.selectedProjectId, this.getParams(this.totalData))
      this.allDownloadData = res.data.issue_list
      this.allDataLoading = false
    },
    async loadData() {
      if (this.selectedProjectId === -1) return
      this.listLoading = true
      const listData = await this.fetchData()
      this.listData = await this.getAllTestFiles(listData)
      this.listLoading = false
    },
    onChangeFilter() {
      this.backToFirstPage()
      this.loadData()
    },
    getOptionsData(option_name) {
      if (option_name === 'tracker') return this.trackerList
      return this[option_name]
    },
    getParams(limit) {
      const result = {
        offset: this.listQuery.offset,
        limit: limit || this.listQuery.limit,
        tracker_id: this.tracker_id
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
    async loadSelectionList() {
      if (this.selectedProjectId === -1) return
      await Promise.all([
        getProjectUserList(this.selectedProjectId)
      ]).then(res => {
        const [assigneeList] = res.map(
          item => item.data
        )
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
        if (this.userRole === 'Engineer') {
          this.$set(this.filterValue, 'assigned_to', this.userId)
          this.$set(this.originFilterValue, 'assigned_to', this.userId)
        }
      })
      await this.loadVersionList(this.fixed_version_closed)
    },
    handleSelectionChange(list) {
      this.selectedTestPlan = list
    },
    async getAllTestFiles(issueList) {
      if (!issueList) return Promise.resolve(issueList)
      const apiTestFile = []
      for (const issue of issueList) {
        apiTestFile.push(getTestFileByTestPlan(this.selectedProjectId, issue.id))
      }
      const result = await Promise.all(apiTestFile)
      for (const [index, issue] of issueList.entries()) {
        issue['test_files'] = result[index].data
      }
      return Promise.resolve(issueList)
    },
    async getIssueFamilyData(row, expandedRows) {
      this.expandedRow = expandedRows
      if (expandedRows.find((item) => (item.id === row.id))) {
        try {
          await this.$set(row, 'isLoadingFamily', true)
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
          this.$set(row, 'isLoadingFamily', false)
        } catch (e) {
          //   null
          return Promise.resolve()
        }
      }
      return Promise.resolve()
    },
    async fetchDataExcel(selectedTestPlan) {
      const apiRequest = []
      const apiTestFile = []
      selectedTestPlan.forEach((item) => {
        apiRequest.push(getIssue(item.id))
        apiTestFile.push(getTestFileByTestPlan(this.selectedProjectId, item.id))
      })
      const apiResult = await Promise.all(apiRequest)
      const apiTestFileResult = await Promise.all(apiTestFile)
      const result = []
      for (const [index, item] of apiResult.entries()) {
        let data = item.data
        const relationApiRequest = []
        data['relationList'] = []
        data.id = `#${data.id}`
        if (data.parent) {
          data.relationList = data.relationList.concat([data.parent])
        }
        if (data.children) {
          data.relationList = data.relationList.concat(data.children)
        }
        if (data.relations) {
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
          data.relationList = data.relationList.concat(relationResult.map((subItem) => (subItem.data)))
        }
        data = { ...data, test_files: apiTestFileResult[index].data }
        let hasFeature = false
        if (data.relationList.length > 0) {
          for (const subItem of data.relationList) {
            if (subItem.tracker.name === 'Feature') {
              data = {
                ...data,
                object_id: `#${subItem.id}`,
                object_name: subItem.name,
                object_tracker: this.$t('Issue.' + subItem.tracker.name)
              }
              hasFeature = true
              result.push(data)
            }
          }
        }
        if (!hasFeature) {
          result.push(data)
        }
      }
      return result
    },
    dataCleanExcel(fetchData) {
      const exportColumn = {
        name: { column: ['id', 'name'], root: true },
        relations: { column: ['object_tracker', 'object_id', 'object_name'], root: true },
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
            resultArray = this.formatColumns(exportColumn[column].column, item)
            resultArray = resultArray.join(' - ')
          }
          if (exportColumn[column]['children']) {
            const childrenSplit = exportColumn[column]['children'].split('.')
            const getChildrenData = childrenSplit.reduce((total, current) => (total[current]), item)
            if (column === 'software_name' || column === 'file_name') {
              resultArray = this.formatColumns(getChildrenData, item, column)
            } else if (column === 'test_result') {
              resultArray = this.getTestResult(getChildrenData)
            } else if (column === 'branch') {
              resultArray = this.getBranch(getChildrenData)
            } else if (Array.isArray(getChildrenData)) {
              resultArray = this.formatColumns(getChildrenData, item).map((check) => this.joinResult(check, ' - '))
            } else {
              resultArray = this.formatColumns(exportColumn[column].column, getChildrenData)
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
    formatColumns(column, checkDataset, name) {
      return column.map((subColumn) =>
        name ? this.confirmExist(checkDataset, subColumn, name) : this.confirmExist(checkDataset, subColumn))
        .filter(subColumn => subColumn)
    },
    confirmExist(data, column, name) {
      if (!data) {
        return null
      }
      return name ? column[name] : data[column]
    },
    joinResult(columnResult, joinStr) {
      const checkNull = columnResult.reduce((total, current) => (!!total && !!current), true)
      if (!checkNull) return null
      return columnResult.join(joinStr)
    },
    getRowClass({ row }) {
      return row.family ? '' : 'row-expand-cover'
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
    onDowdloadExcel(result) {
      const worksheet = XLSX.utils.json_to_sheet(result)
      this.$excel(worksheet, 'testplan')
    },
    async downloadExcel(selectedTestPlan) {
      let result = await this.fetchDataExcel(selectedTestPlan)
      result = this.dataCleanExcel(result)
      await this.onDowdloadExcel(result)
    },
    onContextMenu({ row, column, event }) {
      this.handleContextMenu(row, column, event)
    },
    collapseExpendRow(issueId) {
      const row = this.listData.find((item) => item.id === issueId)
      this.$refs.issueList.toggleRowExpansion(row, false)
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .row-expand-cover .el-table__expand-icon {
  display: none
}
.family {
  @apply space-y-3;
  .title {
    @apply text-sm font-bold;
  }

  .issue-list {
    @apply space-y-1;
    .issue-item:hover, :focus {
      @apply bg-gray-100
    }
  }
}
</style>
