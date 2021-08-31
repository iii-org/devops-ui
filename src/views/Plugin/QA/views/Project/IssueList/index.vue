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
        @change-filter="onChangeFilter"
      />
    </project-list-selector>
    <el-divider />
    <quick-add-issue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      @add-issue="advancedAddIssue"
    />
    <el-row v-loading="listLoading"
            :element-loading-text="$t('Loading')"
    >
      <el-table
        ref="issueList"
        :data="listData"
        fit
        highlight-current-row
        row-key="id"
        height="60vh"
        :row-class-name="getRowClass"
        @row-contextmenu="handleContextMenu"
        @cell-click="handleClick"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" reserve-selection width="55" />
        <el-table-column type="expand" class-name="informationExpand">
          <template slot-scope="scope">
            <el-row v-if="scope.row.family"
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
import { csvTranslate } from '@/utils/csvTableTranslate'
import XLSX from 'xlsx'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'QAProjectIssueList',
  components: {
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

      assigned_to: [],
      fixed_version: [],

      form: {},

      selectedIssueList: [],
      csvColumnSelected: ['tracker', 'id', 'name', 'priority', 'status', 'assigned_to']
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'issueListFilter', 'issueListKeyword', 'issueListDisplayClosed',
      'issueListListQuery', 'issueListPageInfo', 'initIssueList', 'fixedVersionShowClosed']),
    refTable() {
      return this.$refs['issueList']
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
    this.filterValue = await this.getIssueListFilter()
    this.keyword = await this.getIssueListKeyword()
    this.displayClosed = await this.getIssueListDisplayClosed()
    await this.loadSelectionList()
  },
  methods: {
    ...mapActions('projects', ['getIssueListKeyword', 'getIssueListFilter', 'getIssueListDisplayClosed',
      'setIssueListKeyword', 'setIssueListFilter', 'setIssueListDisplayClosed', 'setFixedVersionShowClosed',
      'setIssueListListQuery', 'setIssueListPageInfo', 'setInitIssueList']),
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
    async onChangeFilter(value) {
      Object.keys(value).forEach(item => {
        this[item] = value[item]
      })
      await this.setIssueListFilter(this.filterValue)
      await this.setIssueListKeyword(this.keyword)
      await this.setIssueListDisplayClosed(this.displayClosed)
      await this.backToFirstPage()
      await this.loadData()
    },
    handleSelectionChange(list) {
      this.selectedIssueList = list
    },
    downloadCsv(selectedIssueList) {
      const selectedColumn = this.handleCsvSelectedColumn(selectedIssueList)
      const translateTable = this.handleCsvTranslateTable(selectedColumn)
      const worksheet = XLSX.utils.json_to_sheet(translateTable)
      this.$csv(worksheet, 'projectIssues')
    },
    handleCsvSelectedColumn(selectedIssueList) {
      const selectedColumn = []
      selectedIssueList.forEach(item => {
        const targetObject = {}
        this.csvColumnSelected.map(itemSelected => {
          if (itemSelected === 'status') {
            this.$set(targetObject, itemSelected, this.getStatusTagType(item.status.name))
          } else if (itemSelected === 'priority') {
            this.$set(targetObject, itemSelected, this.getPriorityTagType(item.priority.name))
          } else if (itemSelected === 'tracker') {
            this.$set(targetObject, itemSelected, this.getCategoryTagType(item.tracker.name))
          } else if (itemSelected === 'assigned_to') {
            this.$set(targetObject, itemSelected, item.assigned_to.name ? `${item.assigned_to.name}(${item.assigned_to.login})` : '')
          } else {
            this.$set(targetObject, itemSelected, item[itemSelected])
          }
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
          key = csvTranslate.projectIssues[key]
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
    }
  }
}
</script>
