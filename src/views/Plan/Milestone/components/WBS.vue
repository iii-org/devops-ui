<template>
  <div ref="wrapper" class="wrapper">
    <el-table ref="WBS"
              v-loading="listLoading"
              :data="listData"
              :element-loading-text="$t('Loading')"
              :height="tableHeight"
              class="table-css"
              row-key="id"
              lazy
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
      <WBSSelectColumn
        v-if="columns.indexOf('tracker')>=0"
        width="125px"
        :label="$t('Issue.tracker')"
        prop-key="tracker"
        prop="tracker.id"
        :components="Tracker"
        :options="tracker"
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
        :label="$t('Issue.DoneRatio')"
        prop="done_ratio"
        :number="true"
        sortable
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
        :number="true"
        sortable
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <el-empty slot="empty" :description="$t('general.NoData')" />
      <tr v-if="!hasInlineCreate" slot="append">
        <td class="add-issue-inline">
          <el-link type="text" icon="el-icon-plus" @click="appendIssue()">{{ $t('Issue.AddIssue') }}</el-link>
        </td>
      </tr>
    </el-table>
    <contextmenu ref="contextmenu">
      <template v-if="Object.keys(contextMenu.row).length>2">
        <contextmenu-item class="menu-title">{{ contextMenu.row.name }}</contextmenu-item>
        <contextmenu-item @click="onRelationIssueDialog(contextMenu.row.id)">{{ $t('route.Issue Detail') }}
        </contextmenu-item>
        <contextmenu-item @click="toggleIssueMatrixDialog(contextMenu.row)">{{ $t('Issue.TraceabilityMatrix') }}
        </contextmenu-item>
        <contextmenu-item divider />
        <contextmenu-item @click="appendIssue(contextMenu.row)">
          {{ $t('Issue.AddIssue') }}
        </contextmenu-item>
        <contextmenu-item @click="appendIssue(contextMenu.row, true)">
          {{ $t('Issue.AddSubIssue') }}
        </contextmenu-item>
        <contextmenu-item @click="appendIssue(contextMenu.row, false, contextMenu.row)">
          {{ $t('Issue.CopyIssue') }}
        </contextmenu-item>
        <contextmenu-item divider />
        <contextmenu-item class="menu-remove" @click="handleRemoveIssue(contextMenu.row)"><em class="el-icon-delete">
          {{ $t('general.Delete') }}</em></contextmenu-item>
      </template>
    </contextmenu>
    <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close
               :before-close="handleRelationIssueDialogBeforeClose"
    >
      <QAProjectIssueDetail v-if="relationIssue.visible"
                            ref="children"
                            :props-issue-id="relationIssue.id"
                            :is-in-dialog="true"
                            @update="handleRelationUpdate"
                            @delete="handleRelationDelete"
      />
    </el-dialog>
    <el-dialog
      :visible.sync="issueMatrixDialog.visible"
      width="80%"
      top="20px"
      append-to-body
      destroy-on-close
      :title="$t('Issue.TraceabilityMatrix')+'(#'+issueMatrixDialog.row.id+' - '+ issueMatrixDialog.row.name+')'"
    >
      <IssueMatrix v-if="issueMatrixDialog.visible" :row.sync="issueMatrixDialog.row"
                   @update-issue="loadData"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  directive,
  Contextmenu,
  ContextmenuItem
} from 'v-contextmenu'
import { getProjectIssueList } from '@/api/projects'
import { mapGetters } from 'vuex'
import { Tracker, Priority } from '@/components/Issue'
import WBSInputColumn from '@/views/Plan/Milestone/components/WBSInputColumn'
import WBSSelectColumn from '@/views/Plan/Milestone/components/WBSSelectColumn'
import WBSDateColumn from '@/views/Plan/Milestone/components/WBSDateColumn'
import QAProjectIssueDetail from '@/views/Plugin/QA/views/Project/IssueDetail/'
import IssueMatrix from '@/views/Plugin/QA/views/Project/IssueDetail/components/IssueMatrix'
import { addIssue, deleteIssue, getIssueFamily, updateIssue } from '@/api/issue'
import { cloneDeep } from 'lodash'
import moment from 'moment'

