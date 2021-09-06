<template>
  <div class="app-container">
    <project-list-selector>
      <el-button
        id="btn-add-issue"
        slot="button"
        v-permission="['Administrator','Project Manager', 'Engineer']"
        type="success"
        icon="el-icon-plus"
        :disabled="selectedProjectId === -1"
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
      />
      <span v-show="hasSelectedTestPlan">
        <el-divider direction="vertical" />
        <el-button type="text" icon="el-icon-download" @click="downloadCsv(selectedTestPlan)">
          {{ $t('Dashboard.ADMIN.ProjectList.csv_download') }}</el-button>
      </span>
    </project-list-selector>
    <el-divider />
    <quick-add-issue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      tracker-name="Test Plan"
      @add-issue="advancedAddIssue"
    />
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
        height="60vh"
        :tree-props="{ children: 'child' }"
        :row-class-name="getRowClass"
        @cell-click="handleClick"
        @expand-change="getIssueFamilyData"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" reserve-selection width="55" />
        <el-table-column type="expand" class-name="informationExpand">
          <template slot-scope="scope">
            <el-row v-if="hasRelationIssue(scope.row)"
                    v-loading="scope.row.hasOwnProperty('isLoadingFamily')&&scope.row.isLoadingFamily"
            >
              <div v-if="scope.row.hasOwnProperty('isLoadingFamily') && scope.row.isLoadingFamily" class="p-5" />
              <ul v-else>
                <li v-if="scope.row.hasOwnProperty('parent') && Object.keys(scope.row.parent).length > 0">
                  <strong>{{ $t('Issue.ParentIssue') }}:</strong>
                  <el-link
                    :style="{ 'font-size': '14px', cursor: 'pointer' }"
                    :underline="false"
                    @click="handleEdit(scope.row.parent.id)"
                    @contextmenu.native="handleContextMenu(scope.row.parent, '', $event)"
                  >
                    <status :name="scope.row.parent.status.name" size="mini" />
                    <tracker :name="scope.row.parent.tracker.name" />
                    #{{ scope.row.parent.id }} - {{ scope.row.parent.name }}
                    <span
                      v-if="scope.row.parent.hasOwnProperty('assigned_to') && Object.keys(scope.row.parent.assigned_to).length > 1"
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
                    @confirm="removeIssueRelation(scope.row.id)"
                  >
                    <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                      {{ $t('Issue.Unlink') }}
                    </el-button>
                  </el-popconfirm>
                </li>
                <li v-if="scope.row.hasOwnProperty('children') && scope.row.children.length>0">
                  <strong>{{ $t('Issue.ChildrenIssue') }}:</strong>
                  <ol>
                    <template v-for="child in scope.row.children">
                      <li v-if="Object.keys(child).length > 0" :key="child.id">
                        <el-link
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                          @contextmenu.native="handleContextMenu(child, '', $event)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }}
                            - {{ child.assigned_to.login }})
                          </span>
                        </el-link>
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @confirm="removeIssueRelation(child.id)"
                        >
                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                            {{ $t('Issue.Unlink') }}
                          </el-button>
                        </el-popconfirm>
                      </li>
                    </template>
                  </ol>
                </li>
                <li v-if="scope.row.hasOwnProperty('relations') && scope.row.relations.length>0">
                  <strong>{{ $t('Issue.RelatedIssue') }}:</strong>
                  <ol>
                    <template v-for="child in scope.row.relations">
                      <li v-if="Object.keys(child).length > 0" :key="child.id">
                        <el-link
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                          @contextmenu.native="handleContextMenu(child, '', $event)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})
                          </span>
                        </el-link>
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @confirm="removeRelationIssue(child.relation_id)"
                        >
                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                            {{ $t('Issue.Unlink') }}
                          </el-button>
                        </el-popconfirm>
                      </li>
                    </template>
                  </ol>
                </li>
                <li v-if="scope.row.hasOwnProperty('test_files') && scope.row.test_files.length>0">
                  <strong>{{ $t('Issue.TestFile') }}:</strong>
                  <ol>
                    <template v-for="child in scope.row.test_files">
                      <li v-if="Object.keys(child).length > 0" :key="child.id">
                        {{ child.software_name }} - {{ child.file_name }}
                        <template v-if="child.the_last_test_result">
                          ({{ child.the_last_test_result.branch }} -
                          <el-link type="primary" target="_blank" style="font-size: 16px"
                                   :href="child.the_last_test_result.commit_url"
                          >
                            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
                            {{ child.the_last_test_result.commit_id }}
                          </el-link>
                          -
                          <Result :test-file="child" />
                          )
                        </template>
                        <!--                        <el-link-->
                        <!--                          :style="{ 'font-size': '14px', cursor: 'pointer' }"-->
                        <!--                          :underline="false"-->
                        <!--                          @click="handleEdit(child.id)"-->
                        <!--                          @contextmenu.native="handleContextMenu(child, '', $event)"-->
                        <!--                        >-->
                        <!--                          <status :name="child.status.name" size="mini" />-->
                        <!--                          <tracker :name="child.tracker.name" />-->
                        <!--                          #{{ child.id }} - {{ child.name }}-->
                        <!--                          <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">-->
                        <!--                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})-->
                        <!--                          </span>-->
                        <!--                        </el-link>-->
                        <!--                        <el-popconfirm-->
                        <!--                          :confirm-button-text="$t('general.Remove')"-->
                        <!--                          :cancel-button-text="$t('general.Cancel')"-->
                        <!--                          icon="el-icon-info"-->
                        <!--                          icon-color="red"-->
                        <!--                          :title="$t('Issue.RemoveIssueRelation')"-->
                        <!--                          @confirm="removeRelationIssue(child.relation_id)"-->
                        <!--                        >-->
                        <!--                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">-->
                        <!--                            {{ $t('Issue.Unlink') }}-->
                        <!--                          </el-button>-->
                        <!--                        </el-popconfirm>-->
                      </li>
                    </template>
                  </ol>
                </li>
              </ul>
            </el-row>
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
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180" prop="assigned_to"
                         sortable="custom" show-overflow-tooltip
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
import { QuickAddIssue } from '@/components/Issue'
import ProjectListSelector from '@/components/ProjectListSelector'
import { Table, IssueList, ContextMenu, IssueExpand } from '@/newMixins'
import SearchFilter from '@/components/Issue/SearchFilter'
import { getTestFileByTestPlan } from '../../../api/qa'
import { getIssue, getIssueFamily } from '@/api/issue'
import { getProjectUserList } from '@/api/projects'
import XLSX from 'xlsx'
import Result from '@/components/Test/Result'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'TestPlan',
  components: {
    Result,
    QuickAddIssue,
    ProjectListSelector,
    SearchFilter
  },
  mixins: [Table, IssueList, ContextMenu, IssueExpand],
  data() {
    return {
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,

      tracker_id: null,

      assigned_to: [],
      fixed_version: [],

      form: {},

      selectedTestPlan: []
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'tracker', 'status', 'priority', 'fixedVersionShowClosed']),
    refTable() {
      return this.$refs['issueList']
    },
    filterOptions() {
      return [
        { id: 1, label: this.$t('Issue.FilterDimensions.status'), value: 'status', placeholder: 'Status', tag: true },
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
    hasSelectedTestPlan() {
      return this.selectedTestPlan.length > 0
    },
    trackerList() {
      return this.tracker.filter(item => item.name === 'Test Plan')
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
    }
  },
  async created() {
    this.fixed_version_closed = this.fixedVersionShowClosed
    this.tracker_id = this.trackerList[0].id
    await this.loadSelectionList()
  },
  methods: {
    ...mapActions('projects', ['setFixedVersionShowClosed']),
    async loadData() {
      if (this.selectedProjectId === -1) return
      this.listLoading = true
      const listData = await this.fetchData()
      this.listData = await this.getAllTestFiles(listData)
      this.listLoading = false
    },
    getOptionsData(option_name) {
      if (option_name === 'tracker') return this.trackerList
      return this[option_name]
    },
    getParams() {
      const result = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit,
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
    hasRelationIssue(row) {
      return row.family || (row.test_files && row.test_files.length > 0)
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
    async fetchDataCSV(selectedTestPlan) {
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
                object_subject: (subItem.subject) ? subItem.subject : subItem.name,
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

    dataCleanCSV(fetchData) {
      const exportColumn = {
        name: { column: ['id', 'subject'], root: true },
        relations: { column: ['object_tracker', 'object_id', 'object_subject'], root: true },
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
            if (column === 'test_result') {
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
    formatColumns(column, checkDataset) {
      return column.map((subColumn) => this.confirmExist(checkDataset, subColumn)).filter(subColumn => subColumn)
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
          // console.log(item.software_name, last_result.success, last_result.failure)
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
      const worksheet = XLSX.utils.json_to_sheet(result)
      this.$csv(worksheet, 'testplan')
    },
    async downloadCsv(selectedTestPlan) {
      let result = await this.fetchDataCSV(selectedTestPlan)
      result = await this.dataCleanCSV(result)
      await this.prepareCSV(result)
    }
  }
}
</script>
