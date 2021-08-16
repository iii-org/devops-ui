<template>
  <div class="app-container">
    <ProjectListSelector />
    <el-divider />
    <el-tabs v-model="tabActiveName" type="card" @tab-click="handleTabClick">
      <el-tab-pane :label="$t('ProjectSettings.GeneralSettings')" name="generalSettings">
        <el-row v-if="selectedProjectId !== -1" :gutter="10">
          <el-col class="mb-4" :xs="24">
            <el-card shadow="never">
              <el-collapse v-model="activeNames">
                <ProjectMembers />
              </el-collapse>
            </el-card>
          </el-col>
        </el-row>
        <el-alert v-else type="warning" :closable="false">
          <h2><i class="el-icon-warning" /> {{ $t('general.Warning') }}</h2>
          <h3>{{ this.$t('Notify.NoProject') }}</h3>
        </el-alert>
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
              />
            </div>
          </div>
          <el-divider />
          <el-table
            v-if="isToggle"
            v-loading="listLoading"
            :element-loading-text="$t('Loading')"
            :data="tableData"
            border
            fit
          >
            <el-table-column type="index" align="center" :label="$t('ProjectSettings.Index')" width="100" />
            <el-table-column align="center" :label="$t('ProjectSettings.NotificationConditions')" prop="condition" />
            <el-table-column align="center" :label="$t('ProjectSettings.Days')">
              <template slot-scope="scope">
                <el-input v-show="scope.row.isEnabled" v-model="scope.row.day" type="text" />
                <span v-show="!scope.row.isEnabled">{{ scope.row.day }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('ProjectSettings.Status')">
              <template slot-scope="scope">
                <div v-if="scope.row.isEnabled" class="font-medium">{{ $t('general.Enable') }}</div>
                <div v-else style="color: red;">{{ $t('general.Disable') }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('ProjectSettings.Actions')">
              <template slot-scope="scope">
                <el-button v-if="scope.row.isEnabled" type="danger" size="mini" plain @click="toggleUsage(scope.row)">{{ $t('general.Disable') }}</el-button>
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
import { ProjectMembers } from '../components'
import ProjectListSelector from '@/components/ProjectListSelector'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'

export default {
  name: 'QA',
  components: { ProjectListSelector, ProjectMembers },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      activeNames: [],
      tabActiveName: 'generalSettings',
      isToggle: true,
      listLoading: false,
      tableData: [
        {
          condition: '到期日前 3 天通知',
          day: 7,
          isEnabled: true
        },
        {
          condition: '議題連續為異動達 10 天以上',
          day: 30,
          isEnabled: false
        }
      ]
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
    toggleUsage(row) {
      row.isEnabled = !row.isEnabled
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  background: rgb(197, 200, 204);
  color: rgb(62, 63, 65);
  border-top: 5px solid rgb(62, 63, 65);
  height: 45px;
}

>>> .el-tabs--card>.el-tabs__header .el-tabs__item {
  background: rgb(62, 63, 65);
  color: rgb(197, 200, 204);
  border-radius: 5px;
  width: 125%;
  &:hover {
    color: #409eff;
  }
}

>>> .el-tabs__content {
  background: rgb(197, 200, 204);
  border-radius: 10px;
}

>>> .el-tabs__header {
  margin: 0;
}

>>> .el-tab-pane {
  margin: 15px;
  background: rgb(197, 200, 204);
}

>>> .el-input__inner {
  text-align: center;
}
</style>
