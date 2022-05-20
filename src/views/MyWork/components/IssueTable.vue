<template>
  <div>
    <el-row
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
    >
      <el-table
        ref="issueList"
        :data="listData"
        highlight-current-row
        row-key="id"
        :tree-props="{ children: 'child' }"
        :row-class-name="getRowClass"
        @row-contextmenu="handleContextMenu"
        @cell-click="handleCellClick"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
      >
        <el-table-column type="expand">
          <template slot-scope="{row}">
            <ExpandSection
              :issue="row"
              @update-list="fetchData"
              @on-context-menu="onContextMenu"
              @collapse-expend-row="collapseExpendRow"
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
          :label="$t('Project.Name')"
          min-width="150"
          show-overflow-tooltip
          prop="project"
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.project.display }}
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
          v-if="from === 'author_id'"
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
          v-if="from === 'assigned_to_id'"
          align="center"
          :label="$t('Issue.Author')"
          min-width="180"
          prop="author"
          sortable="custom"
          show-overflow-tooltip
        >
          <template
            v-if="scope.row.author"
            slot-scope="scope"
          >
            <span>{{ scope.row.author.name }}</span>
            <span v-if="scope.row.author.login">({{ scope.row.author.login }})</span>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty
            :description="$t('general.NoData')"
            :image-size="100"
          />
        </template>
      </el-table>
      <Pagination
        ref="pagination"
        :total="listQuery.total"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[10, 25, 50, 100]"
        :layout="'total, sizes, prev, pager, next'"
        @pagination="handlePaginationChange"
      />
    </el-row>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update="updateAllIssueTables"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ContextMenu, Pagination, CancelRequest } from '@/newMixins'
import { getUserIssueList } from '@/api/user'
import { getIssueFamily } from '@/api/issue'
import { Status, Tracker, Priority, ExpandSection } from '@/components/Issue'

export default {
  name: 'MyWorkIssueTable',
  components: { Status, Tracker, Priority, ExpandSection },
  mixins: [ContextMenu, Pagination, CancelRequest],
  props: {
    from: {
      type: String,
      default: 'assigned_to'
    },
    projectId: {
      type: [String, Number],
      default: ''
    },
    filterConditionsProps: {
      type: Object,
      default: () => ({})
    },
    displayClosedProps: {
      type: Boolean,
      default: false
    },
    keywordProps: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      listLoading: false,
      listData: [],
      sort: '',
      expandedRow: []
    }
  },
  computed: {
    ...mapGetters(['userId']),
    refTable() {
      return this.$refs['issueList']
    },
    dynamicParams() {
      return {
        projectId: this.projectId,
        filterConditions: this.filterConditionsProps,
        displayClosed: this.displayClosedProps,
        keyword: this.keywordProps
      }
    }
  },
  watch: {
    dynamicParams: {
      handler() {
        this.fetchData()
      },
      deep: true
    },
    'listQuery.total'(value) {
      this.$emit('total', value)
    }
  },

  mounted() {
    this.getStoredListQuery()
  },
  methods: {
    ...mapActions('projects', ['setFixedVersionShowClosed', 'getListQuery', 'setListQuery']),
    async getStoredListQuery() {
      const storeListQuery = await this.getListQuery()
      const storedTabQuery = storeListQuery[`MyWork_${this.from}`]
      if (storedTabQuery !== undefined) {
        this.listQuery = storedTabQuery
        this.fetchData()
      } else {
        this.fetchData()
      }
      return Promise.resolve()
    },
    async fetchData() {
      if (this.listLoading) {
        this.cancelRequest()
      }
      this.listLoading = true
      await getUserIssueList(this.userId, this.getParams(), { cancelToken: this.cancelToken })
        .then((res) => {
          this.listData = res.data.issue_list
          this.setNewListQuery(res.data.page)
          this.listLoading = false
        })
        .catch(() => {
          // console.log(err)
        })
      await this.setExpandedRow()
    },
    getParams() {
      const result = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit,
        from: this.from
      }
      if (this.projectId && this.projectId !== '') {
        result['project_id'] = this.projectId
      }
      if (this.sort) {
        result['sort'] = this.sort
      }
      if (!this.displayClosedProps) {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterConditionsProps).forEach((item) => {
        if (this.filterConditionsProps[item]) {
          result[item + '_id'] = this.filterConditionsProps[item]
        }
      })
      if (this.keywordProps) {
        result['search'] = this.keywordProps
      }
      return result
    },
    setNewListQuery(pageInfo) {
      const { offset, limit, current, total, pages } = pageInfo
      if (pages !== 0 && current > pages) {
        this.resetListQuery()
      } else {
        this.listQuery = { offset, limit, total, page: current }
      }
    },
    async setExpandedRow() {
      if (this.expandedRow.length > 0) {
        for (const row of this.expandedRow) {
          const getIssue = this.listData.find((item) => item.id === row.id)
          await this.getIssueFamilyData(getIssue, this.expandedRow)
        }
      }
    },
    handleSortChange({ prop, order }) {
      const orderBy = this.checkOrder(order)
      this.sort = orderBy ? `${prop}:${orderBy}` : orderBy
      this.fetchData()
    },
    checkOrder(order) {
      const orderMap = {
        ascending: 'asc',
        descending: 'desc'
      }
      return orderMap[order] || false
    },
    async handlePaginationChange(val) {
      this.listQuery.offset = val.limit * val.page - val.limit
      this.listQuery.limit = val.limit
      this.listQuery.page = val.page
      await this.fetchData()
      const storeListQuery = await this.getListQuery()
      storeListQuery[`MyWork_${this.from}`] = this.listQuery
      await this.setListQuery(storeListQuery)
    },
    async resetListQuery() {
      this.listQuery.offset = 0
      this.listQuery.page = 1
      const storeListQuery = await this.getListQuery()
      storeListQuery[`MyWork_${this.from}`] = this.listQuery
      await this.setListQuery(storeListQuery)
      await this.fetchData()
    },
    getRowClass({ row }) {
      const result = []
      if (!this.hasRelationIssue(row)) {
        result.push('hide-expand-icon')
        // if (this.refTable) {
        //   this.checkRowExpended(this.refTable, row)
        // }
      }
      this.contextMenu ? result.push('context-menu') : result.push('cursor-pointer')
      return result.join(' ')
    },
    handleCellClick(row, column) {
      if (column.type === 'action') {
        return false
      }
      if (column.type === 'expand' && this.hasRelationIssue(row)) {
        return this.refTable.toggleRowExpansion(row)
      }
      this.$router.push({ name: 'issue-detail', params: { issueId: row.id, project: row.project }})
    },
    async getIssueFamilyData(row, expandedRows) {
      this.expandedRow = expandedRows
      if (expandedRows.find((item) => item.id === row.id)) {
        try {
          this.$set(row, 'isLoadingFamily', true)
          const family = await getIssueFamily(row.id)
          const data = family.data
          this.formatIssueFamilyData(row, data)
          this.$set(row, 'isLoadingFamily', false)
        } catch (e) {
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
    updateAllIssueTables(assignedToId) {
      this.$emit('update', assignedToId)
    },
    hasRelationIssue(row) {
      return row.family
    },
    collapseExpendRow(issueId) {
      const row = this.listData.find((item) => item.id === issueId)
      this.$refs.issueList.toggleRowExpansion(row, false)
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
