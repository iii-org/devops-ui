<template>
  <div>
    <contextmenu ref="contextmenu">
      <template v-if="Object.keys(row).length > 2">
        <contextmenu-item class="menu-title">{{ row.name }}</contextmenu-item>
        <contextmenu-submenu
          v-for="column in filterColumnOptions"
          :key="column.id"
          v-permission="permission"
          :title="column.label"
          :disabled="(column.value === 'priority' ? row.has_children : false) || isForceParent"
        >
          <contextmenu-item
            v-for="item in getOptionsData(column.value)"
            :key="getId(column.value, item)"
            :disabled="column.value !== 'tags' && (item.disabled || getContextMenuCurrentValue(column, item))"
            :class="{ current: getContextMenuCurrentValue(column, item), [item.class]: item.class }"
            @click="onUpdate(column.value + '_id', item)"
          >
            <em v-if="getContextMenuCurrentValue(column, item)" class="el-icon-check" />
            <em v-if="item.id === 'null'" class="el-icon-circle-close" />
            {{ getSelectionLabel(item) }} {{ item.message }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-submenu
          v-permission="permission"
          title="新標籤"
        >
          <contextmenu-item class="tag-contextmenu-item">
            <el-select
              v-model="searchTag"
              multiple
              filterable
              clearable
              remote
              placeholder="搜尋標籤名"
              size="mini"
              :remote-method="remoteMethod"
              @click.stop.native="() => { return 'Just try to keep the contextmenu' }"
            />
            <ul
              v-for="tag in tagOptions"
              :key="tag.id"
              :class="{ current: getContextMenuCurrentValue(filterColumnOptions[2], tag), [tag.class]: tag.class }"
              style="padding-left: 0; color: #333;"
            >
              <li class="tag" @click="onUpdate(`tags_id`, tag)">
                <em v-if="getContextMenuCurrentValue(filterColumnOptions[2], tag)" class="el-icon-check" />
                <em v-if="tag.id === 'null'" class="el-icon-circle-close" />
                {{ tag.name }}
              </li>
            </ul>
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-submenu
          v-permission="permission"
          :title="$t('Issue.DoneRatio')"
          :disabled="row.has_children || isForceParent"
        >
          <contextmenu-item
            v-for="item in done_ratio"
            :key="item.id"
            :disabled="getContextMenuCurrentValue('done_ratio', item)"
            :class="{ current: getContextMenuCurrentValue('done_ratio', item) }"
            @click="onUpdate('done_ratio', item)"
          >
            <em v-if="getContextMenuCurrentValue('done_ratio', item)" class="el-icon-check" />
            {{ getSelectionLabel(item) }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-item v-permission="permission" divider />
        <contextmenu-item v-permission="permission" @click="toggleRelationDialog('Parent')">{{
          $t('Issue.ParentIssue')
        }}</contextmenu-item>
        <contextmenu-submenu
          v-permission="permission"
          :title="$t('Issue.ChildrenIssue')"
          :disabled="isForceParent"
        >
          <contextmenu-item @click="toggleRelationDialog('Children')">{{
            $t('general.Settings', { name: $t('Issue.ChildrenIssue') })
          }}</contextmenu-item>
          <contextmenu-item @click="advancedAddIssue(false)">{{ $t('Issue.AddSubIssue') }}</contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-item @click="toggleIssueMatrixDialog">{{ $t('Issue.TraceabilityMatrix') }}</contextmenu-item>
        <contextmenu-item v-permission="permission" divider />
        <contextmenu-item v-permission="permission" @click="advancedAddIssue(true)">{{
          $t('Issue.CopyIssue')
        }}</contextmenu-item>
      </template>
    </contextmenu>
    <el-dialog
      :visible.sync="relationDialog.visible"
      :close-on-click-modal="false"
      :show-close="false"
      width="80%"
      append-to-body
    >
      <div slot="title">
        <el-row slot="title" type="flex" align="middle">
          <el-col :xs="24" :md="16">
            <span class="text-title">
              {{ $t('general.Settings', { name: $t('Issue.' + relationDialog.target + 'Issue') }) }}
            </span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button class="buttonPrimary" @click="onSaveCheckRelationIssue">
              {{ $t('general.Save') }}
            </el-button>
            <el-button class="buttonSecondaryReverse" @click="toggleRelationDialog(relationDialog.target)">
              {{ $t('general.Close') }}
            </el-button>
          </el-col>
        </el-row>
      </div>
      <SettingRelationIssue
        v-if="relationDialog.visible"
        ref="settingRelationIssue"
        :row.sync="row"
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
      :title="$t('Issue.TraceabilityMatrix') + '(#' + row.id + ' - ' + row.name + ')'"
    >
      <IssueMatrix
        v-if="issueMatrixDialog.visible"
        :row.sync="row"
        :tracker="tracker"
        :status="status"
        @update-issue="handleUpdateIssue"
      />
    </el-dialog>
    <el-dialog
      v-if="row.project"
      :visible.sync="addTopicDialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      width="50%"
      top="5px"
      destroy-on-close
      append-to-body
    >
      <template slot="title">
        <el-row slot="title" type="flex" align="middle">
          <el-col :xs="24" :md="16">
            <span class="text-title">
              {{ $t('Issue.AddIssue') }}
            </span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button
              v-if="parentId!==0"
              class="buttonPrimary"
              @click="handleAdvancedImport"
            >
              {{ $t('Issue.ImportParentIssueData') }}
            </el-button>
            <el-button
              class="buttonSecondaryReverse"
              @click="handleCloseDialog()"
            >
              {{ $t('general.Close') }}
            </el-button>
          </el-col>
        </el-row>
      </template>
      <AddIssue
        v-if="addTopicDialogVisible"
        ref="AddIssue"
        :project-id="row.project.id"
        :parent-id="parentId"
        :parent-name="parentName"
        :prefill="form"
        :save-data="saveIssue"
        @has-children="hasChildren"
        @loading="loadingUpdate"
        @add-topic-visible="handleCloseDialog"
      />
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" class="buttonSecondaryReverse" @click="handleAdvancedClose">{{ $t('general.Cancel') }}</el-button>
        <el-button id="dialog-btn-confirm" :loading="loadingConfirm" class="buttonPrimary" @click="handleAdvancedSave">
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectUserList, getProjectVersion, getTagsByProject } from '@/api/projects'
import { addIssue, getCheckIssueClosable, updateIssue } from '@/api/issue'
import { getIssueStrictTracker, getIssueForceTracker } from '@/api_v2/issue'
import { cloneDeep } from 'lodash'
import { directive, Contextmenu, ContextmenuItem, ContextmenuSubmenu } from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
import { AddIssue } from './'
import SettingRelationIssue from '@/views/Project/IssueList/components/SettingRelationIssue'
import IssueMatrix from '@/views/Project/IssueDetail/components/IssueMatrix'

const getAPI = {
  fixed_version: [getProjectVersion, 'versions'],
  assigned_to: [getProjectUserList, 'user_list'],
  tags: [getTagsByProject, 'tags'],
  strictTracker: [getIssueStrictTracker],
  forceTracker: [getIssueForceTracker, 'need_fatherissue_trackers']
}

const rowFormData = () => ({})

export default {
  name: 'ContextMenu',
  components: {
    AddIssue,
    SettingRelationIssue,
    IssueMatrix,
    Contextmenu,
    ContextmenuItem,
    ContextmenuSubmenu
  },
  directives: {
    contextmenu: directive
  },
  props: {
    row: {
      type: Object,
      default: () => ({ fixed_version: { id: 'null' }, assigned_to: { id: 'null' }})
    },
    visible: {
      type: Boolean,
      default: false
    },
    filterColumnOptions: {
      type: Array,
      default: () => []
    },
    selectionOptions: {
      type: Object,
      default: () => ({})
    },
    simpleAddIssue: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.assignedError = {
      title: this.$t('Kanban.assignedErrorTitle'),
      content: this.$t('Kanban.assignedErrorContent')
    }
    return {
      relationDialog: {
        visible: false,
        target: 'Parent'
      },
      issueMatrixDialog: {
        visible: false
      },
      checkClosable: false,
      assigned_to: [],
      fixed_version: [],
      tags: [],
      addTopicDialogVisible: false,
      loadingConfirm: false,
      parentId: 0,
      parentName: null,
      form: {},
      originForm: {},
      showAlert: false,
      errorMsg: [],
      strictTracker: [],
      forceTracker: [],
      enableForceTracker: false,
      searchTag: '',
      tagOptions: []
    }
  },
  computed: {
    ...mapGetters([
      'tracker',
      'status',
      'priority',
      'fixedVersionShowClosed',
      'selectedProjectId'
    ]),
    done_ratio() {
      const result = []
      for (let num = 0; num <= 100; num += 10) {
        result.push({ id: num, name: num + ' %' })
      }
      return result
    },
    checkIssueAssignedToStatus() {
      return (
        !this.row.assigned_to ||
        !this.row.assigned_to.id ||
        this.row.assigned_to.id === '' ||
        this.row.assigned_to.id === 'null'
      )
    },
    permission() {
      return ['Administrator', 'Project Manager', 'Engineer']
    },
    isForceParent() {
      if (!this.enableForceTracker || !this.row.id) return false
      return this.forceTracker.findIndex((tracker) => tracker.id === this.row.tracker.id) !== -1 && !this.row.has_father
    }
  },
  watch: {
    row: {
      deep: true,
      async handler() {
        if (Object.keys(this.row).length > 2 && this.selectionOptions['assigned_to']) {
          await this.initOptions()
          await this.loadProjectSelectionList(this.fixedVersionShowClosed)
        } else {
          await this.loadSelectionList()
        }
        if (Object.keys(this.row).length > 2) {
          await this.getClosable()
        }
      }
    }
  },
  async mounted() {
    if (Object.keys(this.row).length > 2 && Object.keys(this.selectionOptions).length > 0) {
      await this.initOptions()
      await this.loadProjectSelectionList(this.fixedVersionShowClosed)
    } else {
      await this.loadSelectionList()
    }
    // if (Object.keys(this.row).length > 2) {
    //   await this.getClosable()
    // }
  },
  methods: {
    initOptions() {
      const option = JSON.parse(JSON.stringify(this.selectionOptions))
      Object.keys(option).forEach((item) => {
        this[item] = option[item]
      })
    },
    getOptionsData(option_name) {
      if (option_name === 'status') return this.getDynamicStatusList()
      if (option_name === 'tracker' && this.enableForceTracker && !this.row.has_father) return this.strictTracker
      return this[option_name]
    },
    async loadSelectionList() {
      await this.loadProjectSelectionList(this.fixedVersionShowClosed, true, true)
    },
    async loadProjectSelectionList(fixed_version, assigned_to, tags) {
      let params = { status: 'open,locked' }
      if (fixed_version) {
        params = { status: 'open,locked,closed' }
      }
      Object.keys(getAPI).forEach((key) => {
        this.loadSelection(key, params, [key])
      })
    },
    async loadSelection(column, params, lazyLoad) {
      if (lazyLoad) {
        const projectId =
          Object.prototype.hasOwnProperty.call(this.row, 'project')
            ? this.row.project.id : this.selectedProjectId
        if (projectId >= 0) {
          const res = await getAPI[column][0](projectId, params)
          switch (column) {
            case 'fixed_version':
              this[column] = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...res.data[getAPI[column][1]]]
              break
            case 'assigned_to':
              this[column] = [
                { name: this.$t('Issue.Unassigned'), id: 'null', login: 'null' },
                ...res.data[getAPI[column][1]]
              ]
              break
            case 'strictTracker':
              this[column] = (await getAPI[column][0]({ new: true, project_id: projectId })).data
              break
            case 'forceTracker':
              this[column] = [...res.data[getAPI[column][1]]]
              this.enableForceTracker = res.data.enable
              break
            default:
              this[column] = res.data[getAPI[column][1]]
          }
        }
      }
      this.setDefaultTagOptions()
    },
    async getClosable() {
      const closable = await getCheckIssueClosable(this.row.id)
      this.$set(this, 'checkClosable', closable.data)
    },
    getId(option, item) {
      if (option === 'assigned_to') return item.login
      return item.id
    },
    getDynamicStatusList() {
      let option
      if (this.selectionOptions['status']) {
        option = cloneDeep(this.selectionOptions)
      } else {
        option = cloneDeep({ status: this.status })
      }
      return option['status'].map((item) => this.formatDynamicStatusList(item))
    },
    formatDynamicStatusList(item) {
      if (!this.checkClosable && item.is_closed && this.row.has_children) {
        item.disabled = true
        item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
      }
      if (this.checkIssueAssignedToStatus && item.id > 1) {
        item.disabled = true
        item.message = '(' + this.$t('Issue.NoAssignee') + ')'
      }
      return item
    },
    onSaveCheckRelationIssue() {
      this.$refs.settingRelationIssue.$refs.issueForm.validate((valid) => {
        if (valid) {
          this.onSaveRelationIssue()
        }
      })
    },
    getFormData(data) {
      const formData = new FormData()
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item])
      })
      return formData
    },
    async onSaveRelationIssue() {
      try {
        const getSettingRelationIssue = this.$refs['settingRelationIssue']
        const updateApi = []
        if (getSettingRelationIssue.target === 'Parent') {
          const formData = this.getFormData({ parent_id: getSettingRelationIssue.form.parent_id })
          updateApi.push(
            updateIssue(getSettingRelationIssue.row.id, formData)
          )
        } else if (getSettingRelationIssue.target === 'Children') {
          const appendFormData = this.getFormData({ parent_id: getSettingRelationIssue.row.id })
          const removeFormData = this.getFormData({ parent_id: '' })
          getSettingRelationIssue.children['append'].forEach((item) => {
            updateApi.push(updateIssue(item, appendFormData))
          })
          getSettingRelationIssue.children['remove'].forEach((item) => {
            updateApi.push(updateIssue(item, removeFormData))
          })
        }
        await Promise.all(updateApi)
        this.toggleRelationDialog(getSettingRelationIssue.target)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.$emit('update')
        this.$emit('update-card', this.row.id)
      } catch (e) {
        console.error(e)
      }
    },
    async onUpdate(column, item) {
      if (this.row.assigned_to && this.row.assigned_to.name && item.name === 'Active') {
        const error = 'assignedError'
        this.handleErrorAlert(error)
        this.showErrorAlert(this.errorMsg)
        return
      }
      try {
        let data = { [column]: item.id }
        if (column === 'tags_id') {
          data = this.setTags(column, item.id)
        }
        if (column === 'assigned_to_id') {
          data = this.setStatusId(column, item.id, data)
        }
        const formData = this.getFormData(data)
        const res = await updateIssue(this.row.id, formData)
        this.row[column.replace('_id', '')] = res.data[column.replace('_id', '')]
        this.$emit('update')
        this.$emit('update-card', this.row.id)
      } catch (e) {
        console.error(e)
      }
    },
    hasChildren() {
      this.row.has_children = true
    },
    handleErrorAlert(key) {
      const { title, content } = this[key]
      this.errorMsg.push(this.getErrorAlert(title, content))
    },
    getErrorAlert(title, content) {
      const h = this.$createElement
      return h('li', [h('b', title), h('p', content)])
    },
    showErrorAlert(errorMsg) {
      const h = this.$createElement
      if (!this.showAlert) {
        this.showAlert = true
        this.$msgbox({ message: h('ul', errorMsg), title: this.$t('Kanban.ChangeIssueError') }).then(() => {
          this.showAlert = false
        })
      }
      this.errorMsg = []
    },
    setTags(column, value) {
      const tags = this.row.tags ? this.row.tags.map((item) => item.id) : []
      const findTags = tags.findIndex((item) => item === value)
      if (findTags >= 0) {
        tags.splice(findTags, 1)
      } else {
        tags.push(value)
      }
      return { tags: tags.join(',') }
    },
    setStatusId(column, id, data) {
      if (this.row.status.id === 1 && id) { // change status to assigned if user add assignee
        data = {
          [column]: id,
          status_id: 2
        }
      }
      return data
    },
    toggleRelationDialog(target) {
      this.relationDialog.visible = !this.relationDialog.visible
      this.relationDialog.target = target
    },
    toggleIssueMatrixDialog() {
      this.issueMatrixDialog.visible = !this.issueMatrixDialog.visible
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ` (${this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status})`
      }
      return result
    },
    getContextMenuCurrentValue(column, item) {
      if (typeof column === 'string') {
        return this.row[column] ? this.row[column] === item.id : item.id === 0
      }
      if (!this.row[column.value]) return item.id === 'null'
      if (Array.isArray(this.row[column.value])) {
        return this.row[column.value].map((subItem) => subItem.id).includes(item.id)
      }
      if (!this.row[column.value].id) return item.id ? item.id === 'null' : false
      return this.row[column.value].id === item.id
    },
    handleUpdateIssue() {
      this.$emit('update')
      this.$emit('update-row', this.row.id)
      this.$emit('update-card', this.row.id)
    },
    handleAdvancedImport() {
      this.setFormData(this.row, true)
      this.$refs['AddIssue'].handleImport()
    },

    handleAdvancedClose() {
      this.$refs['AddIssue'].handleClose()
    },
    handleAdvancedSave() {
      this.$refs['AddIssue'].handleSave()
    },
    handleCloseDialog() {
      this.addTopicDialogVisible = false
    },
    setFormData(data, copy) {
      const {
        project,
        assigned_to,
        fixed_version,
        name,
        tracker,
        status,
        priority,
        estimated_hours,
        done_ratio,
        start_date,
        due_date,
        description
      } = data
      this.form = {}
      this.form.project_id = project ? project.id : ''
      this.form.assigned_to_id = assigned_to ? assigned_to.id : ''
      this.form.name = (copy && this.parentId === 0) ? name + '(' + this.$t('Issue.Copy') + ')' : name
      this.form.fixed_version_id = fixed_version ? fixed_version.id : ''
      this.form.tracker_id = tracker.id
      this.form.status_id = status.id
      this.form.priority_id = priority.id
      this.form.estimated_hours = estimated_hours
      this.form.done_ratio = done_ratio
      this.form.start_date = start_date === null ? '' : start_date
      this.form.due_date = due_date === null ? '' : due_date
      this.form.description = description === null ? '' : description
      this.originForm = Object.assign({}, this.form)
    },
    advancedAddIssue(copy) {
      if (copy) {
        this.parentId = 0
        this.parentName = null
        this.setFormData(this.row, copy)
      } else {
        this.form = Object.assign({}, rowFormData())
        this.parentId = this.row.id
        this.parentName = this.row.name
      }

      if (!this.simpleAddIssue) {
        this.addTopicDialogVisible = true
        return
      }

      const store = this.$parent.$refs['issueList'].layout.store
      const { expandRows } = store.states
      const expandIndex = expandRows.findIndex(x => x.id === this.row.id)
      if (expandIndex === -1) {
        store.toggleRowExpansion(this.row)
      }
      this.row.showQuickAddIssue = true
    },
    loadingUpdate(value) {
      this.loadingConfirm = value
    },
    async saveIssue(data) {
      this.loadingConfirm = true
      const res = await addIssue(data)
      // this.$message({
      //   title: this.$t('general.Success'),
      //   message: this.$t('Notify.Added'),
      //   type: 'success'
      // })
      this.$emit('backToFirstPage')
      this.$emit('update', Number(data.get('assigned_to_id')))
      this.addTopicDialogVisible = false
      // this.$refs['quickAddIssue'].form.name = ''
      this.loadingConfirm = false
      return res
    },
    remoteMethod(query) {
      if (query !== '') {
        this.tagOptions = this.tags.filter(tag => {
          return tag.name.toLowerCase().indexOf(query.toLowerCase()) > -1
        })
      } else {
        this.setDefaultTagOptions()
      }
    },
    setDefaultTagOptions() {
      this.tagOptions = this.tags.slice(0, 5)
    }
  }
}
</script>

<style lang="scss" scoped>
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
  @apply font-bold text-success #{!important};
}

.tag-contextmenu-item {
  width: 200px;
  background-color: #ffffff;
  color: #333;
}

.tag {
  list-style: none;
  text-align: left;
  padding: 5px 14px;
  font-size: 14px;
  &:hover {
    background: #46a0fc;
  }
}
</style>
