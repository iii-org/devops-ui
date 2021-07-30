<template>
  <div class="app-container">
    <el-row>
      <el-col>
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
          <el-input
            v-if="searchVisible"
            id="input-search"
            v-model="keyword"
            prefix-icon="el-icon-search"
            :placeholder="$t('Project.SearchProjectNameOrId')"
            style="width: 250px;"
            clearable
            @blur="searchVisible=!searchVisible"
          />
          <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">
            {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
          </el-button>
          <span v-show="hasSelectedProject">
            <el-divider direction="vertical" />
            <el-button type="text" icon="el-icon-download" @click="downloadCsv(selectedProjectList)">{{
              $t('Dashboard.ADMIN.ProjectList.csv_download')
            }}</el-button>
          </span>
        </project-list-selector>
      </el-col>
    </el-row>
    <el-divider />
    <quick-add-issue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      :tracker="tracker"
      @add-issue="advancedAddIssue"
    />
    <el-table
      ref="issueList"
      v-loading="listLoading"
      :data="pagedData"
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
      <el-table-column :label="$t('general.Type')" width="130">
        <template slot-scope="scope">
          <tracker v-if="scope.row.tracker.name" :name="scope.row.tracker.name" />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Project.Name') + '/' + $t('Project.Identifier')"
        show-overflow-tooltip
        min-width="300"
      >
        <template slot-scope="scope">
          <span v-if="userRole !== 'QA'" class="text-success mr-2" style="font-size: 16px;">
            #{{ scope.row.id }}
          </span>
          <template v-else>
            #{{ scope.row.id }}
          </template>
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
      <el-table-column label="受分派者" width="150">
        <template slot-scope="scope">
          <span>{{ !scope.row.assigned_to.name && !scope.row.assigned_to.login ? '-' : `${scope.row.assigned_to.name}(${scope.row.assigned_to.login})` }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { addIssue, getIssueTracker, getIssueFamily, updateIssue } from '@/api/issue'
import { getProjectIssueList } from '@/api/projects'
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
// import MixinBasicTableWithProject from '@/mixins/MixinBasicTableWithProject'
import { BasicData, SearchBar, Pagination, Table, ProjectSelector } from '@/newMixins'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import QuickAddIssue from './components/QuickAddIssue'
import Fuse from 'fuse.js'
import { Parser } from 'json2csv'
import { csvTranslate } from '@/utils/csvTableTranslate'

export default {
  name: 'ExceptionManagement',
  components: { ProjectListSelector, Status, Tracker, Priority, QuickAddIssue },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  mixins: [ProjectSelector, BasicData, SearchBar, Pagination, Table],
  data() {
    return {
      editProject: {},
      deleteProject: { id: '', name: '' },
      searchKeys: ['id', 'name'],
      rowHeight: 74,
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      listFilterTrackerData: [],
      selectedProjectList: [],
      parentName: '',
      parentId: 0,
      tracker: [{
        id: 9,
        name: 'Fail Management'
      }],
      form: {},
      searchVisible: false,
      csvColumnSelected: ['tracker', 'id', 'name', 'priority', 'status', 'assigned_to']
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'userRole',
      'projectList',
      'projectListTotal',
      'userProjectList',
      'selectedProjectId'
    ]),
    hasSelectedProject() {
      return this.selectedProjectList.length > 0
    },
    trackerValue() {
      return this.tracker.filter((item) => (item.visible === true))
    }
  },
  watch: {
    listData: {
      deep: true,
      handler() {
        this.updateData()
      }
    },
    trackerValue: {
      deep: true,
      handler() {
        this.updateData()
      }
    }
  },
  methods: {
    async fetchData() {
      const tracker_list = await getIssueTracker()
      this.tracker = tracker_list.data
      const tracker_id = tracker_list.data.find(item => item.name === 'Fail Management').id
      const project_list = await getProjectIssueList(this.selectedProjectId, { tracker_id })
      this.listData = project_list.data
      return project_list.data
    },
    handleEdit(id) {
      this.$router.push({ name: 'issue-detail', params: { issueId: id }})
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
    isRelationIssueLoading(row) {
      if (row.family && !row.hasOwnProperty('loadingRelation')) {
        this.$set(row, 'loadingRelation', false)
      }
      return row.loadingRelation
    },
    hasRelationIssue(row) {
      return row.family
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
    async getIssueFamilyData(row, expandedRows) {
      if (expandedRows.find((item) => (item.id === row.id))) {
        try {
          await this.$set(row, 'loadingRelation', true)
          const family = await getIssueFamily(row.id)
          const data = family.data
          if (data.hasOwnProperty('parent')) { await this.$set(row, 'parent', data.parent) }
          if (data.hasOwnProperty('children')) { await this.$set(row, 'children', data.children) }
          await this.$set(row, 'loadingRelation', false)
        } catch (e) {
        //   null
        }
      }
    },
    handleQuickAddClose() {
      this.quickAddTopicDialogVisible = !this.quickAddTopicDialogVisible
    },
    updateData() {
      this.resetFilterVersionTrackerData()
      const trackOpt = {
        keys: ['tracker.name'],
        useExtendedSearch: true
      }
      if (this.trackerValue.length > 0) {
        this.searchIssueList(this.trackerValue, trackOpt)
      } else {
        this.listFilterTrackerData = []
      }
    },
    searchIssueList(value, opt) {
      const fuse = new Fuse(this.listData, opt)
      let search = `="${value}"`
      if (Array.isArray(value) && value.length >= 1) {
        search = { $or: value.map((item) => ({ $path: [opt['keys'][0]], $val: `="${item.name}"` })) }
      }
      const res = fuse.search(search)
      this.listFilterTrackerData = res.map(items => items.item)
    },
    resetFilterVersionTrackerData() {
      this.listFilterTrackerData = this.listData
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
      if (!visible) {
        this.$refs['quickAddIssue'].form.subject = ''
      }
    },
    async saveIssue(data) {
      return await addIssue(data)
        .then(res => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.loadData()
          this.addTopicDialogVisible = false
          return res
        })
        .catch(error => {
          return error
        })
    },
    handleSelectionChange(list) {
      this.selectedProjectList = list
    },
    async removeIssueRelation(child_issue_id) {
      console.log(child_issue_id)
      this.listLoading = true
      try {
        await updateIssue(child_issue_id, { parent_id: '' })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
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
    },
    downloadCsv(selectedProjectList) {
      const selectedColumn = this.handleCsvSelectedColumn(selectedProjectList)
      const translateTable = this.handleCsvTranslateTable(selectedColumn)
      const jsonToCsvParser = new Parser()
      const attr = 'data:text/csv;charset=utf-8,'
      const csvContent = `${attr} ${jsonToCsvParser.parse(translateTable)}`
      const encodeUri = encodeURI(csvContent)
      const time = new Date()
      const timeNow = time.toLocaleDateString()
      const a = document.createElement('a')
      const url = encodeUri
      const filename = `exception_${timeNow}.csv`
      a.href = url
      a.download = filename
      a.click()
    },
    handleCsvSelectedColumn(selectedProjectList) {
      const selectedColumn = []
      selectedProjectList.forEach(item => {
        const targetObject = {}
        this.csvColumnSelected.map(itemSelected => {
          if (itemSelected === 'status') this.$set(targetObject, itemSelected, this.getStatusTagType(item.status.name))
          else if (itemSelected === 'priority') this.$set(targetObject, itemSelected, this.getPriorityTagType(item.priority.name))
          else if (itemSelected === 'tracker') this.$set(targetObject, itemSelected, this.getCategoryTagType(item.tracker.name))
          else if (itemSelected === 'assigned_to') this.$set(targetObject, itemSelected, item.assigned_to.name ? `${item.assigned_to.name}(${item.assigned_to.login})` : '')
          else this.$set(targetObject, itemSelected, item[itemSelected])
        })
        selectedColumn.push(targetObject)
      })
      return selectedColumn
    },
    handleCsvTranslateTable(selectedColumn) {
      const translateTable = []
      selectedColumn.forEach(item => {
        const chineseCsv = {}
        const chineseColumnKey = Object.keys(item).map(key => {
          key = csvTranslate.exceptionManagement[key]
          return key
        })
        Object.values(item).map((val, index) => {
          this.$set(chineseCsv, chineseColumnKey[index], val)
        })
        translateTable.push(chineseCsv)
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
      if (category === 'Fail Management') return '異常管理'
    }
  }
}
</script>

<style lang="scss" scoped>
.status-bar-track {
  background: #f5f5f5;
  border-radius: 5px;
  max-width: 160px;
  width: 100%;
  height: 4px;
  position: relative;
  margin-bottom: 3px;
  margin-left: 5px;
  display: inline-block;
}

.status-bar {
  position: absolute;
  left: 0;
  top: 0;
  background: #3ecbbc;
  height: 4px;
}

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
