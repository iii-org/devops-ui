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
                <el-collapse-item name="ProjectVersions" :title="$t('Version.ProjectManage')">
                  <ProjectVersions />
                </el-collapse-item>
              </el-collapse>
            </el-card>
          </el-col>
          <el-col class="mb-4" :sm="24" :md="10" :lg="9">
            <el-card shadow="never">
              <el-collapse v-model="activeNames">
                <el-collapse-item name="PluginSettings" :title="$t('Plugin.Manage')">
                  <PipelineSettings />
                </el-collapse-item>
              </el-collapse>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col class="mb-4" :xs="24">
            <el-card shadow="never">
              <el-collapse v-model="activeNames">
                <el-collapse-item name="ProjectMembers" :title="$t('Member.Manage')">
                  <ProjectMembers />
                </el-collapse-item>
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
      <el-tab-pane :label="$t('ProjectSettings.TagSettings')" name="tagSettings">
        <el-card>
          <TagSettings ref="tagSettings" />
        </el-card>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('ProjectSettings.ParentIssueRequired')"
        name="trackerSettings"
      >
        <el-card>
          <TrackerSettings ref="trackerSettings" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ProjectVersions, ProjectMembers, PipelineSettings } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'

export default {
  name: 'ProjectSettings',
  components: {
    ProjectListSelector,
    ProjectVersions,
    PipelineSettings,
    ProjectMembers,
    AlertSettings: () => import ('@/views/Plan/Settings/components/AlertSettings'),
    TagSettings: () => import ('@/views/Plan/Settings/components/TagSettings'),
    TrackerSettings: () => import ('@/views/Plan/Settings/components/TrackerSettings')
  },
  data() {
    return {
      activeNames: [],
      tabActiveName: 'generalSettings',
      isConfirmLeave: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
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
      return new Promise((resolve, reject) => {
        return this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';
>>> .el-collapse-item__header {
  font-size: 1.125rem;
}

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
    color: $linkTextColor;
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
