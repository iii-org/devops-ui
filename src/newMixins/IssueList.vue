<script>
import { Priority, Status, Tracker } from '@/components/Issue'
import { BasicData, Pagination } from '@/newMixins/index'
import { mapActions, mapGetters } from 'vuex'
import axios from 'axios'
import { getProjectIssueList, getProjectUserList, getProjectVersion, getTagsByProject } from '@/api/projects'
import { addIssue, getIssueFamily } from '@/api/issue'

export default {
  components: {
    Priority,
    Status,
    Tracker
  },
  mixins: [BasicData, Pagination],
  data() {
    return {
      remote: true,

      fixed_version_closed: false,
      displayClosed: false,

      search: '',
      sort: '',
      parentId: 0,
      parentName: '',

      filterValue: {},
      originFilterValue: {},

      quickChangeDialogVisible: false,
      quickChangeForm: {},

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
      lastIssueListCancelToken: null,
      expandedRow: [],
      totalData: 100
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
        { id: 2, label: this.$t('Issue.FilterDimensions.tags'), value: 'tags', placeholder: 'Tag' },
        { id: 3, label: this.$t('Issue.FilterDimensions.tracker'), value: 'tracker', placeholder: 'Type', tag: true },
        { id: 4, label: this.$t('Issue.FilterDimensions.assigned_to'), value: 'assigned_to', placeholder: 'Member' },
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
      ]
    },
    listFilter() {
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
    },
    isFilterChanged() {
      for (const item of Object.keys(this.originFilterValue)) {
        const checkFilterValue = this.originFilterValue
        if (checkFilterValue[item] === '') {
          delete checkFilterValue[item]
        }
        if (this.filterValue[item] !== checkFilterValue[item]) {
          return true
        }
      }
      for (const item of Object.keys(this.filterValue)) {
        const checkFilterValue = this.filterValue
        if (checkFilterValue[item] === '') {
          delete checkFilterValue[item]
        }
        if (this.originFilterValue[item] !== checkFilterValue[item]) {
          return true
        }
      }
      return !!this.keyword
    }
  },
  watch: {
    async selectedProjectId() {
      await this.loadSelectionList()
      await this.cleanFilter()
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    }
  },
  methods: {
    ...mapActions('projects', ['setFixedVersionShowClosed']),
    async onChangeFilterForm(value) {
      Object.keys(value).forEach(item => {
        this[item] = value[item]
      })
      if (this.filterValue['tags'] && this.filterValue['tags'].length <= 0) {
        this.$delete(this.filterValue, 'tags')
      }
      await this.onChangeFilter()
    },
    async onChangeFilter() {
      await this.backToFirstPage()
      await this.loadData()
    },
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
    async fetchData() {
      let data
      try {
        // const params = await
        if (this.lastIssueListCancelToken && this.listLoading) {
          this.lastIssueListCancelToken.cancel()
        }
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        const listData = await getProjectIssueList(this.selectedProjectId, this.getParams(), { cancelToken: cancelTokenSource.token })
        data = listData.data.issue_list
        this.totalData = listData.data.page.total
        if (listData.data.hasOwnProperty('page')) {
          this.pageInfo = listData.data.page
        } else {
          this.pageInfo = {
            total: 0
          }
        }
        if (this.expandedRow.length > 0) {
          for (const row of this.expandedRow) {
            const getIssue = data.find((item) => (item.id === row.id))
            await this.getIssueFamilyData(getIssue, this.expandedRow)
          }
        }
        // TODO: RememberPageProblem
        // await this.setIssueListListQuery(this.listQuery)
        // await this.setIssueListPageInfo(this.pageInfo)
      } catch (e) {
        // null
      }
      this.lastIssueListCancelToken = null
      return data
    },
    getOptionsData(option_name) {
      return this[option_name]
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    async loadSelectionList() {
      if (this.selectedProjectId === -1) return
      await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getTagsByProject(this.selectedProjectId)
      ]).then(res => {
        const [assigneeList, tagsList] = res.map(
          item => item.data
        )
        this.tags = tagsList.tags
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
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      if (item.hasOwnProperty('login')) {
        result += ' (' + (item.login) + ')'
      }
      return result
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
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    handleClick(row, column) {
      if (column.type === 'action') {
        return false
      } else if (column.type === 'expand' && this.hasRelationIssue(row)) {
        this.refTable.toggleRowExpansion(row)
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
    hasRelationIssue(row) {
      return row.family
    },
    handleQuickAddClose() {
      this.quickAddTopicDialogVisible = !this.quickAddTopicDialogVisible
      if (this.tableHeight) {
        if (this.quickAddTopicDialogVisible) {
          this.tableHeight = this.tableHeight - 62
        } else {
          this.tableHeight = this.tableHeight + 62
        }
      }
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
      if (!this.hasRelationIssue(row)) {
        result.push('hide-expand-icon')
        const getRefTable = this.refTable
        if (getRefTable) {
          this.checkRowExpended(getRefTable, row)
        }
      }
      if (this.contextMenu) {
        result.push('context-menu')
      } else {
        result.push('cursor-pointer')
      }
      return result.join(' ')
    },
    checkRowExpended(getRefTable, row) {
      const getExpanded = this.expandedRow
      if (Array.isArray(getExpanded) && getExpanded.length > 0) {
        const getRow = getExpanded.find((item) => item.id === row.id)
        if (getRow) {
          this.toggleExpandedRows(getRow, getExpanded)
          getRefTable.toggleRowExpansion(getRow, getExpanded)
        }
      }
    },
    toggleExpandedRows(row, expandedRows) {
      this.expandedRow = expandedRows
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
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = ''
      this.displayClosed = false
      this.onChangeFilter()
    },
    backToFirstPage() {
      this.listQuery.page = 1
      this.listQuery.offset = 0
    },
    handleSelectionChange(list) {
      this.selectedIssueList = list
    },
    onChangeFixedVersionStatus(value) {
      console.log(value)
      this.fixed_version_closed = value
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
}

> > > .el-table__body-wrapper {
  overflow-y: auto;
}

> > > .hide-expand-icon .el-table__expand-column .cell {
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
