<template>
  <div class="app-container">
    <div class="clearfix">
      <div>
        <project-list-selector />
        <el-button
          id="btn-add-issue"
          type="success"
          icon="el-icon-plus"
          :disabled="selectedProjectId === -1"
          class="text-left"
          @click="handleQuickAddClose"
        >
          {{ $t('Issue.AddIssue') }}
        </el-button>
        <div class="text-right float-right w-1/2">
          <el-popover
            placement="bottom"
            trigger="click"
          >
            <el-form>
              <template v-for="dimension in filterOptions">
                <el-form-item :key="dimension.id" :label="dimension.label">
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
                      :label="$te('Issue.'+item.name)?$t('Issue.'+item.name):item.name"
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
        </div>
      </div>
    </div>
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
    >
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
                  <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">{{ $t('Issue.Unlink') }}</el-button>
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
    <add-issue
      :save-data="saveIssue"
      :dialog-visible.sync="addTopicDialogVisible"
      :project-id="selectedProjectId"
      :parent-id="parentId"
      :parent-name="parentName"
      :prefill="form"
      @add-topic-visible="emitAddTopicDialogVisible"
    />
  </div>
</template>

<script>
import AddIssue from './components/AddIssue'
import { mapActions, mapGetters } from 'vuex'
import { addIssue, getIssueFamily, getIssuePriority, getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
import { getProjectIssueList, getProjectUserList, getProjectVersion } from '@/api/projects'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import QuickAddIssue from './components/QuickAddIssue'
import ProjectListSelector from '@/components/ProjectListSelector'
import axios from 'axios'
import { BasicData, Table, Pagination } from '@/newMixins'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ProjectIssues',
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
      rowHeight: 57,
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,
      search: '',
      parentId: 0,
      parentName: '',
      fixed_version: [],
      tracker: [],
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
      lastIssueListCancelToken: null
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'issueListFilter', 'issueListKeyword']),
    filterOptions() {
      return [
        { id: 1, label: this.$t('Issue.FilterDimensions.status'), value: 'status', placeholder: 'Status', tag: true },
        { id: 2, label: this.$t('Issue.FilterDimensions.tracker'), value: 'tracker', placeholder: 'Type', tag: true },
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
            result.push((this.$te('Issue.' + value.name)) ? this.$t('Issue.' + value.name) : value.name)
          }
        }
      })
      return this.$t('general.Filter') + ((result.length > 0) ? ': ' : '') + result.join(', ')
    },
    isFilterChanged() {
      for (const item of Object.keys(this.filterValue)) {
        if (this.originFilterValue[item] !== this.filterValue[item]) {
          return true
        }
      }
      return !!this.keyword
    }
  },
  watch: {
    selectedProjectId() {
      this.loadSelectionList()
      this.loadData()
    },
    filterValue: {
      deep: true,
      handler() {
        this.listQuery.offset = 0
        this.onChangeFilter()
      }
    }
  },
  async created() {
    this.filterValue = this.issueListFilter
    this.keyword = this.issueListKeyword
    await this.loadSelectionList()
    await this.loadData()
  },
  methods: {
    ...mapActions('projects', ['setIssueListKeyword', 'setIssueListFilter']),
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
        limit: this.listQuery.limit
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
          console.log('change filter')
        }
        const cancelTokenSource = axios.CancelToken.source()
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
    sortByDueDate(a, b) {
      return new Date(a.due_date) - new Date(b.due_date)
    },
    async loadSelectionList() {
      await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getProjectVersion(this.selectedProjectId),
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority()
      ]).then(res => {
        const [assigneeList, versionList, typeList, statusList, priorityList] = res.map(
          item => item.data
        )
        this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.versions]
        // const version = this.fixed_version.sort(this.sortByDueDate).filter((item) => ((new Date(item.due_date) >= new Date()) && item.status === 'open'))
        // if (version.length > 0) {
        //   this.$set(this.filterValue, 'fixed_version', version[0].id)
        //   this.$set(this.originFilterValue, 'fixed_version', version[0].id)
        // }

        this.tracker = typeList
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
    onChangeFilter() {
      this.listQuery.page = 1
      this.setIssueListFilter(this.filterValue)
      this.setIssueListKeyword(this.keyword)
      this.loadData()
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
      this.setIssueListFilter(this.filterValue)
      this.setIssueListKeyword(this.keyword)
      this.onChangeFilter()
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
