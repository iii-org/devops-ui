<template>
  <div class="app-container">
    <ProjectListSelector>
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
        :prefill="{ filterValue: filterValue, keyword: keyword, displayClosed: displayClosed,fixed_version_closed:fixed_version_closed }"
        @change-filter="onChangeFilterForm"
        @change-fixed-version="onChangeFixedVersionStatus"
        @add-custom-filter="updateCustomFilter"
        @clean-filter="cleanFilter"
      >
        <CustomFilter
          ref="customFilter"
          type="issue_list"
          :selection-options="contextOptions"
          @apply-filter="applyCustomFilter"
        />
        <span
          slot="download"
          v-permission="['QA']"
        >
          <el-divider direction="vertical" />
          <el-popover
            placement="bottom"
            trigger="click"
          >
            <el-menu class="download">
              <el-menu-item
                :disabled="selectedProjectId === -1 || allDataLoading"
                @click="downloadExcel('allDownloadData')"
              >
                <em class="el-icon-download" />{{ $t('Dashboard.ADMIN.ProjectList.all_download') }}
              </el-menu-item>
              <el-menu-item
                v-show="hasSelectedIssue"
                :disabled="selectedProjectId === -1"
                @click="downloadExcel(selectedIssueList)"
              >
                <em class="el-icon-download" />{{ $t('Dashboard.ADMIN.ProjectList.excel_download') }}
              </el-menu-item>
            </el-menu>
            <el-button
              slot="reference"
              icon="el-icon-download"
            >{{ $t('File.Download') }}</el-button>
          </el-popover>
        </span>
      </SearchFilter>
    </ProjectListSelector>
    <el-divider />
    <quick-add-issue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      @add-issue="advancedAddIssue"
    />
    <div
      ref="wrapper"
      class="wrapper"
      :class="{'show-quick':quickAddTopicDialogVisible}"
    >
      <el-row
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
      >
        <!-- tree-props 取消第二個子議題箭頭-->
        <el-table
          ref="issueList"
          :data="listData"
          fit
          highlight-current-row
          row-key="id"
          :height="tableHeight"
          :tree-props="{ children: 'child' }"
          :row-class-name="getRowClass"
          @cell-click="handleClick"
          @expand-change="getIssueFamilyData"
          @sort-change="handleSortChange"
          @row-contextmenu="handleContextMenu"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="userRole === 'QA'"
            type="selection"
            reserve-selection
            width="55"
          />
          <el-table-column
            type="expand"
            class-name="informationExpand"
          >
            <template slot-scope="{row}">
              <ExpandSection
                :issue="row"
                @on-context-menu="onContextMenu"
              />
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('general.Type')"
            width="130"
            prop="tracker"
            sortable="custom"
          >
            <template slot-scope="{row}">
              <Tracker
                v-if="row.tracker.name"
                :name="$t(`Issue.${row.tracker.name}`)"
                :type="row.tracker.name"
              />
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
              <Priority
                v-if="row.priority.name"
                :name="$t(`Issue.${row.priority.name}`)"
                :type="row.priority.name"
              />
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
                :name="$t(`Issue.${row.status.name}`)"
                :type="row.status.name"
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
            <template
              v-if="scope.row.assigned_to"
              slot-scope="scope"
            >
              <span>{{ scope.row.assigned_to.name }}</span>
              <span v-if="scope.row.assigned_to.login">({{ scope.row.assigned_to.login }})</span>
            </template>
          </el-table-column>
          <el-table-column
            type="action"
            width="50px"
          >
            <template slot-scope="{row}">
              <el-button
                class="action"
                type="text"
                icon="el-icon-more"
                @click.native.stop="handleContextMenu(row, {}, $event)"
              />
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
    </div>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @backToFirstPage="backToFirstPage"
      @update="loadData"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { QuickAddIssue, ExpandSection, SearchFilter, CustomFilter } from '@/components/Issue'
