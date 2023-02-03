<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        id="btn-add-issue"
        slot="button"
        v-permission="['Administrator','Project Manager', 'Engineer']"
        class="buttonSecondary"
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
        :prefill="{
          filterValue: filterValue,
          keyword: keyword,
          displayClosed: displayClosed,
          fixed_version_closed: fixed_version_closed
        }"
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
                <em class="el-icon-download" />
                {{ $t('Dashboard.ADMIN.ProjectList.all_download') }}
              </el-menu-item>
              <el-menu-item
                v-show="hasSelectedFail"
                :disabled="selectedProjectId === -1"
                @click="downloadExcel(selectedFailList)"
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
      </SearchFilter>
    </ProjectListSelector>
    <el-divider />
    <QuickAddIssue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      tracker-name="Fail Management"
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
          size="mini"
          :tree-props="{ children: 'child' }"
          :row-class-name="getRowClass"
          @cell-click="handleClick"
          @expand-change="getIssueFamilyData"
          @row-contextmenu="handleContextMenu"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column
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
                @handle-expand-row="handleExpandRow"
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
              <span class="text-success mr-2">
                #{{ scope.row.id }}
              </span>
              <el-tag
                v-for="item in scope.row.tags"
                :key="item.id"
                size="mini"
                class="mr-1"
              >
                [{{ item.name }}]
              </el-tag>
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
              <span>
                {{ scope.row.assigned_to.name }}
              </span>
              <span v-if="scope.row.assigned_to.login">
                ({{ scope.row.assigned_to.login }})
              </span>
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
          :page-sizes="[listQuery.limit]"
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
import XLSX from 'xlsx'
import axios from 'axios'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ExceptionManagement',
  components: {
    ProjectListSelector,
    QuickAddIssue,
    Priority,
    Status,
    Tracker
  },
  mixins: [
    BasicData,
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
      filterOptions: Object.freeze([
        {
          id: 1,
          label: this.$t('Issue.FilterDimensions.status'),
          value: 'status',
          placeholder: 'Status',
          tag: true
        },
        { id: 2,
          label: this.$t('Issue.FilterDimensions.assigned_to'),
          value: 'assigned_to',
          placeholder: 'Member'
        },
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
      csvColumnSelected: [
        'tracker',
        'id',
        'name',
        'priority',
        'status',
        'assigned_to'
      ],
      allDataLoading: false,
      allDownloadData: [],
      selectedFailList: [],
      storageName: 'exceptionManagement',
      storageType: ['SearchFilter', 'Pagination'],
      parentId: 0,
      sort: '',
      tracker_id: 9,
      lastIssueListCancelToken: null
    }
  },
  computed: {
    hasSelectedFail() {
      return this.selectedFailList.length > 0
    }
  },
  async mounted() {
    await this.fetchAllDownloadData()
  },
  methods: {
    async fetchAllDownloadData() {
      this.allDataLoading = true
      const res = await getProjectIssueList(
        this.selectedProjectId,
        this.getParams(this.listQuery.total)
      )
      this.allDownloadData = res.data.issue_list
      this.allDataLoading = false
    },
    async fetchData() {
      let listData
      try {
        await this.checkLastRequest()
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        const res = await getProjectIssueList(
          this.filterValue.project || this.selectedProjectId,
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
    handleQuickAddClose() {
      this.quickAddTopicDialogVisible = !this.quickAddTopicDialogVisible
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
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    handleClick(row, column) {
      if (column.type === 'action') {
        return false
      }
      if (column.type === 'expand' && row.family) {
        return this.$refs.issueList.toggleRowExpansion(row)
      }
      this.$router.push({ name: 'IssueDetail', params: { issueId: row.id, project: row.project }})
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
    handleSelectionChange(list) {
      this.selectedFailList = list
    },
    downloadExcel(selectedFailList) {
      const selectedColumn = this.handleExcelSelectedColumn(selectedFailList)
      const translateTable = this.handleExcelTranslateTable(selectedColumn)
      const worksheet = XLSX.utils.json_to_sheet(translateTable)
      this.$excel(worksheet, 'exception')
    },
    handleExcelSelectedColumn(selectedFailList) {
      const selectedColumn = []
      selectedFailList.forEach((item) => {
        const targetObject = {}
        this.csvColumnSelected.map((itemSelected) => {
          if (itemSelected === 'status') {
            this.$set(targetObject, itemSelected, getStatusTagType(item.status.name))
          } else if (itemSelected === 'priority') {
            this.$set(targetObject, itemSelected, getPriorityTagType(item.priority.name))
          } else if (itemSelected === 'tracker') {
            this.$set(targetObject, itemSelected, getCategoryTagType(item.tracker.name))
          } else if (itemSelected === 'assigned_to') {
            this.$set(
              targetObject,
              itemSelected,
              item.assigned_to.name ? `${item.assigned_to.name}(${item.assigned_to.login})` : ''
            )
          } else {
            this.$set(targetObject, itemSelected, item[itemSelected])
          }
        })
        selectedColumn.push(targetObject)
      })
      return selectedColumn
    },
    handleExcelTranslateTable(selectedColumn) {
      const translateTable = []
      selectedColumn.forEach((item) => {
        const chineseExcel = {}
        const chineseColumnKey = Object.keys(item).map((key) => {
          key = excelTranslate.exceptionManagement[key]
          return key
        })
        Object.values(item).map((val, index) => {
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
