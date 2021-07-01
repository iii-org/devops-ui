<template>
  <div>
    <contextmenu ref="contextmenu">
      <template v-if="Object.keys(row).length>2">
        <contextmenu-item class="menu-title">{{ row.name }}</contextmenu-item>
        <contextmenu-submenu v-for="column in filterColumnOptions" :key="column.id" :title="column.label">
          <contextmenu-item v-for="item in $data[column.value]" :key="item.id"
                            :disabled="item.disabled||getContextMenuCurrentValue(column, item)"
                            :class="{current:getContextMenuCurrentValue(column, item)}"
                            @click="onUpdate(column.value+'_id', item.id)"
          >
            <i v-if="getContextMenuCurrentValue(column, item)" class="el-icon-check" />
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
        <contextmenu-item @click="toggleIssueMatrixDialog">議題關聯圖</contextmenu-item>
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
            <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous text-h6"
                       @click="toggleRelationDialog(relationDialog.target)"
            >
              {{ $t('general.Back') }}
            </el-button>
            <span class="text-h6">{{ $t('general.Settings', {name:$t('Issue.'+relationDialog.target+'Issue')}) }}</span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button type="primary" @click="onSaveCheckRelationIssue">
              {{ $t('general.Save') }}
            </el-button>
          </el-col>
        </el-row>
      </div>
      <SettingRelationIssue v-if="relationDialog.visible" ref="settingRelationIssue" :row.sync="row" :target.sync="relationDialog.target" />
    </el-dialog>
    <el-dialog
      :visible.sync="issueMatrixDialog.visible"
      width="80%"
      top="20px"
      append-to-body
      :title="'議題關聯圖(#'+row.id+' - '+ row.name+')'"
    >
      <IssueMatrix v-if="issueMatrixDialog.visible" :row.sync="row" :tracker="selectionOptions['tracker']" :status="selectionOptions['status']" />
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
import { getCheckIssueClosable, updateIssue } from '@/api/issue'
import { getProjectVersion } from '@/api/projects'
import { cloneDeep } from 'lodash'
// TODO:row.project.id
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
    // TODO:row.project.id
    ...mapGetters(['selectedProjectId']),
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
        console.log('ya')
        await this.initOptions()
        if (Object.keys(this.row).length > 2) {
          await this.getClosable()
          await this.loadVersionList()
        }
      }
    }
  },
  async mounted() {
    await this.initOptions()
    if (Object.keys(this.row).length > 2) {
      await this.getClosable()
      await this.loadVersionList()
    }
  },
  methods: {
    initOptions() {
      const option = JSON.parse(JSON.stringify(this.selectionOptions))
      Object.keys(option).forEach((item) => {
        this[item] = option[item]
      })
    },
    async getClosable() {
      const closable = await getCheckIssueClosable(this.row.id)
      this.$set(this, 'checkClosable', closable.data)
      await this.getDynamicStatusList()
    },
    async loadVersionList() {
      const params = { status: 'open,locked' }
      if (this.row.fixed_version_id) {
        params['force_id'] = this.row.fixed_version_id
      }
      // TODO:row.project.id
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = versionList.data.versions
    },
    getDynamicStatusList() {
      const _this = this
      const option = cloneDeep(this.selectionOptions)
      this.status = option['status'].map((item) => {
        if (!_this.checkClosable && item.is_closed === true) {
          item.disabled = true
          item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
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
          updateApi.push(updateIssue(getSettingRelationIssue.row.id, { parent_id: getSettingRelationIssue.parent_id }))
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
.menu-title{
  background: #d2d2d2;
  max-width:125px;
  height: 25px;
  line-height: 1.25;
  padding: 3px 3px 3px 5px;
  margin:0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.current{
  color:$success !important;
  font-weight: 700;
}
</style>
