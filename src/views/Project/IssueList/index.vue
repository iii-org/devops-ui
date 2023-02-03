<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        id="btn-add-issue"
        slot="button"
        v-permission="['Administrator','Project Manager', 'Engineer']"
        class="buttonSecondary"
        icon="el-icon-plus"
        :disabled="isDisabled"
        @click="handleQuickAddClose"
      >
        {{ $t('Issue.AddIssue') }}
      </el-button>
      <SearchFilter
        :filter-options="filterOptions"
        :list-loading="listLoading"
        :selection-options="contextOptions"
        :prefill="{
          filterValue: filterValue,
          keyword: keyword,
          displayClosed: displayClosed,
          fixed_version_closed: fixed_version_closed
        }"
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
                :disabled="isDisabled || allDataLoading"
                @click="downloadExcel('allDownloadData')"
              >
                <em class="el-icon-download" />
                {{ $t('Dashboard.ADMIN.ProjectList.all_download') }}
              </el-menu-item>
              <el-menu-item
                v-show="hasSelectedIssue"
                :disabled="isDisabled"
                @click="downloadExcel(selectedIssueList)"
              >
                <em class="el-icon-download" />
                {{ $t('Dashboard.ADMIN.ProjectList.excel_download') }}
              </el-menu-item>
            </el-menu>
            <el-button
              slot="reference"
              class="buttonPrimaryReverse"
              icon="el-icon-download"
              size="mini"
            >
              {{ $t('File.Download') }}
            </el-button>
          </el-popover>
        </span>
        <Columns
          :columns-options="columnsOptions"
          :display-fields.sync="displayFields"
          :filter-value="filterValue"
          :type="'issue_list'"
        />
        <el-divider direction="vertical" />
      </SearchFilter>
    </ProjectListSelector>
    <el-divider />
    <QuickAddIssue
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
          size="mini"
          row-key="id"
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
              <IssueExpand
                :issue="row"
                @on-context-menu="onContextMenu"
                @update-list="loadData"
                @handle-expand-row="handleExpandRow"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.indexOf('project') >= 0"
            :label="$t('Issue.project')"
            min-width="130"
            show-overflow-tooltip
            prop="project.id"
            sortable="custom"
          >
            <template
              v-if="scope.row.project"
              slot-scope="scope"
            >
              <span>{{ scope.row.project.display }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.indexOf('tracker') >= 0"
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
            v-if="columns.indexOf('name') >= 0"
            :label="$t('Issue.Id')"
            min-width="280"
            show-overflow-tooltip
            prop="id"
            sortable="custom"
          >
            <template slot-scope="scope">
              <span style="display:flex;">
                <div
                  class="text-success mr-2"
                  style="display:flex; align-items:center;"
                >
                  #{{ scope.row.id }}
                </div>
                <div class="truncate">
                  <template v-if="scope.row.tags.length > 0">
                    <el-tag
                      v-for="item in scope.row.tags"
                      :key="item.id"
                      size="mini"
                      class="mr-1"
                    >
                      [{{ item.name }}]
                    </el-tag>
                    <br>
                  </template>
                  {{ scope.row.name }}
                </div>
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.indexOf('priority') >= 0"
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
            v-if="columns.indexOf('status') >= 0"
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
            v-if="columns.indexOf('assigned_to') >= 0"
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
              <span>
                {{ scope.row.assigned_to.name }}
              </span>
              <span v-if="scope.row.assigned_to.login">
                ({{ scope.row.assigned_to.login }})
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.indexOf('fixed_version') >= 0"
            align="center"
            :label="$t('Issue.fixed_version')"
            min-width="180"
            prop="fixed_version"
            sortable="custom"
            show-overflow-tooltip
          >
            <template
              v-if="scope.row.fixed_version"
              slot-scope="scope"
            >
              <span>
                {{ scope.row.fixed_version.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.indexOf('StartDate') >= 0"
            align="center"
            :label="$t('Issue.StartDate')"
            min-width="180"
            prop="start_date"
            sortable="custom"
            show-overflow-tooltip
          >
            <template
              v-if="scope.row.start_date"
              slot-scope="scope"
            >
              <span>
                {{ scope.row.start_date }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.indexOf('EndDate') >= 0"
            align="center"
            :label="$t('Issue.EndDate')"
            min-width="180"
            prop="due_date"
            sortable="custom"
            show-overflow-tooltip
          >
            <template
              v-if="scope.row.due_date"
              slot-scope="scope"
            >
              <span>
                {{ scope.row.due_date }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.indexOf('DoneRatio') >= 0"
            align="center"
            :label="$t('Issue.DoneRatio')"
            min-width="180"
            prop="done_ratio"
            sortable="custom"
            show-overflow-tooltip
          >
            <template
              v-if="scope.row.done_ratio"
              slot-scope="scope"
            >
              <span>
                {{ scope.row.done_ratio }}
              </span>
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
        <Pagination
          :total="listQuery.total"
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
      @backToFirstPage="backToFirstPage"
      @update="loadData"
      @update-row="getContextRow"
    />
  </div>
</template>

<script>
import { getProjectIssueList } from '@/api_v2/projects'
import { addIssue } from '@/api/issue'
import { excelTranslate } from '@/utils/excelTableTranslate'
import {
  getStatusTagType,
  getPriorityTagType,
  getCategoryTagType
} from '@/utils/getElementType'
import {
  BasicData,
  Columns,
  IssueExpand,
  SearchFilter,
  Pagination,
  ContextMenu
} from '@/mixins'
import { ProjectListSelector } from '@/components'
import {
  QuickAddIssue,
  Priority,
  Status,
  Tracker
} from '@/components/Issue'
import axios from 'axios'
import XLSX from 'xlsx'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ProjectIssueList',
  components: {
    ProjectListSelector,
    QuickAddIssue,
    Priority,
    Status,
    Tracker
  },
  mixins: [
    BasicData,
    Columns,
    IssueExpand,
    SearchFilter,
    Pagination,
    ContextMenu
  ],
  data() {
    return {
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      form: {},
      selectedIssueList: [],
      allDataLoading: false,
      excelColumnSelected: ['tracker', 'id', 'name', 'priority', 'status', 'assigned_to'],
      columnsOptions: Object.freeze([
        { display: this.$t('Issue.project'), field: 'project' },
        { display: this.$t('Issue.name'), field: 'name' },
        { display: this.$t('Issue.tracker'), field: 'tracker' },
        { display: this.$t('Issue.status'), field: 'status' },
        { display: this.$t('Issue.fixed_version'), field: 'fixed_version' },
        { display: this.$t('Issue.StartDate'), field: 'StartDate' },
        { display: this.$t('Issue.EndDate'), field: 'EndDate' },
        { display: this.$t('Issue.priority'), field: 'priority' },
        { display: this.$t('Issue.assigned_to'), field: 'assigned_to' },
        { display: this.$t('Issue.DoneRatio'), field: 'DoneRatio' }
      ]),
      filterOptions: Object.freeze([
        {
          id: 1,
          label: this.$t('Issue.FilterDimensions.tracker'),
          value: 'tracker',
          placeholder: 'Type',
          tag: true
        },
        {
          id: 2,
          label: this.$t('Issue.FilterDimensions.status'),
          value: 'status',
          placeholder: 'Status',
          tag: true
        },
        {
          id: 3,
          label: this.$t('Issue.FilterDimensions.tags'),
          value: 'tags',
          placeholder: 'Tag'
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
      ]),
      storageName: 'issueList',
      storageType: ['SearchFilter', 'Pagination'],
      parentId: 0,
      sort: '',
      lastIssueListCancelToken: null
    }
  },
  computed: {
    hasSelectedIssue() {
      return this.selectedIssueList.length > 0
    },
    mainSelectedProjectId() {
      return this.filterValue.project || this.selectedProjectId
    },
    isDisabled() {
      return this.mainSelectedProjectId === -1
    }
  },
  methods: {
    async fetchAllDownloadData() {
      this.allDataLoading = true
      const res = await getProjectIssueList(
        this.mainSelectedProjectId,
        this.getParams(this.listQuery.total)
      )
      this.allDataLoading = false
      return res.data.issue_list
    },
    async fetchData() {
      let listData
      try {
        await this.checkLastRequest()
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        const res = await getProjectIssueList(
          this.mainSelectedProjectId,
          this.getParams(), {
            cancelToken: cancelTokenSource.token
          })
        listData = res.data.issue_list
        this.setNewListQuery(res.data.page)
      } catch (e) {
        // null
      }
      this.lastIssueListCancelToken = null
      return listData
    },
    checkLastRequest() {
      if (this.lastIssueListCancelToken && this.listLoading) {
        this.lastIssueListCancelToken.cancel()
      }
    },
    handleSelectionChange(list) {
      this.selectedIssueList = list
    },
    handleClick(row, column) {
      if (column.type === 'action') {
        return false
      }
      if (column.type === 'expand' && row.family) {
        return this.$refs['issueList'].toggleRowExpansion(row)
      }
      this.$router.push({ name: 'IssueDetail', params: { issueId: row.id, project: row.project }})
    },
    async saveIssue(data) {
      const res = await addIssue(data)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })
      this.backToFirstPage()
      this.loadData()
      this.addTopicDialogVisible = false
      this.$refs['quickAddIssue'].form.name = ''
      return res
    },
    backToFirstPage() {
      this.listQuery.page = 1
      this.listQuery.offset = 0
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
      if (order === 'descending') {
        return 'desc'
      }
      if (order === 'ascending') {
        return 'asc'
      }
      return false
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    async downloadExcel(selectedIssueList) {
      if (selectedIssueList === 'allDownloadData') {
        this.$notify({ type: 'warning', title: this.$t('Loading').toString() })
        const issueList = await this.fetchAllDownloadData()
        this.handleDownload(issueList)
      } else this.handleDownload(selectedIssueList)
    },
    handleDownload(issueList) {
      const selectedColumn = this.handleCsvSelectedColumn(issueList)
      const translateTable = this.handleCsvTranslateTable(selectedColumn)
      const worksheet = XLSX.utils.json_to_sheet(translateTable)
      this.$excel(worksheet, 'projectIssues')
    },
    handleCsvSelectedColumn(selectedIssueList) {
      const selectedColumn = []
      selectedIssueList.forEach((item) => {
        const targetObject = {}
        this.excelColumnSelected.forEach((itemSelected) => {
          switch (itemSelected) {
            case 'status':
              this.$set(targetObject, itemSelected, getStatusTagType(item.status.name))
              break
            case 'priority':
              this.$set(targetObject, itemSelected, getPriorityTagType(item.priority.name))
              break
            case 'tracker':
              this.$set(targetObject, itemSelected, getCategoryTagType(item.tracker.name))
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
        Object.values(item).forEach((val, index) => {
          this.$set(chineseExcel, chineseColumnKey[index], val)
        })
        translateTable.push(chineseExcel)
      })
      return translateTable
    },
    getRowClass({ row }) {
      const result = []
      if (!row.family) {
        result.push('hide-expand-icon')
      }
      this.contextMenu ? result.push('context-menu') : result.push('cursor-pointer')
      return result.join(' ')
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
}

.download {
  @apply border-none;
}

>>> .el-table__body-wrapper {
  overflow-y: auto;
}

>>> .el-table {
  .hide-expand-icon {
    .el-table__expand-column .cell {
      display: none;
    }
  }

  .action {
    @apply border-0;
  }
}

>>> .el-table__expanded-cell {
  font-size: 0.875em;
  padding-top: 10px;
  padding-bottom: 10px;
}

>>> .row-expand-loading .el-table__expand-column .cell {
  padding: 0;

  .el-table__expand-icon {
    .el-icon-arrow-right {
      animation: rotating 2s linear infinite;
    }

    .el-icon-arrow-right:before {
      content: '\e6cf';
      font-size: 1.25em;
    }
  }
}

>>> .context-menu {
  cursor: context-menu;
}
</style>
