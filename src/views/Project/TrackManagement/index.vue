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
                v-show="hasSelectedTrack"
                :disabled="selectedProjectId === -1"
                @click="downloadExcel(selectedTrackList)"
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
      tracker-name="Change Request"
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
          height="60vh"
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
              <ExpandSection
                :issue="row"
                @on-context-menu="onContextMenu"
              />
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('Issue.name')"
            show-overflow-tooltip
            min-width="300"
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
            :label="$t('TrackManagement.description')"
            prop="parent_description"
            width="200"
          />
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
      @update="loadData"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { QuickAddIssue, ExpandSection, SearchFilter } from '@/components/Issue'
import ProjectListSelector from '@/components/ProjectListSelector'
import { Table, IssueList, ContextMenu } from '@/newMixins'
import { excelTranslate } from '@/utils/excelTableTranslate'
import { getProjectUserList, getProjectIssueList } from '@/api/projects'
import { getIssueFamily } from '@/api/issue'
import XLSX from 'xlsx'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'TrackManagement',
  components: {
    QuickAddIssue,
    ProjectListSelector,
    SearchFilter,
    ExpandSection
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
      filterOptions: Object.freeze([
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
      ]),
      csvColumnSelected: ['id', 'name', 'parent_description', 'relations', 'status', 'assigned_to'],
      allDataLoading: false,
      allDownloadData: [],
      selectedTrackList: []
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'tracker', 'status', 'priority', 'fixedVersionShowClosed']),
    refTable() {
      return this.$refs['issueList']
    },
    hasSelectedTrack() {
      return this.selectedTrackList.length > 0
    },
    trackerList() {
      return this.tracker.filter((item) => item.name === 'Change Request')
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
      this.fetchData()
    },
    listData(data) {
      if (!data) return
      this.fetchRelativeData(data)
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
      try {
        const res = await getProjectIssueList(this.selectedProjectId, this.getParams(this.totalData))
        this.allDownloadData = res.data.issue_list
      } catch (err) {
        console.error(err)
      } finally {
        this.fetchRelativeData(this.allDownloadData)
        this.allDataLoading = false
      }
    },
    /**
     * parent_description is for "變更內容(議題描述)" column
     */
    fetchRelativeData(data) {
      data.forEach(async (item) => {
        try {
          const res = await getIssueFamily(item.id)
          const listData = res.data
          if (listData.hasOwnProperty('parent')) {
            this.$set(item, 'parent_description', listData.parent.description)
          }
        } catch (err) {
          console.error(err)
        }
      })
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
      await Promise.all([getProjectUserList(this.selectedProjectId)]).then((res) => {
        const [assigneeList] = res.map((item) => item.data)
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
      this.selectedTrackList = list
    },
    downloadExcel(selectedTrackList) {
      const selectedColumn = this.handleExcelSelectedColumn(selectedTrackList)
      const translateTable = this.handleExcelTranslateTable(selectedColumn)
      const worksheet = XLSX.utils.json_to_sheet(translateTable)
      this.$excel(worksheet, 'changes')
    },
    handleExcelSelectedColumn(selectedTrackList) {
      const selectedColumn = []
      selectedTrackList.forEach((item) => {
        const targetObject = {}
        this.setTargetObjectData(targetObject, item)
        selectedColumn.push(targetObject)
      })
      return selectedColumn
    },
    setTargetObjectData(targetObject, item) {
      this.csvColumnSelected.forEach((itemSelected) => {
        if (itemSelected === 'status') {
          this.$set(targetObject, itemSelected, this.getStatusTagType(item.status.name))
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
    },
    handleExcelTranslateTable(selectedColumn) {
      const translateTable = []
      selectedColumn.forEach((item) => {
        const chineseExcel = {}
        const chineseColumnKey = Object.keys(item).map((key) => excelTranslate.trackManagement[key])
        Object.values(item).forEach((val, index) => {
          this.$set(chineseExcel, chineseColumnKey[index], val)
        })
        translateTable.push(chineseExcel)
      })
      return translateTable
    },
    getRowClass({ row }) {
      return row.family ? '' : 'row-expand-cover'
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
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .row-expand-cover .el-table__expand-icon {
  display: none
}
.download {
  @apply border-none;
}
</style>
