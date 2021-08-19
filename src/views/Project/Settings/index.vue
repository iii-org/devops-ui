<template>
  <div class="app-container">
    <ProjectListSelector :has-unsaved-changes="hasUnsavedChanges" @checkUnsavedChanges="checkUnsavedChanges" />
    <el-divider />
    <el-tabs v-model="tabActiveName" type="card" :before-leave="beforeTabsLeave" @tab-click="handleTableClick">
      <el-tab-pane :label="$t('ProjectSettings.GeneralSettings')" name="generalSettings">
        <el-row :gutter="10">
          <el-col class="mb-4" :sm="24" :md="14" :lg="15">
            <el-card shadow="never">
              <el-collapse v-model="activeNames">
                <ProjectVersions />
              </el-collapse>
            </el-card>
          </el-col>
          <el-col class="mb-4" :sm="24" :md="10" :lg="9">
            <el-card shadow="never">
              <el-collapse v-model="activeNames">
                <PipelineSettings />
              </el-collapse>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col class="mb-4" :xs="24">
            <el-card shadow="never">
              <el-collapse v-model="activeNames">
                <ProjectMembers />
              </el-collapse>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane :label="$t('ProjectSettings.NotifySettings')" name="notifySettings">
        <el-card class="mx-5">
          <div class="flex justify-between mt-3">
            <div class="font-medium text-lg">{{ $t('ProjectSettings.IssueReminderFeature') }}</div>
            <div>
              <el-switch
                v-model="isToggle"
                active-color="#13ce66"
                inactive-color="#ff4949"
                class="mr-5"
                :disabled="disableSwitch"
                :active-text="$t('general.Enable')"
                :inactive-text="$t('general.Disable')"
                @change="toggleSwitch"
              />
              <el-button type="primary" :disabled="disableSave" @click="handleSave">{{ $t('general.Save') }}</el-button>
            </div>
          </div>
          <el-divider />
          <el-table
            v-if="isToggle"
            v-loading="listLoading"
            :element-loading-text="$t('Loading')"
            :data="alertListData"
            border
            fit
          >
            <el-table-column type="index" align="center" :label="$t('ProjectSettings.Index')" width="100" />
            <el-table-column align="center" :label="$t('ProjectSettings.NotificationConditions')">
              <template slot-scope="scope">
                <span v-if="scope.row.condition === 'comming'">{{ $t('ProjectSettings.Comming') }}</span>
                <span v-else>{{ $t('ProjectSettings.Unchange') }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('ProjectSettings.Days')">
              <template slot-scope="scope">
                <el-input v-show="!scope.row.disabled" v-model="scope.row.days" type="text" />
                <span v-show="scope.row.disabled">{{ scope.row.days }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('ProjectSettings.Status')">
              <template slot-scope="scope">
                <el-tag :type="scope.row.disabled ? 'danger' : 'success'">
                  {{ scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('ProjectSettings.Actions')">
              <template slot-scope="scope">
                <el-button size="mini" @click="toggleUsage(scope.row)">
                  <div class="flex items-center">
                    <span class="dot" :class="scope.row.disabled ? 'bg-success' : 'bg-danger'" />
                    <span class="ml-2" :class="scope.row.disabled ? 'text-success' : 'text-danger'">
                      {{ !scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
                    </span>
                  </div>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="text-center">{{ $t('ProjectSettings.NotYetEnabled') }}</div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :title="$t('general.Warning')"
      :visible.sync="dialogVisible"
      top="40vh"
      width="420px"
      destroy-on-close
    >
      <span>
        <i class="el-icon-warning text-lg" style="color: #E6A23C;" />
        <span class="text-base">{{ $t('Notify.UnSavedChanges') }}</span>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" @click="handleConfirmLeave">{{ $t('general.Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ProjectVersions, ProjectMembers, PipelineSettings } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { changeProjectAlertSettings, getAlertSettingsByProject, updateAlertSettingsByProject } from '@/api/alert'

export default {
  name: 'ProjectSettings',
  components: { ProjectListSelector, ProjectVersions, PipelineSettings, ProjectMembers },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      activeNames: [],
      tabActiveName: 'generalSettings',
      disableSave: false,
      disableSwitch: false,
      isToggle: false,
      listLoading: false,
      alertListData: [],
      originData: [],
      dialogVisible: false,
      isConfirmLeave: false
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      })
        .then(() => {
          next()
        })
        .catch(() => {
          next(false)
        })
    } else {
      next()
    }
  },
  computed: {
    hasUnsavedChanges() {
      return this.isTableDataChanged(0) || this.isTableDataChanged(1)
    }
  },
  watch: {
    activeNames(val) {
      localStorage.setItem('ProjectSettingsActiveNames', JSON.stringify(val))
    },
    selectedProjectId(val) {
      if (this.hasUnsavedChanges) {
        this.checkUnsavedChanges()
      } else {
        this.getProjectAlertData()
      }
    }
  },
  mounted() {
    this.getActiveCollapseItem()
  },
  methods: {
    getActiveCollapseItem() {
      const target = JSON.parse(localStorage.getItem('ProjectSettingsActiveNames'))
      this.activeNames = target === null ? ['ProjectMembers'] : target
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
    },
    getProjectAlertData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        this.setDisabledStatus()
        this.disableSwitch = true
      } else this.fetchProjectAlertData()
    },
    async fetchProjectAlertData() {
      this.listLoading = true
      this.disableSwitch = false
      try {
        const res = await getAlertSettingsByProject(this.selectedProjectId)
        if (res.data.length === 0) {
          this.setDisabledStatus()
        } else {
          this.isToggle = true
          this.disableSave = false
          this.alertListData = res.data.alert_list
          this.setOriginData(res.data.alert_list)
        }
      } catch (e) {
        this.alertListData = []
        console.error(e)
      }
      this.listLoading = false
    },
    setDisabledStatus() {
      this.isToggle = false
      this.disableSave = true
      this.alertListData = []
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
    },
    async toggleSwitch(bool) {
      const param = {}
      param.enable = bool
      this.listLoading = true
      await changeProjectAlertSettings(this.selectedProjectId, param)
        .then(_ => {
          this.getProjectAlertData()
          this.showChangeMessage(bool)
        })
        .catch(err => {
          this.listLoading = false
          return err
        })
    },
    showChangeMessage(bool) {
      this.$message({
        title: this.$t('general.Success'),
        message: bool ? this.$t('ProjectSettings.EnableMessage') : this.$t('ProjectSettings.DisableMessage'),
        type: 'success'
      })
    },
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('ProjectSettings.SuccessUpdateAlertSettings'),
        type: 'success'
      })
    },
    handleTableClick(tab) {
      if (tab.index === '0' && tab.name === 'generalSettings') {
        this.fetchData()
        this.checkUnsavedChanges()
      } else if (tab.index === '1' && tab.name === 'notifySettings') {
        this.getProjectAlertData()
        this.isConfirmLeave = false
      }
    },
    handleSave() {
      this.handleUpdateAlertTable(0)
      this.handleUpdateAlertTable(1)
    },
    async handleUpdateAlertTable(index) {
      const params = {}
      const alertId = this.alertListData[index].id
      params.disabled = this.alertListData[index].disabled
      params.days = this.alertListData[index].days
      this.listLoading = true
      await updateAlertSettingsByProject(alertId, params)
        .then(_ => {
          this.getProjectAlertData()
          this.showUpdateMessage()
        })
        .catch(err => {
          this.listLoading = false
          return err
        })
    },
    checkUnsavedChanges() {
      if (this.isConfirmLeave) return
      if (this.hasUnsavedChanges) this.dialogVisible = true
    },
    handleConfirmLeave() {
      this.dialogVisible = false
      this.fetchProjectAlertData()
      this.tabActiveName = 'generalSettings'
      this.isConfirmLeave = true
    },
    beforeTabsLeave() {
      return this.isConfirmLeave ? this.isConfirmLeave : !this.hasUnsavedChanges
    },
    isTableDataChanged(index) {
      for (const key in this.alertListData[index]) {
        if (this.originData[index][key] !== this.alertListData[index][key]) return true
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  background: #c5c8cc;
  color: #3e3f41;
  border-top: 5px solid #3e3f41;
  border-bottom-color: #c5c8cc;
  height: 45px;
}

>>> .el-tabs--card>.el-tabs__header .el-tabs__item {
  background: #3e3f41;
  color: #c5c8cc;
  border-radius: 5px;
  width: 125%;
  &:hover {
    color: #409eff;
  }
}

>>> .el-tabs__content {
  background: #c5c8cc;
  border-radius: 3px;
}

>>> .el-tabs__header {
  margin: 0;
}

>>> .el-tab-pane {
  margin: 15px;
  background: #c5c8cc;
}

>>> .el-input__inner {
  text-align: center;
}
</style>
