<template>
  <div class="app-container">
    <ProjectListSelector
      :has-unsaved-changes="hasUnsavedChanges"
      :is-confirm-leave="isConfirmLeave"
      @checkUnsavedChanges="checkShowDialog"
    />
    <el-divider />
    <el-tabs v-model="tabActiveName" type="card">
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
        <el-card>
          <AlertSettings @setHasUnsavedChanges="setHasUnsavedChanges" />
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

export default {
  name: 'ProjectSettings',
  components: {
    ProjectListSelector,
    ProjectVersions,
    PipelineSettings,
    ProjectMembers,
    AlertSettings: () => import ('@/views/Project/Settings/components/AlertSettings')
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      activeNames: [],
      tabActiveName: 'generalSettings',
      hasUnsavedChanges: false,
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
  watch: {
    activeNames(val) {
      localStorage.setItem('ProjectSettingsActiveNames', JSON.stringify(val))
    }
    // async selectedProjectId(val, oldVal) {
    //   if (this.hasUnsavedChanges) {
    //     const res = await this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
    //       confirmButtonText: this.$t('general.Confirm'),
    //       cancelButtonText: this.$t('general.Cancel'),
    //       type: 'warning'
    //     }).catch(() => {})
    //     if (res !== 'confirm') return
    //   }
    // }
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
    setHasUnsavedChanges(hasUnsavedChanges) {
      this.hasUnsavedChanges = hasUnsavedChanges
    },
    checkShowDialog() {
      if (this.isConfirmLeave) return
      this.dialogVisible = true
    },
    handleConfirmLeave() {
      this.dialogVisible = false
      this.isConfirmLeave = true
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  background: #e4ecf7 ;
  color: #3e3f41;
  border-top: 5px solid #3e3f41;
  border-bottom-color: #e4ecf7 ;
  height: 45px;
}

>>> .el-tabs--card>.el-tabs__header .el-tabs__item {
  background: #3e3f41;
  color: #e4ecf7 ;
  border-radius: 5px;
  width: 125%;
  &:hover {
    color: #409eff;
  }
}

>>> .el-tabs__content {
  background: #e4ecf7 ;
  border-radius: 3px;
}

>>> .el-tabs__header {
  margin: 0;
}

>>> .el-tab-pane {
  margin: 15px;
  background: #e4ecf7 ;
}
</style>
