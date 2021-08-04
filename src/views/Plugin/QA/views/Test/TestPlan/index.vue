<template>
  <div class="app-container">
    <project-list-selector>
      <el-button
        id="btn-add-issue"
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
                  v-for="item in (dimension.value==='status')? filterClosedStatus(getOptionsData(dimension.value)):getOptionsData(dimension.value)"
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
      <el-divider direction="vertical" />
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
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" reserve-selection width="55" />
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
                    <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                      {{ $t('Issue.Unlink') }}
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
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})
                          </span>
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
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }}
                            - {{ child.assigned_to.login }})</span>
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
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180" prop="assigned_to"
                         sortable="custom" show-overflow-tooltip
        >
          <template v-if="scope.row.author" slot-scope="scope">
            <span>{{ scope.row.author.name }}</span>
            <span v-if="scope.row.author.login">({{ scope.row.author.login }})</span>
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
import QuickAddIssue from './components/QuickAddIssue'
import ProjectListSelector from '@/components/ProjectListSelector'
import { Table, IssueList, ContextMenu } from '@/newMixins'
import { Parser } from 'json2csv'
import { getTestPlanDetail } from '../../../api/qa'
import { getIssue } from '@/api/issue'
import { getProjectUserList } from '@/api/projects'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'TestPlan',
  components: {
    QuickAddIssue,
    ProjectListSelector
  },
  mixins: [Table, IssueList, ContextMenu],
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
            // console.log(resultArray)
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
      const jsonToCSVParser = new Parser()
      const attr = 'data:text/csv;charset=utf-8,'
      const csvContent = `${attr} ${jsonToCSVParser.parse(result)}`
      const encodeUri = encodeURI(csvContent)
      const time = new Date()
      const timeNow = time.toLocaleDateString()
      const a = document.createElement('a')
      const url = encodeUri
      const filename = `testplan_${timeNow}.csv`
      a.href = url
      a.download = filename
      a.click()
    },
    async downloadCsv(selectedTestPlan) {
      let result = await this.fetchDataCSV(selectedTestPlan)
      result = await this.dataCleanCSV(result)
      await this.prepareCSV(result)
    }
  }
}
</script>
