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

      filterOptions: Object.freeze([
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
      ]),

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
      Object.keys(value).forEach((item) => {
        this[item] = value[item]
      })
      if (this.filterValue['tags'] && this.filterValue['tags'].length <= 0) {
        this.$delete(this.filterValue, 'tags')
      }
      await this.onChangeFilter()
    },
    async onChangeFilter() {
      await this.backToFirstPage()
      // await this.loadData()
    },
    getParams() {
      const result = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit
      }
      this.isSetParams(result, 'sort')
      if (!this.displayClosed) {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterValue).forEach((item) => {
        this.isSetFilterValueParams(result, item, `${item}_id`)
      })
      this.isSetParams(result, 'keyword', 'search')
      return result
    },
    isSetParams(result, key, resultKey) {
      if (!resultKey) resultKey = key
      if (this[key]) result[resultKey] = this[key]
    },
    isSetFilterValueParams(result, key, resultKey) {
      if (!resultKey) resultKey = key
      if (this.filterValue[key]) result[resultKey] = this.filterValue[key]
    },
    async fetchData() {
      console.log('fetchData => fetchData')
      let listData
      try {
        await this.checkLastRequest()
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        const res = await getProjectIssueList(this.selectedProjectId, this.getParams(), {
          cancelToken: cancelTokenSource.token
        })
        listData = res.data.issue_list
        this.setPageInfoWhenFetchData(res)
        await this.checkExpandedRowWhenFetchData(listData)
      } catch (e) {
        // null
      }
      this.lastIssueListCancelToken = null
      console.log(listData)
      return listData
    },
    checkLastRequest() {
      if (this.lastIssueListCancelToken && this.listLoading) {
        this.lastIssueListCancelToken.cancel()
      }
    },
    setPageInfoWhenFetchData(res) {
      this.totalData = res.data.page.total
      if (res.data.hasOwnProperty('page')) {
        this.pageInfo = res.data.page
      } else {
        this.pageInfo = {
          total: 0
        }
      }
    },
    async checkExpandedRowWhenFetchData(listData) {
      if (this.expandedRow.length > 0) {
        for (const row of this.expandedRow) {
          const getIssue = listData.find((item) => item.id === row.id)
          await this.getIssueFamilyData(getIssue, this.expandedRow)
        }
      }
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
      await Promise.all([getProjectUserList(this.selectedProjectId), getTagsByProject(this.selectedProjectId)]).then(
        (res) => {
          const [assigneeList, tagsList] = res.map((item) => item.data)
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
          this.setInitAssignedToForRD()
        }
      )
      await this.loadVersionList(this.fixed_version_closed)
    },
    setInitAssignedToForRD() {
      if (this.userRole === 'Engineer') {
        this.$set(this.filterValue, 'assigned_to', this.userId)
        this.$set(this.originFilterValue, 'assigned_to', this.userId)
      }
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      if (item.hasOwnProperty('login')) {
        result += ' (' + item.login + ')'
      }
      return result
    },
    async getIssueFamilyData(row, expandedRows) {
      this.expandedRow = expandedRows
      if (expandedRows.find((item) => item.id === row.id)) {
        try {
          await this.$set(row, 'isLoadingFamily', true)
          const family = await getIssueFamily(row.id)
          const data = family.data
          this.formatIssueFamilyData(row, data)
          this.$set(row, 'isLoadingFamily', false)
        } catch (e) {
          //   null
          return Promise.resolve()
        }
      }
      return Promise.resolve()
    },
    formatIssueFamilyData(row, data) {
      if (data.hasOwnProperty('parent')) {
        this.$set(row, 'parent', data.parent)
      }
      if (data.hasOwnProperty('children')) {
        this.$set(row, 'children', data.children)
      }
      if (data.hasOwnProperty('relations')) {
        this.$set(row, 'relations', data.relations)
      }
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => item.is_closed === false)
    },
    handleClick(row, column) {
      if (column.type === 'action') {
        return false
      }
      if (column.type === 'expand' && this.hasRelationIssue(row)) {
        return this.refTable.toggleRowExpansion(row)
      }
      this.$router.push({ name: 'issue-detail', params: { issueId: row.id }})
    },
    handleEdit(id) {
      this.$router.push({ name: 'issue-detail', params: { issueId: id }})
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
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
      if (order === 'descending') {
        return 'desc'
      }
      if (order === 'ascending') {
        return 'asc'
      }
      return false
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
      this.listQuery.limit = val.limit
      const offset = this.pageInfo.offset + (val.page - this.listQuery.page) * val.limit
      this.listQuery.offset = this.setPageOffset(val, offset)
      if (val.page) {
        this.listQuery.page = val.page
      } else {
        const page = (this.listQuery.offset + 1) / this.listQuery.limit
        this.listQuery.page = page > 0 ? Math.ceil(page) : 1
      }
      this.$router.push({ query: { offset: this.listQuery.offset }})
      await this.loadData()
      this.listLoading = false
    },
    setPageOffset(val, offset) {
      if (val.init >= 0) {
        return val.init
      }
      if (offset <= 0 || val.page === 1) {
        return 0
      }
      if (offset >= this.pageInfo.total || val.page >= val.totalPage) {
        return this.pageInfo.total - val.limit
      }
      return offset
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = ''
      this.displayClosed = false
      // this.onChangeFilter()
    },
    backToFirstPage() {
      this.listQuery.page = 1
      this.listQuery.offset = 0
    },
    handleSelectionChange(list) {
      this.selectedIssueList = list
    },
    onChangeFixedVersionStatus(value) {
      this.fixed_version_closed = value
    },
    getInitPage() {
      const getOffset = this.$route.query.offset
      if (getOffset && parseInt(getOffset)) {
        this.pageInfo.total = Infinity
        this.handleCurrentChange({ init: parseInt(getOffset) })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
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

>>> .row-expend-loading .el-table__expand-column .cell {
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
