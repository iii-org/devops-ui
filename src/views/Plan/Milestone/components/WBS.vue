<template>
  <div :style="{height: `${tableHeight}px`}">
    <el-table
      ref="WBS"
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="$t('Loading')"
      :height="tableHeight"
      class="table-css"
      row-key="id"
      lazy
      fit
      :load="getIssueFamilyData"
      :row-class-name="getRowClass"
      :tree-props="{children: 'children', hasChildren: 'has_children'}"
      @row-contextmenu="handleContextMenu"
      @cell-click="handleCellClick"
    >
      <WBSInputColumn
        v-if="columns.indexOf('name')>=0"
        min-width="28%"
        :label="$t('Issue.name')"
        prop="name"
        :edit-row-id="editRowId"
        required
        fixed
        show-overflow-tooltip
        sortable
        :has-child-edit="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <el-table-column width="50px">
        <template slot-scope="{row}">
          <div class="action">
            <div
              class="icon"
              @click.stop="handleContextMenu(row, '', $event)"
            >
              <em class="el-icon-more" />
            </div>
          </div>
        </template>
      </el-table-column>
      <WBSSelectColumn
        v-if="columns.indexOf('tracker')>=0"
        width="125px"
        :label="$t('Issue.tracker')"
        prop-key="tracker"
        prop="tracker.id"
        :edit-row-id="editRowId"
        :components="Tracker"
        :options="tracker"
        :strict-options="strictTracker"
        :is-parent-exist="isParentExist"
        sortable
        :has-child-edit="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        v-if="columns.indexOf('status')>=0"
        width="125px"
        :label="$t('Issue.status')"
        prop-key="status"
        prop="status.id"
        :edit-row-id="editRowId"
        :components="Status"
        :options="status"
        sortable
        :has-child-edit="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        v-if="columns.indexOf('fixed_version')>=0"
        min-width="9%"
        :label="$t('Issue.fixed_version')"
        prop-key="fixed_version"
        prop="fixed_version.id"
        :edit-row-id="editRowId"
        :options="fixedVersion"
        sortable
        :has-child-edit="true"
        show-overflow-tooltip
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSDateColumn
        v-if="columns.indexOf('StartDate')>=0"
        min-width="9%"
        :label="$t('Issue.StartDate')"
        prop="start_date"
        :edit-row-id="editRowId"
        show-overflow-tooltip
        sortable
        before-date-column="due_date"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSDateColumn
        v-if="columns.indexOf('EndDate')>=0"
        min-width="9%"
        :label="$t('Issue.EndDate')"
        prop="due_date"
        :edit-row-id="editRowId"
        show-overflow-tooltip
        sortable
        after-date-column="start_date"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        v-if="columns.indexOf('priority')>=0"
        min-width="9%"
        :label="$t('Issue.priority')"
        prop-key="priority"
        prop="priority.id"
        :edit-row-id="editRowId"
        :components="Priority"
        :options="priority"
        show-overflow-tooltip
        sortable
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        v-if="columns.indexOf('assigned_to')>=0"
        min-width="9%"
        :label="$t('Issue.assigned_to')"
        prop-key="assigned_to"
        prop="assigned_to.id"
        :edit-row-id="editRowId"
        :options="assignedTo"
        :has-child-edit="true"
        show-overflow-tooltip
        sortable
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSInputColumn
        v-if="columns.indexOf('DoneRatio')>=0"
        width="100px"
        :label="$t('Issue.DoneRatio_sm')"
        prop="done_ratio"
        :edit-row-id="editRowId"
        number
        sortable
        :min="0"
        :max="100"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSInputColumn
        v-if="columns.indexOf('points')>=0"
        width="100px"
        :label="$t('Issue.points')"
        :has-child-edit="true"
        prop="point"
        :edit-row-id="editRowId"
        number
        sortable
        :min="0"
        :max="100"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <el-empty
        slot="empty"
        :description="$t('general.NoData')"
      />
      <tr
        v-if="!hasInlineCreate && userRole !=='QA'"
        slot="append"
      >
        <td class="add-issue-inline">
          <el-link
            type="text"
            icon="el-icon-plus"
            @click="appendIssue()"
          >{{ $t('Issue.AddIssue') }}</el-link>
        </td>
      </tr>
    </el-table>
    <contextmenu ref="contextmenu">
      <template v-if="Object.keys(contextMenu.row).length > 2">
        <contextmenu-item class="menu-title">{{ contextMenu.row.name }}</contextmenu-item>
        <contextmenu-submenu
          v-permission="permission"
          :title="$t('Issue.tags')"
        >
          <contextmenu-item
            v-for="item in tags"
            :key="item.id"
            :class="{current:getContextMenuCurrentValue('tags', item), [item.class]:item.class}"
            @click="handleUpdateIssue({value:{'tags':item.id}, row:contextMenu.row})"
          >
            <em
              v-if="getContextMenuCurrentValue('tags', item)"
              class="el-icon-check"
            />
            <em
              v-if="item.id==='null'"
              class="el-icon-circle-close"
            />
            {{ item.name }} {{ item.message }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-item
          v-permission="permission"
          divider
        />
        <contextmenu-item @click="onRelationIssueDialog(contextMenu.row.id)">
          {{ $t('route.Issue Detail') }}
        </contextmenu-item>
        <contextmenu-item @click="toggleIssueMatrixDialog(contextMenu.row)">
          {{ $t('Issue.TraceabilityMatrix') }}
        </contextmenu-item>
        <contextmenu-item
          v-permission="permission"
          divider
        />
        <contextmenu-item
          v-permission="permission"
          @click="appendIssue(contextMenu.row)"
        >
          {{ $t('Issue.AddIssue') }}
        </contextmenu-item>
        <contextmenu-submenu
          v-permission="permission"
          :title="$t('Issue.ChildrenIssue')"
        >
          <contextmenu-item
            v-permission="permission"
            @click="toggleRelationDialog('Children')"
          >
            {{ $t('general.Settings', { name: $t('Issue.ChildrenIssue') }) }}
          </contextmenu-item>
          <contextmenu-item
            v-permission="permission"
            @click="appendIssue(contextMenu.row, true)"
          >
            {{ $t('Issue.AddSubIssue') }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-item
          v-permission="permission"
          @click="appendIssue(contextMenu.row, false, contextMenu.row)"
        >
          {{ $t('Issue.CopyIssue') }}
        </contextmenu-item>
        <contextmenu-item
          v-permission="permission"
          divider
        />
        <contextmenu-item
          v-permission="permission"
          class="menu-remove"
          @click="handleRemoveIssue(contextMenu.row, 'Delete', false)"
        >
          <em class="el-icon-delete">{{ $t('general.Delete') }}</em>
        </contextmenu-item>
      </template>
    </contextmenu>
    <el-dialog
      :visible.sync="relationIssue.visible"
      width="90%"
      top="3vh"
      append-to-body
      destroy-on-close
      :before-close="handleRelationIssueDialogBeforeClose"
    >
      <ProjectIssueDetail
        v-if="relationIssue.visible"
        ref="children"
        :props-issue-id="relationIssue.id"
        :is-in-dialog="true"
        @update="handleRelationUpdate"
        @delete="handleRelationDelete"
      />
    </el-dialog>
    <el-dialog
      :visible.sync="relationDialog.visible"
      :close-on-click-modal="false"
      width="80%"
      :show-close="false"
      append-to-body
    >
      <div slot="title">
        <el-row slot="title" type="flex" align="middle">
          <el-col :xs="24" :md="16">
            <el-button
              type="text"
              size="medium"
              icon="el-icon-arrow-left"
              class="previous text-title linkTextColor"
              @click="toggleRelationDialog(relationDialog.target)"
            >
              {{ $t('general.Back') }}
            </el-button>
            <span class="text-title">
              {{ $t('general.Settings', { name: $t('Issue.' + relationDialog.target + 'Issue') }) }}
            </span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button class="buttonPrimary" @click="onSaveCheckRelationIssue">
              {{ $t('general.Save') }}
            </el-button>
          </el-col>
        </el-row>
      </div>
      <SettingRelationIssue
        v-if="relationDialog.visible"
        ref="settingRelationIssue"
        :row.sync="contextMenu.row"
        :target.sync="relationDialog.target"
      />
    </el-dialog>
    <el-dialog
      :visible.sync="issueMatrixDialog.visible"
      width="80%"
      top="20px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      :title="$t('Issue.TraceabilityMatrix')+'(#'+issueMatrixDialog.row.id+' - '+ issueMatrixDialog.row.name+')'"
    >
      <IssueMatrix
        v-if="issueMatrixDialog.visible"
        :row.sync="issueMatrixDialog.row"
        @update-issue="loadData"
      />
    </el-dialog>
  </div>
</template>

<script>
import { directive, Contextmenu, ContextmenuItem, ContextmenuSubmenu } from 'v-contextmenu'
import { getProjectIssueList } from '@/api_v2/projects'
import { mapGetters } from 'vuex'
import { Tracker, Priority, Status } from '@/components/Issue'
import WBSInputColumn from '@/views/Plan/Milestone/components/WBSInputColumn'
import WBSSelectColumn from '@/views/Plan/Milestone/components/WBSSelectColumn'
import WBSDateColumn from '@/views/Plan/Milestone/components/WBSDateColumn'
import ProjectIssueDetail from '@/views/Project/IssueDetail/'
import SettingRelationIssue from '@/views/Project/IssueList/components/SettingRelationIssue'
import IssueMatrix from '@/views/Project/IssueDetail/components/IssueMatrix'
import { addIssue, deleteIssue, getIssueFamily, updateIssue } from '@/api/issue'
import { cloneDeep } from 'lodash'
import { CancelRequest } from '@/newMixins'

export default {
  name: 'WBS',
  components: {
    WBSSelectColumn,
    WBSInputColumn,
    WBSDateColumn,
    Contextmenu,
    ContextmenuItem,
    ContextmenuSubmenu,
    ProjectIssueDetail,
    SettingRelationIssue,
    IssueMatrix,
    // eslint-disable-next-line vue/no-unused-components
    Tracker, Status
  },
  directives: {
    contextmenu: directive
  },
  mixins: [CancelRequest],
  props: {
    filterValue: {
      type: Object,
      default: () => ({})
    },
    keyword: {
      type: String,
      default: null
    },
    columns: {
      type: Array,
      default: () => []
    },
    assignedTo: {
      type: Array,
      default: () => []
    },
    fixedVersion: {
      type: Array,
      default: () => []
    },
    tags: {
      type: Array,
      default: () => []
    },
    tableHeight: {
      type: Number,
      default: 0
    },
    displayClosed: {
      type: Boolean,
      default: false
    }
  },
  filter: {
    relativeTime(dateTime) {
      return dateTime ? this.$dayjs(dateTime).utc().local().fromNow() : '-'
    }
  },
  data() {
    return {
      Priority,
      Tracker,
      Status,
      listLoading: false,
      listData: [],
      addIssueVisible: false,
      updateLoading: false,
      editRowId: null,
      isParentExist: false,
      contextMenu: { visible: true, row: {}},
      relationIssue: {
        visible: false,
        id: null
      },
      relationDialog: {
        visible: false,
        target: 'Parent'
      },
      issueMatrixDialog: {
        visible: false,
        row: { id: null, name: null }
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'priority', 'tracker', 'status', 'userId', 'userRole', 'strictTracker']),
    hasInlineCreate() {
      const create = this.listData ? this.listData.filter((item) => item.create) : false
      return create.length > 0
    },
    isButtonDisabled() {
      return this.userRole === 'QA'
    },
    permission() {
      return ['Administrator', 'Project Manager', 'Engineer']
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    getParams() {
      // const tracker = this.tracker.find((item) => item.name === 'Epic')
      const result = {
        parent_id: 'null',
        with_point: true,
        sort: 'subject:dec'
        // tracker_id: tracker ? tracker.id : 1
      }
      if (!this.displayClosed) {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          if (item === 'due_date_start' || item === 'due_date_end') {
            result['due_date_start'] = this.$dayjs(this.filterValue['due_date_start']).isValid()
              ? this.$dayjs(this.filterValue['due_date_start']).format('YYYY-MM-DD')
              : null
            result['due_date_end'] = this.$dayjs(this.filterValue['due_date_end']).isValid()
              ? this.$dayjs(this.filterValue['due_date_end']).format('YYYY-MM-DD')
              : null
          } else if (item === 'tags' && this.filterValue[item].length > 0) {
            result[item] = this.filterValue[item].join()
          } else {
            result[item + '_id'] = this.filterValue[item]
          }
        }
      })
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    async loadData() {
      if (this.listLoading) {
        this.cancelRequest()
      }
      if (this.selectedProjectId === -1) return
      this.listData = []
      this.listData = await this.fetchData()
      this.$set(this.$refs['WBS'].resizeState, 'height', 0)
      this.$set(this.$refs['WBS'], 'isGroup', true)
      this.$set(this.$refs['WBS'], 'isGroup', false)
    },
    async fetchData() {
      if (!this.selectedProjectId) return
      this.listLoading = true
      const res = await getProjectIssueList(this.filterValue.project || this.selectedProjectId, this.getParams(), { cancelToken: this.cancelToken })
      if (res.hasOwnProperty('data')) {
        this.listLoading = false
        return Promise.resolve(res.data.map((item) => this.issueFormatter(item)))
      }
    },
    issueFormatter(issue) {
      if (Object.keys(issue.assigned_to).length <= 0) {
        issue.assigned_to = { id: null }
      }
      if (Object.keys(issue.fixed_version).length <= 0) {
        issue.fixed_version = { id: null }
      }
      issue.start_date = issue.start_date ? new Date(issue.start_date) : null
      issue.due_date = issue.due_date ? new Date(issue.due_date) : null
      return issue
    },
    setTreeData(row, treeData, lazyTreeNodeMap) {
      this.$set(row, 'has_children', true)
      this.$set(treeData, row.id, {})
      this.$set(treeData[row.id], 'display', true)
      this.$set(treeData[row.id], 'lazy', true)
      this.$set(treeData[row.id], 'loaded', true)
      this.$set(treeData[row.id], 'loading', false)
      this.$set(treeData[row.id], 'expanded', false)
      this.$set(treeData[row.id], 'children', [])
      if (row.parent_object && treeData[row.parent_object.id]) {
        treeData[row.id]['level'] = treeData[row.parent_object.id]['level'] + 1
      }
      this.$set(lazyTreeNodeMap, row.id, [])
    },
    async treeDataArray(row, subLevel) {
      let row_index = this.listData.length
      let treeDataArray = []
      let updateNodeMap = []
      const { treeData, lazyTreeNodeMap } = this.$refs.WBS.layout.store.states
      if (row && row.id) {
        if (subLevel) {
          if (!treeData[row.id]) {
            this.setTreeData(row, treeData, lazyTreeNodeMap)
          } else {
            await this.getIssueFamilyData(row, row.id, null, true)
          }
          this.$refs.WBS.toggleRowExpansion(row, true)
          treeDataArray = treeData[row.id].children
          updateNodeMap = lazyTreeNodeMap[row.id]
          row_index = treeDataArray.findIndex((issue) => issue.id === row.id)
        } else if (row && row.parent_object) {
          if (row.parent_object.id && treeData[row.parent_object.id]) {
            treeDataArray = treeData[row.parent_object.id].children
            updateNodeMap = lazyTreeNodeMap[row.parent_object.id]
          }
          row_index = treeDataArray.findIndex((issue) => issue.id === row.id) + 1
        } else {
          row_index = this.listData.findIndex((issue) => issue.id === row.id) + 1
        }
      }
      return { row_index, treeDataArray, updateNodeMap }
    },
    issueForm(prefill, timestamp) {
      const findEpic = this.tracker.find((item) => item.name === 'Epic')
      const form = {
        id: `new_${timestamp}`,
        parent_id: null,
        assigned_to: { id: '', name: '' },
        name: '',
        fixed_version: { id: '', name: '' },
        tracker: { id: findEpic ? findEpic.id : '', name: '' },
        status: { id: 1, name: '' },
        priority: { id: 3, name: '' },
        estimated_hours: 0,
        done_ratio: 0,
        point: 0,
        start_date: '',
        due_date: '',
        create: true
      }
      for (const data in form) {
        if (!prefill) break
        if (data !== 'id' && data !== 'create' && prefill[data]) {
          if (data === 'name') form[data] = `${prefill.name}(${this.$t('Issue.Copy')})`
          else form[data] = prefill[data]
        }
      }
      return form
    },
    async appendIssue(row, subLevel, prefill) {
      if (row) this.$set(this.$data, 'isParentExist', Object.prototype.hasOwnProperty.call(row, 'parent_object'))
      const { row_index, treeDataArray, updateNodeMap } = await this.treeDataArray(row, subLevel)
      const store = this.$refs.WBS.layout.store
      const { treeData, lazyTreeNodeMap } = store.states
      const timestamp = Math.floor(new Date().getTime() / 1000)
      const issueForm = this.issueForm(prefill, timestamp)
      if (subLevel) {
        treeDataArray.splice(row_index, 0, `new_${timestamp}`)
        issueForm['parent_id'] = row.id
        issueForm['sub_level'] = true
        issueForm['parent_object'] = row
        updateNodeMap.splice(row_index, 0, issueForm)
        store.$set(treeData[row.id], 'children', treeDataArray)
        store.$set(lazyTreeNodeMap, row.id, updateNodeMap)
      } else if (row && row.parent_object) {
        treeDataArray.splice(row_index, 0, `new_${timestamp}`)
        issueForm['parent_id'] = row.parent_object.id
        issueForm['parent_object'] = row.parent_object
        updateNodeMap.splice(row_index, 0, issueForm)
        store.$set(treeData[row.parent_object.id], 'children', treeDataArray)
        store.$set(lazyTreeNodeMap, row.parent_object.id, updateNodeMap)
      } else {
        this.listData.splice(row_index, 0, issueForm)
      }
    },
    async removeIssue(row) {
      let row_index = this.listData.length
      let treeDataArray = []
      let updateNodeMap = []
      const store = this.$refs.WBS.layout.store
      const { treeData, lazyTreeNodeMap } = store.states
      if (row.id) {
        if (row && row.parent_object) {
          if (row.parent_object.id && treeData[row.parent_object.id]) {
            treeDataArray = treeData[row.parent_object.id].children
            updateNodeMap = lazyTreeNodeMap[row.parent_object.id]
          }
          row_index = updateNodeMap.findIndex((issue) => issue.id === row.id)
        } else {
          row_index = this.listData.findIndex((issue) => issue.id === row.id)
        }
      }
      if (row && row.parent_object) {
        updateNodeMap.splice(row_index, 1)
        if (updateNodeMap.length <= 0) {
          store.$delete(lazyTreeNodeMap, row.parent_object.id)
          treeDataArray.splice(
            treeDataArray.findIndex((issue) => issue.id === row.id),
            1
          )
        } else {
          store.$set(lazyTreeNodeMap, row.parent_object.id, updateNodeMap)
        }
      } else {
        this.listData.splice(row_index, 1)
      }
    },
    async handleRemoveIssue(row, msg, force, detail) {
      const h = this.$createElement
      const issueName = { issueName: row.name }
      const messageList = [h('span', null, this.$t(`Issue.${msg}Issue`, issueName))]
      if (detail) {
        messageList.push(h('ul', null,
          detail.map(issue => {
            let tags = ''
            if (issue.tags && issue.tags.length > 0) {
              tags = issue.tags.map(tag => h('el-tag', { class: { 'mx-1': true }, props: { type: 'mini' }}, tag.name))
            }
            return h('li', null, [
              h('Status', { class: { 'mx-1': true }, props: { name: this.$t(`Issue.${issue.status.name}`), size: 'mini' }}, ''),
              h('Tracker', { props: { name: this.$t(`Issue.${issue.tracker.name}`), size: 'mini' }}, ''),
              h('span', null, [
                h('span', null, `#${issue.id} - `),
                ...tags,
                h('span', null, `${issue.name} ${(Object.keys(issue.assigned_to).length > 0 ? `(${this.$t(`Issue.assigned_to`)}: ${issue.assigned_to.name}
             -  ${issue.assigned_to.login})` : '')}`)
              ])
            ])
          })
        ))
      }
      const message = h('p', null, messageList)
      const deleteRequest = await this.$confirm(message, this.$t('general.Delete'), {
        confirmButtonText: this.$t('general.Delete'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }).catch(err => console.error(err))
      if (deleteRequest === 'confirm') {
        this.updateLoading = true
        this.$emit('update-loading', true)
        try {
          await this.deleteIssueAPI(force, row)
        } catch (err) {
          const errorRes = err.response.data
          if (errorRes && errorRes.error.code === 1013) {
            await this.handleRemoveIssue(row, 'ConfirmDelete', true, errorRes.error.details)
          } else {
            this.$emit('update-status', {
              error: err
            })
            this.$message({
              title: this.$t('general.Error').toString(),
              type: 'error',
              message: this.$t(`errorMessage.${err.response.data.error.code}`, err.response.data.error.details).toString()
            })
          }
        }
        this.updateLoading = false
      }
    },
    async deleteIssueAPI(force, row) {
      let params = {}
      if (force) {
        params = { force: force }
      }
      const res = await deleteIssue(row.id, params)
      this.$emit('update-status', {
        time: res.datetime
      })
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
      })
      this.updateLoading = false
      this.$emit('update-loading', false)
      await this.removeIssue(row)
    },
    handleCellClick(row, column) {
      if (!this.isButtonDisabled) {
        let columnName = column['property'].split('.')
        if (columnName.length >= 2) {
          columnName = columnName[0]
        } else {
          columnName = column['property']
        }
        this.$set(this.$data, 'editRowId', row.id)
        this.$set(this.$data, 'isParentExist', Object.prototype.hasOwnProperty.call(row, 'parent_object'))
        this.$set(row, 'originColumn', cloneDeep(row[columnName]))
        this.$set(row, 'editColumn', columnName)
      }
    },
    handleResetEdit({ value, row }) {
      this.$set(this.$data, 'editRowId', null)
      this.$set(row, value, row.originColumn)
      this.$set(row, 'editColumn', false)
      this.$set(row, 'originColumn', null)
    },
    handleResetCreate({ row }) {
      let row_index = 0
      let treeDataArray = []
      let updateNodeMap = []
      const store = this.$refs.WBS.layout.store
      const { treeData, lazyTreeNodeMap } = store.states
      if (row && row.parent_object) {
        if (row.parent_object.id && treeData[row.parent_object.id]) {
          treeDataArray = treeData[row.parent_object.id].children
          updateNodeMap = lazyTreeNodeMap[row.parent_object.id]
        }
        row_index = treeDataArray.findIndex((issue) => issue === row.id)
        treeDataArray.splice(row_index, 1)
        updateNodeMap.splice(row_index, 1)
        store.$set(treeData[row.parent_object.id], 'children', treeDataArray)
        store.$set(lazyTreeNodeMap, row.parent_object.id, updateNodeMap)
      } else {
        row_index = this.listData.findIndex((issue) => issue.id === row.id)
        this.listData.splice(row_index, 1)
      }
      this.$set(row, 'create', false)
    },
    async handleUpdateIssue({ value, row }) {
      let checkUpdate = false
      const originDate = this.$dayjs(row.originColumn)
      if (value['tags']) {
        const tags = row['tags'].map((item) => item.id)
        const findTags = tags.findIndex((item) => item === value['tags'])
        if (findTags >= 0) {
          tags.splice(findTags, 1)
        } else {
          tags.push(value['tags'])
        }
        value = { tags: tags.join(',') }
        checkUpdate = true
      } else if (typeof row.originColumn === 'object' && row.originColumn instanceof Date) {
        if (originDate.isValid()) {
          checkUpdate = value[row.editColumn] !== originDate.format('YYYY-MM-DD')
        } else {
          checkUpdate = value[`${row.editColumn}_id`] !== row.originColumn.id
        }
      } else {
        checkUpdate = value[row.editColumn] !== row.originColumn
      }
      if (row.name.length <= 0) {
        return
      }
      if (checkUpdate) {
        if (!this.updateLoading) {
          this.updateLoading = true
          this.$emit('update-loading', true)
          try {
            Object.keys(value).forEach((key) => {
              if (value[key] === null) {
                value[key] = ''
              }
            })
            const res = await updateIssue(row.id, value)
            this.$set(row, 'editColumn', false)
            this.$set(row, 'originColumn', null)
            if (row.parent_object) {
              let treeDataArray = []
              let updateNodeMap = []
              const store = this.$refs.WBS.layout.store
              const { treeData, lazyTreeNodeMap } = store.states
              if (row.parent_object.id && treeData[row.parent_object.id]) {
                treeDataArray = treeData[row.parent_object.id].children
                updateNodeMap = lazyTreeNodeMap[row.parent_object.id]
              }
              const findIssueIndex = treeDataArray.findIndex((issue) => issue === row.id)
              this.$set(updateNodeMap, findIssueIndex, {
                ...this.issueFormatter(res.data),
                parent_object: row.parent_object
              })
              store.$set(treeData[row.parent_object.id], 'children', treeDataArray)
              store.$set(lazyTreeNodeMap, row.parent_object.id, updateNodeMap)
            } else {
              const row_index = this.listData.findIndex((issue) => row.id === issue.id)
              this.$set(this.listData, row_index, this.issueFormatter(res.data))
            }
            this.$emit('update-status', {
              time: res.datetime
            })
            this.$notify({
              title: this.$t('general.Success').toString(),
              type: 'success',
              message: this.$t('Notify.Updated').toString()
            })
          } catch (e) {
            this.$emit('update-status', {
              error: e
            })
            this.$notify({
              title: this.$t('general.Error').toString(),
              type: 'error',
              message: this.$t(`errorMessage.${e.response.data.error.code}`, e.response.data.error.details).toString()
            })
          }
          this.updateLoading = false
          this.$emit('update-loading', false)
        }
      } else {
        this.handleResetEdit({ value, row })
        this.$notify({
          title: this.$t('general.Cancel').toString(),
          type: 'warning',
          message: this.$t('Notify.Same').toString()
        })
      }
    },
    async handleCreateIssue({ row }) {
      if (!this.updateLoading) {
        if (row.name.length <= 0) {
          return
        }
        const data = {}
        Object.keys(row).forEach((item) => {
          if (row[item] && typeof row[item] === 'object') {
            data[`${item}_id`] = row[item]['id'] ? row[item]['id'] : row[item]
          } else {
            data[item] = row[item]
          }
        })
        this.updateLoading = true
        this.$emit('update-loading', true)
        try {
          const res = await addIssue({ ...data, project_id: this.selectedProjectId })
          this.$set(row, 'create', false)
          this.$set(row, 'editColumn', false)
          res.data = this.issueFormatter(res.data)
          Object.keys(res.data).forEach((item) => {
            this.$set(row, item, res.data[item])
          })
          this.$emit('update-status', {
            time: res.datetime
          })
          this.$notify({
            title: this.$t('general.Success').toString(),
            type: 'success',
            message: this.$t('Notify.Added').toString()
          })
        } catch (e) {
          this.$emit('update-status', {
            error: e
          })
          this.$notify({
            title: this.$t('general.Error').toString(),
            type: 'error',
            message: this.$t(`errorMessage.${e.response.data.error.code}`, e.response.data.error.details).toString()
          })
        }
        this.updateLoading = false
        this.$emit('update-loading', false)
      }
    },
    async getIssueFamilyData(row, treeNode, resolve, treeData) {
      try {
        const family = await getIssueFamily(row.id, { params: { with_point: true }})
        const data = family.data
        if (data.hasOwnProperty('children')) {
          if (treeData) {
            const store = this.$refs.WBS.layout.store
            const { treeData, lazyTreeNodeMap } = store.states
            const childrenData = data.children.map((item) => ({
              parent_object: {
                ...row,
                children: data.children
              },
              ...item
            }))
            store.$set(
              treeData[row.id],
              'children',
              data.children.map((item) => item.id)
            )
            store.$set(lazyTreeNodeMap, row.id, childrenData)
          } else {
            resolve(data.children.map((item) => ({ parent_object: { ...row, children: data.children }, ...item })))
          }
        } else {
          if (treeData) {
            const store = this.$refs.WBS.layout.store
            const { treeData, lazyTreeNodeMap } = store.states
            store.$set(treeData[row.id], 'children', [])
            store.$set(lazyTreeNodeMap, row.id, [])
          } else {
            resolve([])
          }
        }
      } catch (e) {
        //   null
        return Promise.resolve()
      }
      return Promise.resolve()
    },
    handleInputContextMenu({ row, column, event }) {
      this.handleContextMenu(row, column, event)
    },
    handleContextMenu(row, column, event) {
      if (parseInt(row.id)) {
        event.preventDefault()
        const eventX = event.pageX
        const eventY = event.pageY
        this.$refs.contextmenu.show()
        this.$nextTick(() => {
          const contextmenuPosition = {
            top: eventY,
            left: eventX
          }
          const contextmenuWidth = this.$refs.contextmenu.$el.clientWidth
          const contextmenuHeight = this.$refs.contextmenu.$el.clientHeight
          if (contextmenuWidth <= 50 && contextmenuWidth <= 50) {
            this.handleContextMenu(row, column, event)
          }
          if (contextmenuHeight + eventY >= window.innerHeight) {
            contextmenuPosition.top -= contextmenuHeight
          }
          if (contextmenuWidth + eventX >= window.innerWidth) {
            contextmenuPosition.left -= contextmenuWidth
          }
          this.contextMenu.top = contextmenuPosition.top
          this.contextMenu.left = contextmenuPosition.left
          this.contextMenu.row = row
          this.contextMenu.visible = true
          this.$refs.contextmenu.style = {
            top: this.contextMenu.top + 'px',
            left: this.contextMenu.left + 'px'
          }
          document.addEventListener('click', this.hideContextMenu)
        })
      }
    },
    hideContextMenu() {
      this.contextMenu.visible = false
      document.removeEventListener('click', this.hideContextMenu)
    },
    handleRelationDelete() {
      this.handleUpdated()
      this.onCloseRelationIssueDialog()
    },
    handleRelationIssueDialogBeforeClose(done) {
      if (this.$refs.children.hasUnsavedChanges()) {
        this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        })
          .then(() => {
            done()
          })
          .catch()
      } else {
        done()
      }
    },
    onSaveCheckRelationIssue() {
      this.$refs.settingRelationIssue.$refs.issueForm.validate((valid) => {
        if (valid) {
          this.onSaveRelationIssue()
        }
      })
    },
    async onSaveRelationIssue() {
      try {
        const getSettingRelationIssue = this.$refs['settingRelationIssue']
        const updateApi = []
        if (getSettingRelationIssue.target === 'Parent') {
          updateApi.push(
            updateIssue(getSettingRelationIssue.row.id, { parent_id: getSettingRelationIssue.form.parent_id })
          )
        } else if (getSettingRelationIssue.target === 'Children') {
          getSettingRelationIssue.children['append'].forEach((item) => {
            updateApi.push(updateIssue(item, { parent_id: getSettingRelationIssue.row.id }))
          })
          getSettingRelationIssue.children['remove'].forEach((item) => {
            updateApi.push(updateIssue(item, { parent_id: '' }))
          })
        }
        await Promise.all(updateApi)
        this.toggleRelationDialog(getSettingRelationIssue.target)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.loadData()
      } catch (e) {
        console.error(e)
      }
    },
    onRelationIssueDialog(id) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
    },
    onCloseRelationIssueDialog() {
      this.$set(this.relationIssue, 'visible', false)
      this.$set(this.relationIssue, 'id', null)
    },
    handleRelationUpdate() {
      this.loadData()
      this.$emit('update-issue')
    },
    toggleRelationDialog(target) {
      this.relationDialog.visible = !this.relationDialog.visible
      this.relationDialog.target = target
    },
    toggleIssueMatrixDialog(row) {
      this.issueMatrixDialog.visible = !this.issueMatrixDialog.visible
      this.issueMatrixDialog.row = row
    },
    getRowClass({ row }) {
      return parseInt(row.id) ? 'cursor-context-menu' : ''
    },
    getContextMenuCurrentValue(column, item) {
      return this.contextMenu.row[column].map((subItem) => subItem.id).includes(item.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.add-issue-inline {
  @apply pl-5;
}

.table-css {
  height: 100% !important;

  .action {
    @apply flex cursor-pointer;
    width: 15px;
    height: 25px;

    .icon {
      @apply bg-gray-200 text-black rounded-md text-center align-middle px-1;
    }
  }

  >>> table {
    th {
      padding: 5px;
    }

    td {
      padding: 5px;
    }
  }
}

.menu-title {
  background: #d2d2d2;
  max-width: 150px;
  height: 25px;
  line-height: 1.25;
  padding: 3px 3px 3px 5px;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.current {
  @apply text-success font-bold;
}

.menu-remove {
  @apply text-danger font-bold;
}

>>> .cursor-context-menu {
  cursor: context-menu;
}
</style>
