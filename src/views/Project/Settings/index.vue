<template>
  <div class="app-container">
    <ProjectListSelector />
    <el-divider />
    <el-tabs v-model="tabActiveName" type="card" @tab-click="handleTableClick">
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
                :active-text="$t('general.Enable')"
                :inactive-text="$t('general.Disable')"
                @change="toggleSwitch"
              />
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
                <div v-if="!scope.row.disabled" class="font-medium">{{ $t('general.Enable') }}</div>
                <div v-else style="color: red;">{{ $t('general.Disable') }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('ProjectSettings.Actions')">
              <template slot-scope="scope">
                <el-button v-if="!scope.row.disabled" type="danger" size="mini" plain @click="toggleUsage(scope.row)">{{ $t('general.Disable') }}</el-button>
                <el-button v-else type="primary" size="mini" plain @click="toggleUsage(scope.row)">{{ $t('general.Enable') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="text-center">{{ $t('ProjectSettings.NotYetEnabled') }}</div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ProjectVersions, ProjectMembers, PipelineSettings } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { changeProjectAlertSettings, getAlertByProject } from '@/api/alert'

export default {
  name: 'ProjectSettings',
  components: { ProjectListSelector, ProjectVersions, PipelineSettings, ProjectMembers },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      activeNames: [],
      tabActiveName: 'generalSettings',
      isToggle: false,
      listLoading: false,
      alertListData: []
    }
  },
  watch: {
    activeNames(val) {
      localStorage.setItem('ProjectSettingsActiveNames', JSON.stringify(val))
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
    async fetchProjectAlertData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      } else {
        this.listLoading = true
        this.alertListData = []
        const res = await getAlertByProject(this.selectedProjectId)
        this.alertListData = res.data.length !== 0 ? res.data.alert_list : []
        this.listLoading = false
      }
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
          this.fetchProjectAlertData()
        })
        .catch(err => {
          this.isLoading = false
          return err
        })
    },
    handleTableClick(tab) {
      if (tab.index === '0' && tab.name === 'generalSettings') this.fetchData()
      else if (tab.index === '1' && tab.name === 'notifySettings') this.fetchProjectAlertData()
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  background: #c5c8cc;
  color: #3e3f41;
  border-top: 5px solid #3e3f41;
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
  border-radius: 10px;
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
