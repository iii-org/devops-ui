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
          :disabled="column.value === 'priority' ? row.has_children : false"
        >
          <contextmenu-item
            v-for="item in getOptionsData(column.value, row.has_children)"
            :key="getId(column.value, item)"
            :disabled="column.value !== 'tags' && (item.disabled || getContextMenuCurrentValue(column, item))"
            :class="{ current: getContextMenuCurrentValue(column, item), [item.class]: item.class }"
            @click="onUpdate(column.value + '_id', item.id)"
          >
            <em v-if="getContextMenuCurrentValue(column, item)" class="el-icon-check" />
            <em v-if="item.id === 'null'" class="el-icon-circle-close" />
            {{ getSelectionLabel(item) }} {{ item.message }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-submenu v-permission="permission" :title="$t('Issue.DoneRatio')" :disabled="row.has_children">
          <contextmenu-item
            v-for="item in done_ratio"
            :key="item.id"
            :disabled="getContextMenuCurrentValue('done_ratio', item)"
            :class="{ current: getContextMenuCurrentValue('done_ratio', item) }"
            @click="onUpdate('done_ratio', item.id)"
          >
            <i v-if="getContextMenuCurrentValue('done_ratio', item)" class="el-icon-check" />
            {{ getSelectionLabel(item) }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-item v-permission="permission" divider />
        <contextmenu-item v-permission="permission" @click="toggleRelationDialog('Parent')">{{
          $t('Issue.ParentIssue')
        }}</contextmenu-item>
        <contextmenu-submenu v-permission="permission" :title="$t('Issue.ChildrenIssue')">
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
              class="previous text-title"
              @click="toggleRelationDialog(relationDialog.target)"
            >
              {{ $t('general.Back') }}
            </el-button>
            <span class="text-title">
              {{ $t('general.Settings', { name: $t('Issue.' + relationDialog.target + 'Issue') }) }}
            </span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button type="primary" @click="onSaveCheckRelationIssue">
              {{ $t('general.Save') }}
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
      :title="$t('Issue.AddIssue')"
      :visible.sync="addTopicDialogVisible"
      width="50%"
      top="5px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
    >
      <AddIssue
        v-if="addTopicDialogVisible"
        ref="AddIssue"
        :project-id="row.project.id"
        :parent-id="parentId"
        :parent-name="parentName"
        :prefill="form"
        :save-data="saveIssue"
        @loading="loadingUpdate"
        @add-topic-visible="handleCloseDialog"
      />
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" @click="handleAdvancedClose">{{ $t('general.Cancel') }}</el-button>
        <el-button id="dialog-btn-confirm" :loading="LoadingConfirm" type="primary" @click="handleAdvancedSave">
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { directive, Contextmenu, ContextmenuItem, ContextmenuSubmenu } from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
import SettingRelationIssue from '@/views/Project/IssueList/components/SettingRelationIssue'
import IssueMatrix from '@/views/Project/IssueDetail/components/IssueMatrix'
import { addIssue, getCheckIssueClosable, updateIssue } from '@/api/issue'
import { getProjectUserList, getProjectVersion, getTagsByProject } from '@/api/projects'
import { cloneDeep } from 'lodash'
import { mapGetters } from 'vuex'
import AddIssue from './AddIssue'

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
      default: () => ({ fixed_version: { id: 'null' }, assigned_to: { id: 'null' } })
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
    }
  },
  data() {
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
      LoadingConfirm: false,
      parentId: 0,
      parentName: null,
      form: {},
      originForm: {}
    }
  },
  computed: {
    ...mapGetters(['tracker', 'status', 'priority', 'fixedVersionShowClosed']),
    done_ratio() {
      const result = []
      for (let num = 0; num <= 100; num += 10) {
        result.push({ id: num, name: num + ' %' })
      }
      return result
    },
    permission() {
      return ['Administrator', 'Project Manager', 'Engineer']
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
    if (Object.keys(this.row).length > 2) {
      await this.getClosable()
    }
  },
  methods: {
    initOptions() {
      const option = JSON.parse(JSON.stringify(this.selectionOptions))
      Object.keys(option).forEach((item) => {
        this[item] = option[item]
      })
    },
    getOptionsData(option_name, has_children) {
      if (option_name === 'status') return this.getDynamicStatusList(has_children)
      return this[option_name]
    },
    async loadSelectionList() {
      await this.loadProjectSelectionList(this.fixedVersionShowClosed, true, true)
    },
    async loadProjectSelectionList(status, user, tags) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      if (this.row.project && this.row.project.id !== '') {
        const getAPI = [getProjectVersion(this.row.project.id, params)]
        if (user) {
          getAPI.push(getProjectUserList(this.row.project.id))
        }
        if (tags) {
          getAPI.push(getTagsByProject(this.row.project.id))
        }
        await Promise.all(getAPI).then((res) => {
          const [versionList, assigneeList, tagsList] = res.map((item) => item.data)
          this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.versions]
          if (user) {
            this.assigned_to = [
              { name: this.$t('Issue.Unassigned'), id: 'null', login: 'null' },
              ...assigneeList.user_list
            ]
          }
          if (tags) {
            this.tags = tagsList.tags
          }
        })
      }
    },
    async getClosable() {
      const closable = await getCheckIssueClosable(this.row.id)
      this.$set(this, 'checkClosable', closable.data)
    },
    getId(option, item) {
      if (option === 'assigned_to') return item.login
      return item.id
    },
    getDynamicStatusList(has_children) {
      const _this = this
      let option
      if (this.selectionOptions['status']) {
        option = cloneDeep(this.selectionOptions)
      } else {
        option = cloneDeep({ status: this.status })
      }
      return option['status'].map((item) => {
        if (!_this.checkClosable && item.is_closed === true && has_children) {
          item.disabled = true
          item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
        }
        if (
          (!_this.row.assigned_to ||
            !_this.row.assigned_to.id ||
            _this.row.assigned_to.id === '' ||
            _this.row.assigned_to.id === 'null') &&
          item.id > 1
        ) {
          item.disabled = true
          item.message = '(' + this.$t('Issue.NoAssignee') + ')'
        }
        return item
      })
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
        this.$emit('update')
      } catch (e) {
        console.error(e)
      }
    },
    async onUpdate(column, value) {
      try {
        let data = { [column]: value }
        if (column === 'tags_id') {
          let tags = []
          if (this.row.tags) {
            tags = this.row.tags.map((item) => item.id)
          }
          const findTags = tags.findIndex((item) => item === value)
          if (findTags >= 0) {
            tags.splice(findTags, 1)
          } else {
            tags.push(value)
          }
          data = { tags: tags.join(',') }
        }
        await updateIssue(this.row.id, data)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.$emit('update')
      } catch (e) {
        console.error(e)
      }
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
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    getContextMenuCurrentValue(column, item) {
      if (typeof column === 'string') {
        return this.row[column] ? this.row[column] === item.id : item.id === 0
      }
      if (!this.row[column.value]) return item.id === 'null'
      if (Array.isArray(this.row[column.value]))
        return this.row[column.value].map((subItem) => subItem.id).includes(item.id)
      if (!this.row[column.value].id) return item.id ? item.id === 'null' : false
      return this.row[column.value].id === item.id
    },
    handleUpdateIssue() {
      this.$emit('update')
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
        parent,
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
      this.form.parent_id = parent ? parent.id : ''
      this.form.project_id = project ? project.id : ''
      this.form.assigned_to_id = assigned_to ? assigned_to.id : ''
      this.form.name = copy ? name + '(' + this.$t('Issue.Copy') + ')' : name
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
        this.setFormData(this.row, copy)
        this.parentId = 0
        this.parentName = null
      } else {
        this.parentId = this.row.id
        this.parentName = this.row.name
      }
      this.addTopicDialogVisible = true
    },
    loadingUpdate(value) {
      this.LoadingConfirm = value
    },
    async saveIssue(data) {
      return await addIssue(data)
        .then((res) => {
          // noinspection JSCheckFunctionSignatures
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.LoadingConfirm = false
          this.addTopicDialogVisible = false
          this.$emit('update')
          this.$refs['AddIssue'].form.name = ''
          return res
        })
        .catch((error) => {
          return error
        })
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
  @apply text-success #{!important};
  font-weight: 700;
}
</style>