export default {
  name: 'WBS',
  components: {
    WBSSelectColumn,
    WBSInputColumn,
    WBSDateColumn,
    Contextmenu,
    ContextmenuItem,
    QAProjectIssueDetail,
    IssueMatrix
  },
  directives: {
    contextmenu: directive
  },
  props: {
    filterValue: {
      type: Object,
      default: () => {
      }
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
    }
  },
  filter: {
    relativeTime(dateTime) {
      return dateTime
        ? this.$dayjs(dateTime)
          .utc()
          .local()
          .fromNow()
        : '-'
    }
  },
  data() {
    return {
      Priority,
      Tracker,
      listLoading: false,
      listData: [],
      addIssueVisible: false,
      tableHeight: 0,
      updateLoading: false,
      contextMenu: { visible: true, row: {}},
      relationIssue: {
        visible: false,
        id: null
      },
      issueMatrixDialog: {
        visible: false,
        row: { id: null, name: null }
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'priority', 'tracker', 'userId']),
    hasInlineCreate() {
      const create = this.listData.filter(item => item.create)
      return create.length > 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = this.$refs['wrapper'].clientHeight
    })
    window.onresize = () => {
      this.$nextTick(() => {
        this.tableHeight = this.$refs['wrapper'].clientHeight
      })
    }
  },
  methods: {
    getParams() {
      const result = {
        parent_id: 'null',
        with_point: true
      }
      if (this.dateRange) {
        const due_date = this.dateRange.map((item) => (moment(item).format('YYYY-MM-DD')))
        result['due_date_start'] = due_date[0]
        result['due_date_end'] = due_date[1]
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
    async loadData() {
      if (this.selectedProjectId === -1) return
      this.listLoading = true
      this.listData = await this.fetchData()
      this.listLoading = false
    },
    async fetchData() {
      const res = await getProjectIssueList(this.selectedProjectId, this.getParams())
      return Promise.resolve(res.data.map(item => this.issueFormatter(item)))
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
    async appendIssue(row, subLevel, prefill) {
      let row_index = this.listData.length
      let treeDataArray = []
      let updateNodeMap = []
      const store = this.$refs.WBS.layout.store
      const { treeData, lazyTreeNodeMap } = store.states
      if (row && row.id) {
        if (subLevel) {
          if (!treeData[row.id]) {
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
          } else {
            await this.getIssueFamilyData(row, row.id, null, true)
          }
          this.$refs.WBS.toggleRowExpansion(row, true)
          treeDataArray = treeData[row.id].children
          updateNodeMap = lazyTreeNodeMap[row.id]
          row_index = treeDataArray.findIndex(issue => issue.id === row.id)
        } else if (row && row.parent_object) {
          if (row.parent_object.id && treeData[row.parent_object.id]) {
            treeDataArray = treeData[row.parent_object.id].children
            updateNodeMap = lazyTreeNodeMap[row.parent_object.id]
          }
          row_index = treeDataArray.findIndex(issue => issue.id === row.id) + 1
        } else {
          row_index = this.listData.findIndex(issue => issue.id === row.id) + 1
        }
      }
      const findEpic = this.tracker.find(item => item.name === 'Epic')
      const timestamp = Math.floor(new Date().getTime() / 1000)
      const issueForm = {
        id: `new_${timestamp}`,
        parent_id: (prefill && prefill.parent_id) ? prefill.parent_id : null,
        assigned_to: (prefill && prefill.assigned_to) ? prefill.assigned_to : { id: '', name: '' },
        name: (prefill && prefill.name) ? `${prefill.name}(${this.$t('Issue.Copy')})` : '',
        fixed_version: (prefill && prefill.fixed_version) ? prefill.fixed_version : { id: '', name: '' },
        tracker: (prefill && prefill.tracker) ? prefill.tracker : { id: (findEpic) ? findEpic.id : '', name: '' },
        status: (prefill && prefill.status) ? prefill.status : { id: 1, name: '' },
        priority: (prefill && prefill.priority) ? prefill.priority : { id: 3, name: '' },
        estimated_hours: (prefill && prefill.estimated_hours) ? prefill.estimated_hours : 0,
        done_ratio: (prefill && prefill.done_ratio) ? prefill.done_ratio : 0,
        start_date: (prefill && prefill.start_date) ? prefill.start_date : '',
        due_date: (prefill && prefill.due_date) ? prefill.due_date : '',
        create: true
      }
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
          row_index = updateNodeMap.findIndex(issue => issue.id === row.id)
        } else {
          row_index = this.listData.findIndex(issue => issue.id === row.id)
        }
      }
      if (row && row.parent_object) {
        updateNodeMap.splice(row_index, 1)
        if (updateNodeMap.length <= 0) {
          store.$delete(lazyTreeNodeMap, row.parent_object.id)
          treeDataArray.splice(treeDataArray.findIndex(issue => issue.id === row.id), 1)
        } else {
          store.$set(lazyTreeNodeMap, row.parent_object.id, updateNodeMap)
        }
      } else {
        this.listData.splice(row_index, 1)
      }
    },
    async handleRemoveIssue(row) {
      await this.$msgbox({
        title: this.$t('general.Delete'),
        type: 'warning',
        message: this.$t('Issue.DeleteIssue', { issueName: `#${row.id} - ${row.name}` }),
        showCancelButton: true,
        confirmButtonClass: 'el-button--danger',
        confirmButtonText: this.$t('general.Delete'),
        cancelButtonText: this.$t('general.Cancel'),
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            this.updateLoading = true
            this.$emit('update-loading', true)
            instance.confirmButtonLoading = true
            instance.confirmButtonText = this.$t('Updating')
            try {
              const res = await deleteIssue(row.id)
              this.$emit('update-status', {
                time: res.datetime
              })
              this.$notify({
                title: this.$t('general.Success').toString(),
                type: 'success',
                message: this.$t('Notify.Deleted').toString()
              })
            } catch (e) {
              this.$emit('update-status', {
                error: e
              })
              this.$notify({
                title: this.$t('general.Error').toString(), type: 'error',
                message: this.$t(`errorMessage.${e.response.data.error.code}`, e.response.data.error.details).toString()
              })
            }
            this.updateLoading = false
            this.$emit('update-loading', false)
            instance.confirmButtonLoading = false
            done()
            await this.removeIssue(row)
          } else {
            done()
          }
        }
      })
    },
    handleCellClick(row, column) {
      let columnName = column['property'].split('.')
      if (columnName.length >= 2) {
        columnName = columnName[0]
      } else {
        columnName = column['property']
      }
      this.$set(row, 'originColumn', cloneDeep(row[columnName]))
      this.$set(row, 'editColumn', columnName)
    },
    handleResetEdit({ value, row }) {
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
        row_index = treeDataArray.findIndex(issue => issue === row.id)
        treeDataArray.splice(row_index, 1)
        updateNodeMap.splice(row_index, 1)
        store.$set(treeData[row.parent_object.id], 'children', treeDataArray)
        store.$set(lazyTreeNodeMap, row.parent_object.id, updateNodeMap)
      } else {
        row_index = this.listData.findIndex(issue => issue.id === row.id)
        this.listData.splice(row_index, 1)
      }
      this.$set(row, 'create', false)
    },
    async handleUpdateIssue({ value, row }) {
      let checkUpdate = false
      const originDate = this.$dayjs(row.originColumn)
      if (typeof row.originColumn === 'object' && row.originColumn instanceof Date) {
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
            Object.keys(value).forEach(key => {
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
              const findIssueIndex = treeDataArray.findIndex(issue => issue === row.id)
              this.$set(updateNodeMap, findIssueIndex, {
                ...this.issueFormatter(res.data),
                parent_object: row.parent_object
              })
              store.$set(treeData[row.parent_object.id], 'children', treeDataArray)
              store.$set(lazyTreeNodeMap, row.parent_object.id, updateNodeMap)
            } else {
              const row_index = this.listData.findIndex(issue => row.id === issue.id)
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
              title: this.$t('general.Error').toString(), type: 'error',
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
        Object.keys(row).forEach(item => {
          if (row[item] && typeof row[item] === 'object') {
            data[`${item}_id`] = (row[item]['id']) ? row[item]['id'] : row[item]
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
          Object.keys(res.data).forEach(item => {
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
            title: this.$t('general.Error').toString(), type: 'error',
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
            const childrenData = data.children.map(item => ({
              parent_object: {
                ...row,
                children: data.children
              }, ...item
            }))
            store.$set(treeData[row.id], 'children', data.children.map(item => (item.id)))
            store.$set(lazyTreeNodeMap, row.id, childrenData)
          } else {
            resolve(data.children.map(item => ({ parent_object: { ...row, children: data.children }, ...item })))
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
    handleContextMenu(row, column, event) {
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
          .catch(() => {
          })
      } else {
        done()
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
      this.onCloseRelationIssueDialog()
      this.loadData()
      this.$emit('update-issue')
    },
    toggleIssueMatrixDialog(row) {
      this.issueMatrixDialog.visible = !this.issueMatrixDialog.visible
      this.issueMatrixDialog.row = row
    },
    getRowClass() {
      return 'cursor-context-menu'
    }
  }
}
</script>

<style lang="scss" scoped>
.add-issue-inline {
  @apply pl-5;
}

.wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
}

.table-css {
  height: 100% !important;

  > > > table {
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

> > > .cursor-context-menu {
  cursor: context-menu;
}
</style>
