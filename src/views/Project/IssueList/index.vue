<template>
  <div class="app-container" style="overflow: hidden;">
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
        <div class="text-right float-right w-1/4">
          <el-popover
            placement="bottom"
            trigger="click"
          >
            <el-form>
              <el-select
                v-model="versionValue"
                :placeholder="$t('Version.SelectVersion')"
                :disabled="selectedProjectId === -1"
                class="mr-4"
                filterable
              >
                <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />
                <el-option v-for="item in fixed_version" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
              <el-form-item>
                <el-select-all
                  ref="filterValue"
                  :value="trackerValue"
                  filterable
                  multiple
                  collapse-tags
                  :options="tracker"
                  value-key="value"
                  @change="setTrackerValue"
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  id="input-search"
                  v-model="keyword"
                  prefix-icon="el-icon-search"
                  :placeholder="$t('Issue.SearchNameOrAssignee')"
                  style="width: 250px; float: right"
                />
              </el-form-item>
            </el-form>
            <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}
              <i class="el-icon-arrow-down el-icon--right" /></el-button>
          </el-popover>
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
    <el-row v-if="filterVisible" type="flex" :gutter="10">
      <el-col>
        <el-form inline label-position="left">
          <el-form-item>
            <el-select
              v-model="versionValue"
              :placeholder="$t('Version.SelectVersion')"
              :disabled="selectedProjectId === -1"
              class="mr-4"
              filterable
            >
              <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />
              <el-option v-for="item in fixed_version" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="onToggleSelect">
              {{ $t('general.SelectAll') }}
            </el-button>
          </el-form-item>
          <el-form-item v-for="(item) in tracker" :key="item.id">
            <el-checkbox v-model="item.visible">
              <tracker :name="item.name" />
            </el-checkbox>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <!-- TODO: data="pagedData" -->
    <el-table
      ref="issueList"
      v-loading="listLoading"
      :data="listFilterData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      row-key="id"
      :tree-props="{ children: 'child' }"
      :row-class-name="getRowClass"
      @cell-click="handleClick"
    >
      <el-table-column type="expand" class-name="informationExpand">
        <template slot-scope="scope">
          <ul>
            <li v-if="scope.row.relations.hasOwnProperty('parent')">
              <b>父議題:</b>
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
              <b>子議題:</b>
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
import { addIssue, getIssueFamily, getIssueTracker } from '@/api/issue'
import { getProjectIssueList, getProjectVersion } from '@/api/projects'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import Fuse from 'fuse.js'
import QuickAddIssue from './components/QuickAddIssue'
import ProjectListSelector from '@/components/ProjectListSelector'
import ElSelectAll from '@/components/ElSelectAll'

export default {
  name: 'ProjectIssues',
  components: {
    ElSelectAll,
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
      filterVisible: false,
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      search: '',
      parentId: 0,
      parentName: '',
      versionValue: '-1',
      fixed_version: [],
      tracker: [],
      trackerValue: [],
      listFilterData: [],
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
    ...mapGetters(['selectedProjectId', 'userRole', 'userName']),
    fixedVersionOptions() {
      return [{ name: this.$t('Dashboard.TotalVersion'), id: '-1' }, ...this.fixed_version]
    },
    listFilter() {
      const result = []
      const version = this.fixedVersionOptions.find((item) => (item.id === this.versionValue))
      const tracker = this.trackerValue.length
      if (version) {
        result.push(version.name)
      }
      if (tracker && tracker !== this.tracker.length) {
        result.push(this.$t('Issue.tracker') + '(' + tracker + ')')
      }
      if (this.keyword) {
        result.push(this.$t('general.Search') + ':' + this.keyword)
      }
      return result.join(', ')
    }
  },
  watch: {
    selectedProjectId() {
      this.versionValue = '-1'
      this.getSelectionList()
      this.loadData()
    },
    listData: {
      deep: true,
      handler() {
        console.log('update')
        this.updateData()
      }
    },
    trackerValue: {
      deep: true,
      handler() {
        this.updateData()
      }
    },
    versionValue() {
      this.updateData()
    },
    keyword() {
      this.listQuery.page = 1
      this.loadData()
    }
  },
  mounted() {
    this.getSelectionList()
    // TODO:mixin
    this.loadData()
    // this.adjustTable()
  },
  methods: {
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
      this.listLoading = false
    },
    // TODO:mixin
    async loadData() {
      this.listLoading = true
      this.listData = await this.fetchData()
      this.listLoading = false
      await this.getIssueFamily(this.listData)
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      const listData = await getProjectIssueList(this.selectedProjectId, {
        page: this.listQuery.page,
        per_page: this.listQuery.limit,
        search: this.keyword
      })
      const data = listData.data.issue_list
      this.pageInfo = listData.data.page
      return data
    },
    async getSelectionList() {
      const versionsRes = await getProjectVersion(this.selectedProjectId)
      this.fixed_version = [{ name: '版本未定', id: '' }, ...versionsRes.data.versions]
      const issueTrackerRes = await getIssueTracker()
      this.tracker = issueTrackerRes.data.map((item) => ({ value: item.id, label: this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name }))
      this.tracker.forEach((item, idx) => {
        this.$set(this.tracker[idx], 'visible', true)
      })
      if (this.userRole === 'Engineer') {
        this.keyword = this.userName
      }
    },
    getIssueFamily() {
      this.listData.forEach((item, idx) => {
        this.$set(this.listData[idx], 'loadingRelation', true)
        getIssueFamily(item.id)
          .then((issue) => {
            this.$set(this.listData[idx], 'relations', issue.data)
          })
          .finally(() => {
            this.$set(this.listData[idx], 'loadingRelation', false)
          })
      })
    },
    resetFilterVersionTrackerData() {
      this.listFilterData = this.listData
      console.log(this.listFilterData, this.listData)
    },
    onToggleSelect() {
      const select = this.tracker.filter((item) => (item.visible === true))
      const checker = select.length > 0
      this.tracker.forEach((item, idx) => {
        this.$set(this.tracker[idx], 'visible', !checker)
      })
    },
    updateData() {
      this.resetFilterVersionTrackerData()
      const versionOpt = {
        keys: ['fixed_version.id'],
        useExtendedSearch: true
      }
      const trackOpt = {
        keys: ['tracker.id'],
        useExtendedSearch: true
      }
      if (this.trackerValue.length > 0) {
        this.searchIssueList(this.trackerValue, trackOpt)
      } else {
        this.listFilterData = this.listData
      }
      if (this.versionValue !== '-1') {
        this.searchIssueList(this.versionValue, versionOpt)
      }
    },
    searchIssueList(value, opt) {
      const fuse = new Fuse(this.listFilterData, opt)
      let search = `="${value}"`
      if (Array.isArray(value) && value.length >= 1) {
        search = { $or: value.map((item) => ({ $path: [opt['keys'][0]], $val: `="${item}"` })) }
      }
      const res = fuse.search(search)
      this.listFilterData = res.map(items => items.item)
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
    getFilterCount(name) {
      return this.listFilterData.filter((item) => (item.tracker.name === name)).length
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
    setTrackerValue(val) {
      this.trackerValue = val
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
