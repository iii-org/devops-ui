<template>
  <div class="app-container">
    <project-list-selector>
      <div slot="button">
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
        <el-button
          type="warning"
          icon="el-icon-plus"
          class="text-left"
          :disabled="selectedProjectId === -1"
          @click="handleImportIssue"
        >
          匯入合規項目
        </el-button>
      </div>
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
          <em class="el-icon-arrow-down el-icon--right" /></el-button>
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
    </project-list-selector>
    <el-divider />
    <quick-add-issue ref="quickAddIssue"
                     :save-data="saveIssue"
                     :project-id="selectedProjectId"
                     :visible.sync="quickAddTopicDialogVisible"
                     @add-issue="advancedAddIssue"
    />
    <el-row class="mb-2.5" :gutter="10">
      <el-form>
        <el-col :span="2">
          <el-card class="bg-white rounded-xl text-center cursor-pointer" @click.native="onToggleSelect">
            全選
          </el-card>
        </el-col>
        <el-col v-for="(item) in tracker" :key="item.id" :span="4">
          <el-card class="bg-white rounded-xl">
            <el-row>
              <el-col :span="20">
                <el-checkbox v-model="item.visible" />
                <tracker :name="item.name" />
              </el-col>
              <el-col :span="4" class="text-right text-cyan-600 font-extrabold">{{ getFilterCount(item.name) }}</el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-form>
    </el-row>
    <el-table
      ref="issueList"
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      row-key="id"
      :tree-props="{ children: 'child' }"
      height="50vh"
      :row-class-name="getRowClass"
      @cell-click="handleClick"
      @expand-change="getIssueFamilyData"
    >
      <el-table-column type="expand" class-name="informationExpand">
        <template slot-scope="scope">
          <el-col v-loading="scope.row.loadingRelation">
            <ul>
              <li v-if="scope.row.hasOwnProperty('parent')&&Object.keys(scope.row.parent).length>0">
                <strong>{{ $t('Issue.ParentIssue') }}:</strong>
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
                  <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                    {{ $t('Issue.Unlink') }}
                  </el-button>
                </el-popconfirm>
              </li>
              <li v-if="scope.row.hasOwnProperty('children')">
                <strong>{{ $t('Issue.ChildrenIssue') }}:</strong>
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
                        @onConfirm="removeIssueRelation(child.id)"
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
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <ImportIssue
      :save-data="saveIssue"
      :visible.sync="importIssueVisible"
      :project-id="selectedProjectId"
      @close-dialog="handleImportClose"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { addIssue, getIssueFamily, updateIssue } from '@/api/issue'
