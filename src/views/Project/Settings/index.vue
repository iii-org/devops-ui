<template>
  <div class="app-container">
    <ProjectListSelector />
    <el-divider />
    <el-tabs v-model="tabActiveName" type="card" :before-leave="beforeLeave">
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
          <AlertSettings ref="alertSettings" />
        </el-card>
      </el-tab-pane>
      <el-tab-pane :label="$t('ProjectSettings.LabelSettings')" name="labelSettings">
        <el-card>
          <LabelSettings ref="labelSettings" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
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
    AlertSettings: () => import ('@/views/Project/Settings/components/AlertSettings'),
    LabelSettings: () => import ('@/views/Project/Settings/components/LabelSettings')
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      activeNames: [],
      tabActiveName: 'generalSettings',
      isConfirmLeave: false
    }
  },
  computed: {
    hasUnsavedChanges() {
      return this.$refs.alertSettings.hasUnsavedChanges
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
    beforeLeave() {
      if (this.isConfirmLeave) return true
      if (this.hasUnsavedChanges) return this.showLeaveMessage()
    },
    /*
      if return false or reject(), then it will prevent switching
      return true or resolve() on the contrary
      suggested to return reject() or resolve() because it will sometimes invalid when returned true or false
    */
    showLeaveMessage() {
      const isLeave = new Promise(async(resolve, reject) => {
        return await this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        })
          .then(() => {
            this.isConfirmLeave = true
            return resolve()
          })
          .catch(() => {
            return reject()
          })
          .finally(() => {
            return reject()
          })
      })
      return isLeave
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
  width:250px;
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