import ProjectListSelector from '@/components/ProjectListSelector'
import { Table, IssueList, ContextMenu } from '@/newMixins'
import { excelTranslate } from '@/utils/excelTableTranslate'
import { getProjectIssueList } from '@/api/projects'
import XLSX from 'xlsx'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ProjectIssueList',
  components: {
    QuickAddIssue,
    ProjectListSelector,
    SearchFilter,
    ExpandSection,
    CustomFilter
  },
  mixins: [Table, IssueList, ContextMenu],
  data() {
    return {
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,
      assigned_to: [],
      fixed_version: [],
      tags: [],
      form: {},
      selectedIssueList: [],
      allDownloadData: [],
      allDataLoading: false,
      excelColumnSelected: ['tracker', 'id', 'name', 'priority', 'status', 'assigned_to']
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'fixedVersionShowClosed']),
    refTable() {
      return this.$refs['issueList']
    },
    hasSelectedIssue() {
      return this.selectedIssueList.length > 0
    }
  },
  watch: {
    selectedProjectId: {
      async handler() {
        this.keyword = ''
        await this.onChangeFilter()
        await this.fetchInitData()
      },
      immediate: true
    }
  },
  async created() {
    await this.fetchInitData()
  },
  mounted() {
    this.getInitPage()
  },
  methods: {
    ...mapActions('projects', [
      'getIssueFilter',
      'getKeyword',
      'getDisplayClosed',
      'setKeyword',
      'setIssueFilter',
      'setDisplayClosed',
      'setFixedVersionShowClosed',
      'getFixedVersionShowClosed'
    ]),
    async fetchInitData() {
      await this.getInitStoredData()
      await this.loadSelectionList()
      await this.loadData()
    },
    async fetchAllDownloadData() {
      this.allDataLoading = true
      const res = await getProjectIssueList(this.selectedProjectId, this.getParams(this.totalData))
      this.allDownloadData = res.data.issue_list
      this.allDataLoading = false
    },
    async getInitStoredData() {
      const key = 'list'
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed, storedVersionClosed } = storedData
      this.filterValue = storedFilterValue[key] ? storedFilterValue[key] : {}
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
    getParams(limit) {
      const result = {
        offset: this.listQuery.offset,
        limit: limit || this.listQuery.limit
      }
      if (this.sort) {
        result['sort'] = this.sort
      }
      if (!this.displayClosed) {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          item === 'tags' && this.filterValue[item].length > 0
            ? (result[item] = this.filterValue[item].join())
            : (result[item + '_id'] = this.filterValue[item])
        }
      })
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    async onChangeFilter() {
      const key = 'list'
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
      storedFilterValue[key] = this.filterValue
      storedKeyword[key] = this.keyword
      storedDisplayClosed[key] = this.displayClosed
      await this.setIssueFilter(storedFilterValue)
      await this.setKeyword(storedKeyword)
      await this.setDisplayClosed(storedDisplayClosed)
      await this.backToFirstPage()
      await this.loadData()
    },
    handleSelectionChange(list) {
      this.selectedIssueList = list
    },
    async downloadExcel(selectedIssueList) {
      if (selectedIssueList === 'allDownloadData') {
        this.$notify({ type: 'warning', title: this.$t('Loading').toString() })
        await this.fetchAllDownloadData()
      }
      const selectedColumn = this.handleCsvSelectedColumn(selectedIssueList)
      const translateTable = this.handleCsvTranslateTable(selectedColumn)
      const worksheet = XLSX.utils.json_to_sheet(translateTable)
      this.$excel(worksheet, 'projectIssues')
    },
    handleCsvSelectedColumn(selectedIssueList) {
      const selectedColumn = []
      selectedIssueList.forEach((item) => {
        const targetObject = {}
        this.excelColumnSelected.map((itemSelected) => {
          switch (itemSelected) {
            case 'status':
              this.$set(targetObject, itemSelected, this.getStatusTagType(item.status.name))
              break
            case 'priority':
              this.$set(targetObject, itemSelected, this.getPriorityTagType(item.priority.name))
              break
            case 'tracker':
              this.$set(targetObject, itemSelected, this.getCategoryTagType(item.tracker.name))
              break
            case 'assigned_to':
              this.$set(
                targetObject,
                itemSelected,
                item.assigned_to.name ? `${item.assigned_to.name}(${item.assigned_to.login})` : ''
              )
              break
            default:
              this.$set(targetObject, itemSelected, item[itemSelected])
          }
        })
        selectedColumn.push(targetObject)
      })
      return selectedColumn
    },
    handleCsvTranslateTable(selectedColumn) {
      const translateTable = []
      selectedColumn.forEach((item) => {
        const chineseExcel = {}
        const chineseColumnKey = Object.keys(item).map((key) => {
          key = excelTranslate.projectIssues[key]
          return key
        })
        Object.values(item).map((val, index) => {
          this.$set(chineseExcel, chineseColumnKey[index], val)
        })
        translateTable.push(chineseExcel)
      })
      return translateTable
    },
    getStatusTagType(status) {
      switch (status) {
        case 'Active':
          return '已開立'
        case 'Assigned':
          return '已分派'
        case 'Closed':
          return '已關閉'
        case 'Solved':
          return '已解決'
        case 'Responded':
          return '已回應'
        case 'Finished':
          return '已完成'
      }
    },
    getPriorityTagType(priority) {
      switch (priority) {
        case 'Immediate':
          return '緊急'
        case 'High':
          return '高'
        case 'Normal':
          return '一般'
        case 'Low':
          return '低'
      }
    },
    getCategoryTagType(category) {
      switch (category) {
        case 'Epic':
          return '需求規格'
        case 'Audit':
          return '合規需求'
        case 'Feature':
          return '功能設計'
        case 'Bug':
          return '程式錯誤'
        case 'Issue':
          return '議題'
        case 'Change Request':
          return '變更請求'
        case 'Risk':
          return '風險管理'
        case 'Test Plan':
          return '測試計畫'
        case 'Fail Management':
          return '異常管理'
      }
    },
    updateCustomFilter() {
      this.$refs.customFilter.fetchCustomFilter()
    },
    cleanFilter() {
      this.$refs.customFilter.resetApplyFilter()
    },
    applyCustomFilter(filters) {
      const { result, displayClosed, fixed_version_closed } = filters
      this.onChangeFilterForm({ filterValue: result })
      this.displayClosed = displayClosed
      this.fixed_version_closed = fixed_version_closed
    }
  }
}
</script>