import { getProjectIssueList, getProjectUserList, getProjectVersion } from '@/api/projects'
import { Status, Priority, Tracker, QuickAddIssue } from '@/components/Issue'
import Fuse from 'fuse.js'
import ProjectListSelector from '@/components/ProjectListSelector'
import ImportIssue from './components/ImportIssue'
import axios from 'axios'
import { BasicData, Table, Pagination } from '@/newMixins'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'PlanList',
  components: {
    ImportIssue,
    QuickAddIssue,
    Priority,
    Status,
    Tracker,
    ProjectListSelector
  },
  mixins: [BasicData, Table, Pagination],
  data() {
    return {
      rowHeight: 57,
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,
      search: '',
      searchData: '',
      parentId: 0,
      parentName: '',
      trackerSelectAll: true,
      listFilterTrackerData: [],
      fixed_version: [],
      assigned_to: [],
      filterValue: {},
      originFilterValue: {},
      quickChangeDialogVisible: false,
      quickChangeForm: {},
      assigneeList: [],
      importIssueVisible: false,
      form: {},

      keyword: null,
      listQuery: {
        page: 1,
        limit: 10
      },
      lastIssueListCancelToken: null
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'tracker', 'status', 'priority']),
    filteredData() {
      return this.listFilterTrackerData
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
    },
    trackerValue() {
      return this.tracker.filter((item) => (item.visible === true))
    }
  },
  watch: {
    async selectedProjectId() {
      await this.loadSelectionList()
      await this.cleanFilter()
    },
    trackerValue: {
      deep: true,
      handler() {
        this.updateData()
      }
    }
  },
  async created() {
    await this.loadSelectionList()
    await this.loadData()
    await this.updateData()
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
      const result = {}
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
      const apiList = []
      let data = []
      try {
        // const params = await
        if (this.lastIssueListCancelToken && this.listLoading) {
          this.lastIssueListCancelToken.cancel()
          // console.log('change filter')
        }
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        this.tracker.forEach((tracker) => {
          const trackerParams = { ...this.getParams(), tracker_id: tracker.id }
          // console.log(trackerParams, this.tracker)
          apiList.push(getProjectIssueList(this.selectedProjectId, trackerParams, { cancelToken: cancelTokenSource.token }))
        })
        await Promise.all(apiList).then((res) => {
          // console.log(res)
          res.forEach((item) => {
            data = [...data, ...item.data]
          })
        }).finally(() => {
          this.lastIssueListCancelToken = null
        })
        this.tracker.forEach((item, idx) => {
          this.$set(this.tracker[idx], 'visible', true)
        })
        this.listFilterTrackerData = data
      } catch (e) {
        // null
      }
      return data
    },
    resetFilterVersionTrackerData() {
      this.listFilterTrackerData = this.listData
    },
    onToggleSelect() {
      const select = this.tracker.filter((item) => (item.visible === true))
      const checker = select.length > 0
      this.tracker.forEach((item, idx) => {
        this.$set(this.tracker[idx], 'visible', !checker)
      })
    },
    async loadSelectionList() {
      return await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getProjectVersion(this.selectedProjectId)
      ]).then(res => {
        const [assigneeList, versionList] = res.map(
          item => item.data
        )
        this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.versions]
        // const version = this.fixed_version.sort(this.sortByDueDate).filter((item) => ((new Date(item.due_date) >= new Date()) && item.status === 'open'))
        // if (version.length > 0) {
        //   this.$set(this.filterValue, 'fixed_version', version[0].id)
        //   this.$set(this.originFilterValue, 'fixed_version', version[0].id)
        // }
        this.assigned_to = [
          { name: this.$t('Issue.Unassigned'), id: 'null' },
          ...assigneeList.user_list
        ]
        if (this.userRole === 'Engineer') {
          this.$set(this.filterValue, 'assigned_to', this.userId)
          this.$set(this.originFilterValue, 'assigned_to', this.userId)
        }
      })
    },
    getOptionsData(option_name) {
      return this[option_name]
    },
    updateData() {
      // console.log('updateData')
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
      // console.log(res.map(items => items.item))
      this.listFilterTrackerData = res.map(items => items.item)
    },
    async getIssueFamilyData(row, expandedRows) {
      if (expandedRows.find((item) => (item.id === row.id))) {
        try {
          await this.$set(row, 'loadingRelation', true)
          const family = await getIssueFamily(row.id)
          const data = family.data
          if (data.hasOwnProperty('parent')) {
            await this.$set(row, 'parent', data.parent)
          }
          if (data.hasOwnProperty('children')) {
            await this.$set(row, 'children', data.children)
          }
          await this.$set(row, 'loadingRelation', false)
        } catch (e) {
          //   null
        }
      }
    },
    async onChangeFilter() {
      await this.loadData()
      await this.updateData()
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
          this.importIssueVisible = false
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.subject = ''
          return res
        })
        .catch(error => {
          return error
        })
    },
    handleImportIssue() {
      this.importIssueVisible = !this.importIssueVisible
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
    handleImportClose() {
      this.importIssueVisible = false
    },
    getFilterCount(name) {
      return this.listData.filter((item) => (item.tracker.name === name)).length
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
