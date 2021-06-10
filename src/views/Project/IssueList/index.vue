<template>
  <div class="app-container" style="overflow: auto;">
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
              <el-form-item :label="$t('Version.Version')">
                <el-select
                  v-model="filterValue.fixed_version"
                  :placeholder="$t('Version.SelectVersion')"
                  :disabled="selectedProjectId === -1"
                  filterable
                  clearable
                >
                  <el-option v-for="item in fixed_version" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.tracker')">
                <el-select
                  v-model="filterValue.tracker"
                  :placeholder="$t('Issue.SelectType')"
                  :disabled="selectedProjectId === -1"
                  filterable
                  clearable
                >
                  <el-option v-for="track in tracker" :key="track.id" :label="$t('Issue.'+track.name)"
                             :value="track.id"
                  >
                    <tracker :name="track.name" />
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.priority')">
                <el-select
                  v-model="filterValue.priority"
                  :placeholder="$t('Issue.SelectPriority')"
                  :disabled="selectedProjectId === -1"
                  filterable
                  clearable
                >
                  <el-option v-for="item in priority" :key="item.id" :label="$t('Issue.'+item.name)"
                             :value="item.id"
                  >
                    <Priority :name="item.name" />
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('general.Status')">
                <el-select
                  v-model="filterValue.status"
                  :placeholder="$t('Issue.SelectStatus')"
                  :disabled="selectedProjectId === -1"
                  filterable
                  clearable
                >
                  <el-option v-for="item in status" :key="item.id" :label="$t('Issue.'+item.name)"
                             :value="item.id"
                  >
                    <Status :name="item.name" />
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.assigned_to')">
                <el-select
                  v-model="filterValue.assigned_to"
                  :placeholder="$t('Member.SelectMember')"
                  :disabled="selectedProjectId === -1"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in assigned_to"
                    :key="item.id"
                    :label="(item.login)? item.name+'('+item.login+')' : item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
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
    <!-- TODO: data="pagedData" -->
    <el-table
      ref="issueList"
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      row-key="id"
      height="75vh"
      :tree-props="{ children: 'child' }"
      :row-class-name="getRowClass"
      @cell-click="handleClick"
    >
      <el-table-column type="expand" class-name="informationExpand">
        <template slot-scope="scope">
          <ul>
            <li v-if="scope.row.relations.hasOwnProperty('parent')">
              <b>{{ $t('Issue.ParentIssue') }}:</b>
              <el-link
                class="font-weight-regular"
                :style="{ 'font-size': '14px', cursor: 'pointer' }"
                :underline="false"
                @click="handleEdit(scope.row.relations.parent.id)"
              >
                <status :name="scope.row.relations.parent.status.name" size="mini" />
                <tracker :name="scope.row.relations.parent.tracker.name" />
                #{{ scope.row.relations.parent.id }} - {{ scope.row.relations.parent.name }}
                <span
                  v-if="scope.row.relations.parent.hasOwnProperty('assigned_to')&&Object.keys(scope.row.relations.parent.assigned_to).length>1"
                >
                  ({{ $t('Issue.Assignee') }}: {{ scope.row.relations.parent.assigned_to.name }}
                  - {{ scope.row.relations.parent.assigned_to.login }})
                </span>
              </el-link>
            </li>
            <li v-if="scope.row.relations.hasOwnProperty('children')">
              <b>{{ $t('Issue.ChildrenIssue') }}:</b>
              <ol>
                <li v-for="child in scope.row.relations.children" :key="child.id">
                  <el-link
                    class="font-weight-regular"
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
                </li>
              </ol>
            </li>
          </ul>
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
    <!--TODO:mixin-->
    <!--    <pagination-->
    <!--      :total="filteredData.length"-->
    <!--      :page="listQuery.page"-->
    <!--      :limit="listQuery.limit"-->
    <!--      :page-sizes="[listQuery.limit]"-->
    <!--      :layout="'total, prev, pager, next'"-->
    <!--      @pagination="onPagination"-->
    <!--    />-->
    <el-pagination
      v-loading="listLoading"
      :total="pageInfo.total"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @current-change="handleCurrentChange"
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
// import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { mapGetters } from 'vuex'
import { addIssue, getIssueFamily, getIssuePriority, getIssueStatus, getIssueTracker } from '@/api/issue'
import { getProjectIssueList, getProjectUserList, getProjectVersion } from '@/api/projects'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import QuickAddIssue from './components/QuickAddIssue'
import ProjectListSelector from '@/components/ProjectListSelector'

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
  // mixins: [MixinElTableWithAProject],
  data() {
    return {
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

      // TODO: mixin
      listData: [],
      listLoading: false,
      keyword: null,
      listQuery: {
        page: 1,
        limit: 10
      },
      pageInfo: {
        total: 0
      }
    }
  },
  computed: {
    // TODO: mixin
    ...mapGetters(['selectedProjectId', 'userRole', 'userId']),
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
      this.getSelectionList()
      this.loadData()
    },
    filterValue: {
      deep: true,
      handler() {
        this.onChangeFilter()
      }
    }
  },
  async mounted() {
    await this.getSelectionList()
    // TODO:mixin
    await this.loadData()
    // this.adjustTable()
  },
  methods: {
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
        page: this.listQuery.page,
        per_page: this.listQuery.limit,
        selection: true
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) { result[item + '_id'] = this.filterValue[item] }
      })
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    // TODO:mixin
    async loadData() {
      this.listLoading = true
      try {
        this.listData = await this.fetchData()
        this.listLoading = false
      } catch (e) {
        // null
      }
      this.listLoading = false
      await this.getIssueFamily(this.listData)
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      let data
      try {
        // const params = await
        const listData = await getProjectIssueList(this.selectedProjectId, this.getParams())
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
    async getSelectionList() {
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
        this.fixed_version = [{ name: '版本未定', id: '' }, ...versionList.versions]
        const version = this.fixed_version.sort(this.sortByDueDate).filter((item) => ((new Date(item.due_date) >= new Date()) && item.status === 'open'))
        if (version.length > 0) {
          this.$set(this.filterValue, 'fixed_version', version[0].id)
          this.$set(this.originFilterValue, 'fixed_version', version[0].id)
        }

        this.tracker = typeList
        this.assigned_to = [
          { name: this.$t('Issue.Unassigned'), id: '' },
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
    getIssueFamily() {
      if (this.listData) {
        this.listData.forEach((item, idx) => {
          try {
            if (this.listData[idx]) { this.$set(this.listData[idx], 'loadingRelation', true) }
            getIssueFamily(item.id)
              .then((relations) => {
                if (this.listData[idx]) { this.$set(this.listData[idx], 'relations', relations.data) }
              }).catch(() => {})
            if (this.listData[idx]) { this.$set(this.listData[idx], 'loadingRelation', false) }
          } catch (e) {
          //   null
          }
        })
      }
    },
    onChangeFilter() {
      this.listQuery.page = 1
      this.loadData()
    },
    handleClick(row, column) {
      if (column.type === 'expand' && this.isRelationIssueLoading(row)) {
        this.$router.push({ name: 'issue-detail', params: { issueId: row.id }})
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
    isParentIssue(row) {
      return row.parent === null && row.children.length === 0
    },
    handleAddNewIssue() {
      this.addTopicDialogVisible = true
      this.parentId = 0
    },
    isRelationIssueLoading(row) {
      return !row.hasOwnProperty('loadingRelation') || row.loadingRelation
    },
    hasRelationIssue(row) {
      return row.relations && Object.keys(row.relations).length > 0
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
    // TODO:mixin
    handleCurrentChange(val) {
      // this.$emit('pagination', { page: val, limit: this.pageSize })
      this.listQuery.page = val
      this.loadData()
    },
    cleanFilter() {
      this.filterValue = this.originFilterValue
      this.keyword = null
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
