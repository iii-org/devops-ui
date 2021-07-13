<template>
  <div>
    <contextmenu ref="contextmenu">
      <template v-if="Object.keys(row).length>2">
        <contextmenu-item class="menu-title">{{ row.name }}</contextmenu-item>
        <contextmenu-submenu v-for="column in filterColumnOptions" :key="column.id" :title="column.label">
          <contextmenu-item v-for="item in $data[column.value]" :key="getId(column.value,item)"
                            :disabled="item.disabled||getContextMenuCurrentValue(column, item)"
                            :class="{current:getContextMenuCurrentValue(column, item), [item.class]:item.class}"
                            @click="onUpdate(column.value+'_id', item.id)"
          >
            <i v-if="getContextMenuCurrentValue(column, item)" class="el-icon-check" />
            <i v-if="item.id==='null'" class="el-icon-circle-close" />
            {{ getSelectionLabel(item) }} {{ item.message }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-submenu :title="$t('Issue.DoneRatio')" :disabled="row.has_children">
          <contextmenu-item v-for="item in done_ratio" :key="item.id"
                            :disabled="getContextMenuCurrentValue('done_ratio', item)"
                            :class="{current:getContextMenuCurrentValue('done_ratio', item)}"
                            @click="onUpdate('done_ratio', item.id)"
          >
            <i v-if="getContextMenuCurrentValue('done_ratio', item)" class="el-icon-check" />
            {{ getSelectionLabel(item) }}
          </contextmenu-item>
        </contextmenu-submenu>
        <contextmenu-item divider />
        <contextmenu-item @click="toggleRelationDialog('Parent')">{{ $t('Issue.ParentIssue') }}</contextmenu-item>
        <contextmenu-item @click="toggleRelationDialog('Children')">{{ $t('Issue.ChildrenIssue') }}</contextmenu-item>
        <contextmenu-item @click="toggleIssueMatrixDialog">{{ $t('Issue.TraceabilityMatrix') }}</contextmenu-item>
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
            <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous text-title"
                       @click="toggleRelationDialog(relationDialog.target)"
            >
              {{ $t('general.Back') }}
            </el-button>
            <span class="text-title">{{ $t('general.Settings', { name: $t('Issue.' + relationDialog.target + 'Issue') })
            }}</span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button type="primary" @click="onSaveCheckRelationIssue">
              {{ $t('general.Save') }}
            </el-button>
          </el-col>
        </el-row>
      </div>
      <SettingRelationIssue v-if="relationDialog.visible" ref="settingRelationIssue" :row.sync="row"
                            :target.sync="relationDialog.target"
      />
    </el-dialog>
    <el-dialog
      :visible.sync="issueMatrixDialog.visible"
      width="80%"
      top="20px"
      append-to-body
      destroy-on-close
      :title="$t('Issue.TraceabilityMatrix')+'(#'+row.id+' - '+ row.name+')'"
    >
      <IssueMatrix v-if="issueMatrixDialog.visible" :row.sync="row" :tracker="tracker" :status="status"
                   @update-issue="handleUpdateIssue"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  directive,
  Contextmenu,
  ContextmenuItem,
  ContextmenuSubmenu
} from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'
import SettingRelationIssue from './SettingRelationIssue'
import IssueMatrix from '@/views/Project/IssueDetail/components/IssueMatrix'
import { getCheckIssueClosable, getIssuePriority, getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
import { getProjectUserList, getProjectVersion } from '@/api/projects'
import { cloneDeep } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  name: 'ContextMenu',
  components: {
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
      default: () => ([])
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
      status: [],
      assigned_to: [],
      priority: [],
      tracker: [],
      fixed_version: []
    }
  },
  computed: {
    ...mapGetters(['fixedVersionShowClosed']),
    done_ratio() {
      const result = []
      for (let num = 0; num <= 100; num += 10) {
        result.push({ id: num, name: num + ' %' })
      }
      return result
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
    async loadSelectionList() {
      await Promise.all([
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority()
      ]).then(res => {
        const [typeList, statusList, priorityList] = res.map(
          item => item.data
        )
        this.tracker = typeList
        this.status = statusList
        this.priority = priorityList
      })
      await this.loadProjectSelectionList(this.fixedVersionShowClosed, true)
    },
    async loadProjectSelectionList(status, user) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      if (this.row.project && this.row.project.id !== '') {
        const getAPI = [getProjectVersion(this.row.project.id, params)]
        if (user) {
          getAPI.push(getProjectUserList(this.row.project.id))
        }
        await Promise.all(getAPI).then(res => {
          const [versionList, assigneeList] = res.map(
            item => item.data
          )
          this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.versions]
          if (user) {
            this.assigned_to = [
              { name: this.$t('Issue.Unassigned'), id: 'null', login: 'null' },
              ...assigneeList.user_list
            ]
          }
        })
      }
    },
    async getClosable() {
      const closable = await getCheckIssueClosable(this.row.id)
      this.$set(this, 'checkClosable', closable.data)
      await this.getDynamicStatusList()
    },
    getId(option, item) {
      if (option === 'assigned_to') return item.login
      return item.id
    },
    getDynamicStatusList() {
      const _this = this
      let option
      if (this.selectionOptions['status']) {
        option = cloneDeep(this.selectionOptions)
      } else {
        option = cloneDeep({ status: this.status })
      }
      this.status = option['status'].map((item) => {
        if (!_this.checkClosable && item.is_closed === true) {
          item.disabled = true
          item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
        }
        if ((!_this.row.assigned_to.id || _this.row.assigned_to.id === '' || _this.row.assigned_to.id === 'null') && item.id > 1) {
          item.disabled = true
          item.message = '(' + this.$t('Issue.NoAssignee') + ')'
        }
        return item
      })
    },
    onSaveCheckRelationIssue() {
      this.$refs.settingRelationIssue.$refs.issueForm.validate(valid => {
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
          updateApi.push(updateIssue(getSettingRelationIssue.row.id, { parent_id: getSettingRelationIssue.form.parent_id }))
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
        console.log(e)
      }
    },
    async onUpdate(column, value) {
      try {
        await updateIssue(this.row.id, { [column]: value })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.$emit('update')
      } catch (e) {
        console.log(e)
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
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    getContextMenuCurrentValue(column, item) {
      if (typeof column === 'string') {
        return (this.row[column]) ? this.row[column] === item.id : item.id === 0
      }
      if (!this.row[column.value].id) return item.id === 'null'
      return this.row[column.value].id === item.id
    },
    handleUpdateIssue() {
      this.$emit('update')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

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
  color: $success !important;
  font-weight: 700;
}
</style>
