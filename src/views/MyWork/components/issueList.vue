<template>
  <div>
    <el-row v-loading="listLoading"
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
        @cell-click="handleClick"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
      >
        <el-table-column type="expand" class-name="informationExpand">
          <template slot-scope="scope">
            <ExpandSection :issue="scope.row" @updateListData="loadData" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Type')" width="130" prop="tracker" sortable="custom">
          <template slot-scope="scope">
            <tracker v-if="scope.row.tracker.name" :name="scope.row.tracker.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('Project.Name')" min-width="150" show-overflow-tooltip prop="project"
                         sortable="custom"
        >
          <template slot-scope="scope">
            {{ scope.row.project.display }}
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
        <el-table-column v-if="from==='author_id'" align="center" :label="$t('Issue.Assignee')" min-width="180"
                         prop="assigned_to" sortable="custom" show-overflow-tooltip
        >
          <template v-if="scope.row.assigned_to" slot-scope="scope">
            <span>{{ scope.row.assigned_to.name }}</span>
            <span v-if="scope.row.assigned_to.login">({{ scope.row.assigned_to.login }})</span>
          </template>
        </el-table-column>
        <el-table-column v-if="from==='assigned_to_id'" align="center" :label="$t('Issue.Author')" min-width="180"
                         prop="author" sortable="custom" show-overflow-tooltip
        >
          <template v-if="scope.row.author" slot-scope="scope">
            <span>{{ scope.row.author.name }}</span>
            <span v-if="scope.row.author.login">({{ scope.row.author.login }})</span>
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
import axios from 'axios'
import { IssueList, ContextMenu } from '@/newMixins'
import { ExpandSection } from '@/components/Issue'
import { getUserIssueList } from '@/api/user'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ProjectIssues',
  components: { ExpandSection },
  mixins: [IssueList, ContextMenu],
  props: {
    from: {
      type: String,
      default: 'assigned_to'
    },
    filterValueProps: {
      type: Object,
      default: () => {
      }
    },
    projectId: {
      type: [String, Number],
      default: null
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
      remote: true,
      searchVisible: false,

      quickChangeDialogVisible: false,
      quickChangeForm: {},
      form: {},

      listQuery: {
        offset: 0,
        page: 1,
        limit: 5
      }
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'fixedVersionShowClosed']),
    refTable() {
      return this.$refs['issueList']
    }
  },
  watch: {
    async keyword() {
      await this.onChangeFilter()
    },
    async projectId() {
      await this.onChangeFilter()
    },
    filterValueProps: {
      deep: true,
      immediate: false,
      async handler(value) {
        this.filterValue = value
        await this.onChangeFilter()
      }
    },
    displayClosedProps(value) {
      this.displayClosed = value
    },
    keywordProps(value) {
      this.keyword = value
    },
    async displayClosed() {
      await this.onChangeFilter()
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    },
    'pageInfo.total'(value) {
      this.$emit('total', value)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    ...mapActions('projects', ['setFixedVersionShowClosed']),
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
        const listData = await getUserIssueList(this.userId, this.getParams(), { cancelToken: cancelTokenSource.token })
        data = listData.data.issue_list
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
