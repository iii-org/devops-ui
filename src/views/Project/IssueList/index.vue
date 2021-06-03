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
          @click="handleQuickAddClose"
        >
          {{ $t('Issue.AddIssue') }}
        </el-button>
        <el-button icon="el-icon-s-operation" @click="filterVisible=!filterVisible" />
        <el-input
          id="input-search"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('Issue.SearchNameOrAssignee')"
          style="width: 250px; float: right"
        />
      </div>
    </div>
    <el-divider />
    <quick-add-issue ref="quickAddIssue"
                     :save-data="saveIssue" :project-id="selectedProjectId"
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
              全選
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
    <el-table
      ref="issueList"
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      row-key="id"
      :tree-props="{ children: 'child' }"
      height="80vh"
      :row-class-name="getRowClass"
      @cell-click="handleClick"
    >
      <el-table-column type="expand" class-name="informationExpand">
        <template slot-scope="scope">
          <ul>
            <li v-if="scope.row.parent">
              <b>父議題:</b>
              <el-link
                class="font-weight-regular"
                :style="{ 'font-size': '14px', cursor: 'pointer' }"
                :underline="false"
                @click="handleEdit(scope.row.parent.id)"
              >
                <status :name="scope.row.parent.status.name" size="mini" />
                <tracker :name="scope.row.parent.tracker.name" />
                #{{ scope.row.parent.id }} - {{ scope.row.parent.subject }}
                <span v-if="scope.row.parent.hasOwnProperty('assigned_to')&&Object.keys(scope.row.parent.assigned_to).length>1">
                  ({{ $t('Issue.Assignee') }}: {{ scope.row.parent.assigned_to.name }}
                  - {{ scope.row.parent.assigned_to.login }})
                </span>
              </el-link>
            </li>
            <li v-if="scope.row.children.length">
              <b>子議題:</b>
              <ol>
                <li v-for="child in scope.row.children" :key="child.id">
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
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
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
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { mapGetters } from 'vuex'
import { addIssue, getIssueTracker } from '@/api/issue'
import { getProjectIssueListByTree, getProjectVersion } from '@/api/projects'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import Fuse from 'fuse.js'
import QuickAddIssue from './components/QuickAddIssue'

export default {
  name: 'ProjectIssues',
  components: {
    AddIssue,
    QuickAddIssue,
    Priority,
    Status,
    Tracker
  },
  mixins: [MixinElTableWithAProject],
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
      listFilterData: [],
      quickChangeDialogVisible: false,
      quickChangeForm: {},
      assigneeList: [],
      form: {}
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userName']),
    filteredData() {
      return this.listFilterData.filter(data => {
        if (Object.keys(data.assigned_to).length <= 0) {
          data.assigned_to.name = ''
        }
        if (
          this.keyword === '' ||
          data.name.toLowerCase().includes(this.keyword.toLowerCase()) ||
          data.assigned_to.name.toLowerCase().includes(this.keyword.toLowerCase())
        ) {
          return data
        }
      })
    },
    trackerValue() {
      return this.tracker.filter((item) => (item.visible === true))
    }
  },
  watch: {
    selectedProjectId() {
      this.versionValue = '-1'
    },
    listData: {
      deep: true,
      handler() {
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
    }
  },
  mounted() {
    this.adjustTable()
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
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      // TODO: 換成issue_list，不要使用tree的結構
      const data = this.createRelativeList((await getProjectIssueListByTree(this.selectedProjectId)).data)
      const versionsRes = await getProjectVersion(this.selectedProjectId)
      this.fixed_version = [{ name: '版本未定', id: '' }, ...versionsRes.data.versions]
      const issueTrackerRes = await getIssueTracker()
      this.tracker = issueTrackerRes.data
      this.tracker.forEach((item, idx) => {
        this.$set(this.tracker[idx], 'visible', true)
      })
      if (this.userRole === 'Engineer') {
        this.keyword = this.userName
      }
      return data
    },
    resetFilterVersionTrackerData() {
      this.listFilterData = this.listData
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
      if (this.versionValue !== '-1') {
        this.searchIssueList(this.versionValue, versionOpt)
      }
      if (this.trackerValue.length > 0) {
        this.searchIssueList(this.trackerValue, trackOpt)
      } else {
        this.listFilterData = []
      }
    },
    searchIssueList(value, opt) {
      const fuse = new Fuse(this.listFilterData, opt)
      let search = `="${value}"`
      if (Array.isArray(value) && value.length >= 1) {
        search = { $or: value.map((item) => ({ $path: [opt['keys'][0]], $val: `="${item.id}"` })) }
      }
      const res = fuse.search(search)
      this.listFilterData = res.map(items => items.item)
    },
    handleClick(row, column) {
      if (column.type === 'expand' && this.hasRelationIssue(row)) {
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
    // TODO: 換成issue_list，不要使用tree的結構，之後可以刪掉
    createRelativeList(list) {
      const result = []

      function flatList(parent) {
        for (let i = 0; i < parent.length; i++) {
          result.push(parent[i])
          const children = parent[i].children
          if (parent[i].children.length) flatList(children)
        }
      }

      flatList(list)
      return result
    },
    isParentIssue(row) {
      return row.parent === null && row.children.length === 0
    },
    handleAddNewIssue() {
      this.addTopicDialogVisible = true
      this.parentId = 0
    },
    hasRelationIssue(row) {
      return !!row.parent || (row.children !== undefined && row.children.length > 0)
    },
    handleQuickAddClose() {
      this.quickAddTopicDialogVisible = !this.quickAddTopicDialogVisible
    },
    getFilterCount(name) {
      return this.listFilterData.filter((item) => (item.tracker.name === name)).length
    },
    getRowClass({ row }) {
      const result = []
      if (this.hasRelationIssue(row) === false) {
        result.push('row-expand-cover')
      }
      result.push('cursor-pointer')
      return result.join(' ')
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
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

> > > .context-menu {
  cursor: context-menu;
}
</style>
