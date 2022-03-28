<template>
  <div class="app-container">
    <div class="clearfix">
      <div>
        <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous" @click="handleBackPage">
          {{ $t('general.Back') }}
        </el-button>
        <div class="text-right float-right w-1/2">
          <el-popover
            placement="bottom"
            trigger="click"
          >
            <el-form v-loading="listLoading">
              <template v-for="dimension in filterOptions">
                <el-form-item :key="dimension.id">
                  <div slot="label">
                    {{ $t('Issue.'+dimension.value) }}
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
                      v-for="item in (dimension.value==='status')? filterClosedStatus($data[dimension.value]):$data[dimension.value]"
                      :key="item.id"
                      :label="getSelectionLabel(item)"
                      :value="item.id"
                    >
                      <component :is="dimension.value" v-if="dimension.tag" :name="$t(`Issue.${item.name}`)" :type="item.name" />
                    </el-option>
                  </el-select>
                </el-form-item>
              </template>
              <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">
                <el-checkbox v-model="displayClosed" @change="onChangeFilter" />
              </el-form-item>
            </el-form>
            <el-button slot="reference" icon="el-icon-s-operation" type="text" disabled style="color: #409eff;"> {{ displayFilterValue }}
            </el-button>
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
        </div>
      </div>
    </div>
    <el-divider />
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
        :tree-props="{ children: 'child' }"
        :row-class-name="getRowClass"
        @cell-click="handleClick"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
      >
        <el-table-column type="expand" class-name="informationExpand">
          <template slot-scope="{row}">
            <ExpandSection
              :issue="row"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Type')" width="130" prop="tracker" sortable="custom">
          <template slot-scope="{row}">
            <Tracker v-if="row.tracker.name" :name="$t(`Issue.${row.tracker.name}`)" :type="row.tracker.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('Issue.Id')" min-width="280" show-overflow-tooltip prop="id" sortable="custom">
          <template slot-scope="scope">
            <span class="text-success mr-2">#{{ scope.row.id }}</span>
            <el-tag v-for="item in scope.row.tags" :key="item.id" size="mini" class="mr-1">[{{ item.name }}]</el-tag>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Priority')" width="150" prop="priority" sortable="custom">
          <template slot-scope="{row}">
            <Priority v-if="row.priority.name" :name="$t(`Issue.${row.priority.name}`)" :type="row.priority.name" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Status')" width="150" prop="status" sortable="custom">
          <template slot-scope="{row}">
            <Status
              v-if="row.status.name"
              :name="$t(`Issue.${row.status.name}`)" :type="row.status.name"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180" prop="assigned_to" sortable="custom">
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
import { addIssue, getIssueFamily, getIssuePriority, getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
import { getProjectIssueList, getProjectUserList, getProjectVersion } from '@/api/projects'
import { Status, Priority, Tracker, ExpandSection } from '@/components/Issue'
import ProjectListSelector from '@/components/ProjectListSelector'
import axios from 'axios'
import { BasicData, Table, Pagination } from '@/newMixins'
import ContextMenu from '@/components/Issue/ContextMenu'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ClosedIssueList',
  components: {
    ContextMenu,
    Priority,
    Status,
    Tracker,
    ProjectListSelector,
    ExpandSection
  },
  mixins: [BasicData, Table, Pagination],
  data() {
    return {
      remote: true,
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,
      fixed_version_closed: false,
      displayClosed: true,
      contextMenu: {
        row: { fixed_version: { id: 'null' }, assigned_to: { id: 'null' }},
        visible: false,
        left: 0,
        top: 0
      },
      search: '',
      sort: '',
      parentId: 0,
      parentName: '',
      fixed_version: [],
      tracker: [],
      assigned_to: [],
      status: [],
      priority: [],
      filterOptions: Object.freeze([
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
      ]),
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
    ...mapGetters(['userRole', 'userId', 'fixedVersionShowClosed']),
    contextOptions() {
      const result = {}
      this.filterOptions.forEach((item) => {
        result[item.value] = this[item.value]
      })
      return result
    },
    displayFilterValue() {
      const result = []
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          const value = this[item].find((search) => (search.id === this.filterValue[item]))
          if (value) {
            result.push(this.getSelectionLabel(value))
          }
        }
      })
      return this.$t('general.Filter') + ((result.length > 0) ? ': ' : '') + result.join(', ')
    }
  },
  watch: {
    // selectedProjectId() {
    //   this.loadSelectionList()
    //   this.initTableData()
    // },
    // filterValue: {
    //   deep: true,
    //   handler() {
    //     // TODO: RememberPageProblem
    //     this.backToFirstPage()
    //     this.onChangeFilter()
    //   }
    // },
    fixed_version_closed(value) {
      // this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    },
    fixed_version: {
      handler(value) {
        if (value && value.length > 0) {
          this.getFixedVersionClosed()
          this.onChangeFilter()
        }
      },
      immediate: true
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
    this.fixed_version_closed = true
    await this.loadSelectionList()
  },
  // mounted() {
  //   this.getInitPage()
  // },
  methods: {
    ...mapActions('projects', ['setFixedVersionShowClosed']),
    handleBackPage() {
      this.$router.push({ name: 'release-version', params: { projectName: this.selectedProject.name }})
    },
    getFixedVersionClosed() {
      const fixed_version = this.fixed_version.filter(item => item.name === this.$route.params.issueTag)[0].id
      this.filterValue = {
        fixed_version,
        status: 6
      }
    },
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
      if (this.sort) {
        result['sort'] = this.sort
      }
      // if (!this.displayClosed) {
      //   result['status_id'] = 'open'
      // }
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
        }
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        if (!this.getParams().fixed_version_id) return []
        const listData = await getProjectIssueList(this.selectedProjectId, this.getParams(), { cancelToken: cancelTokenSource.token })
        data = listData.data.issue_list
        if (listData.data.hasOwnProperty('page')) {
          this.pageInfo = listData.data.page
        } else {
          this.pageInfo = {
            total: 0
          }
        }
        // TODO: RememberPageProblem
        // await this.setIssueListListQuery(this.listQuery)
        // await this.setIssueListPageInfo(this.pageInfo)
      } catch (e) {
        // null
      }
      return data
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    async loadSelectionList() {
      await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority()
      ]).then(res => {
        const [assigneeList, typeList, statusList, priorityList] = res.map(
          item => item.data
        )
        this.tracker = typeList
        this.assigned_to = [
          { name: this.$t('Issue.Unassigned'), id: 'null' },
          ...assigneeList.user_list
        ]
        this.status = statusList
        this.priority = priorityList
        // if (this.userRole === 'Engineer') {
        //   this.$set(this.filterValue, 'assigned_to', this.userId)
        //   this.$set(this.originFilterValue, 'assigned_to', this.userId)
        // }
      })
      await this.loadVersionList(this.fixed_version_closed)
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    async getIssueFamilyData(row, expandedRows) {
      if (expandedRows.find((item) => (item.id === row.id))) {
        try {
          this.$set(row, 'isLoadingFamily', true)
          const family = await getIssueFamily(row.id, { relation: true })
          const data = family.data
          if (data.hasOwnProperty('parent')) { await this.$set(row, 'parent', data.parent) }
          if (data.hasOwnProperty('children')) { await this.$set(row, 'children', data.children) }
          if (data.hasOwnProperty('relations')) { await this.$set(row, 'relations', data.relations) }
          this.$set(row, 'isLoadingFamily', false)
        } catch (e) {
        //   null
        }
      }
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    onChangeFilter() {
      this.initTableData()
    },
    handleClick(row, column) {
      if (column.type === 'expand' && this.isRelationIssueLoading(row)) {
        this.$refs['issueList'].toggleRowExpansion(row)
      } else if (column.type === 'expand' && this.hasRelationIssue(row)) {
        this.$refs['issueList'].toggleRowExpansion(row)
      } else {
        this.$router.push({ name: 'issue-detail', params: { issueId: row.id, disableButton: true }})
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
          this.backToFirstPage()
          this.loadData()
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.name = ''
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
      switch (order) {
        case 'descending':
          return 'desc'
        case 'ascending':
          return 'asc'
        case null:
          return false
      }
    },
    getRowClass({ row }) {
      const result = []
      if (this.isRelationIssueLoading(row)) {
        result.push('row-expend-loading')
      } else if (this.hasRelationIssue(row) === false) {
        result.push('row-expand-cover')
      }
      result.push('context-menu')
      return result.join(' ')
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    async handleCurrentChange(val) {
      this.listLoading = true
      const offset = this.pageInfo.offset + ((val.page - this.listQuery.page) * val.limit)
      if (offset <= 0 || val.page === 1) {
        this.listQuery.offset = 0
      } else if (offset >= this.pageInfo.total || val.page >= val.totalPage) {
        this.listQuery.offset = this.pageInfo.total - val.limit
      } else {
        this.listQuery.offset = offset
      }
      this.listQuery.page = val.page
      await this.loadData()
      this.listLoading = false
    },
    backToFirstPage() {
      this.listQuery.page = 1
      this.listQuery.offset = 0
    },
    removeIssueRelation(child_issue_id) {
      this.listLoading = true
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
          this.listLoading = false
        })
    }
    // handleContextMenu(row, column, event) {
    //   event.preventDefault()
    //   const eventX = event.pageX
    //   const eventY = event.pageY
    //   this.$refs.contextmenu.$refs.contextmenu.show()
    //   this.$nextTick(() => {
    //     const contextmenuPosition = {
    //       top: eventY,
    //       left: eventX
    //     }
    //     const contextmenuWidth = this.$refs.contextmenu.$refs.contextmenu.$el.clientWidth
    //     const contextmenuHeight = this.$refs.contextmenu.$refs.contextmenu.$el.clientHeight
    //     if (contextmenuWidth <= 50 && contextmenuWidth <= 50) {
    //       this.handleContextMenu(row, column, event)
    //     }
    //     if (contextmenuHeight + eventY >= window.innerHeight) {
    //       contextmenuPosition.top -= contextmenuHeight
    //     }
    //     if (contextmenuWidth + eventX >= window.innerWidth) {
    //       contextmenuPosition.left -= contextmenuWidth
    //     }
    //     this.contextMenu.top = contextmenuPosition.top
    //     this.contextMenu.left = contextmenuPosition.left
    //     this.contextMenu.row = row
    //     this.contextMenu.visible = true
    //     this.$refs.contextmenu.$refs.contextmenu.style = { top: this.contextMenu.top + 'px', left: this.contextMenu.left + 'px' }
    //     document.addEventListener('click', this.hideContextMenu)
    //   })
    // },
    // hideContextMenu() {
    //   this.contextMenu.visible = false
    //   document.removeEventListener('click', this.hideContextMenu)
    // }
  }
}
</script>

<style lang="scss" scoped>
>>> .row-expand-cover .el-table__expand-column .cell {
  display: none;
}

>>> .el-table__expanded-cell {
  font-size: 0.875em;
  padding-top: 10px;
  padding-bottom: 10px;
}

>>> .row-expend-loading .el-table__expand-column .cell {
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

>>> .context-menu {
  cursor: context-menu;
}
</style>
