<template>
  <el-collapse-item v-loading="isLoading" :element-loading-text="$t('Loading')" name="PluginSettings">
    <template slot="title">
      <span class="text-subtitle-1 font-weight-bold mr-3">{{ $t('Plugin.Manage') }}</span>
    </template>
    <template v-if="settingStatus === 'Active'">
      <div class="d-flex justify-space-between align-center mb-1">
        <div>
          <span class="text-subtitle-2 mr-2">{{ $t('Git.Branch') }}：</span>
          <span class="text-subtitle-1 font-weight-bold">{{ branch }}</span>
        </div>
        <el-button type="text" size="medium" @click="handleClick">
          {{ $t('route.advanceBranchSettings') }}
        </el-button>
      </div>
      <el-table
        v-loading="isStagesLoading"
        :element-loading-text="$t('Updating')"
        :data="stagesData"
        fit
        :show-header="false"
      >
        <el-table-column prop="name" />
        <el-table-column align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.has_default_branch"
              active-color="#13ce66"
              inactive-color="gray"
              @change="handleStageChange(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template v-else-if="settingStatus === 'unSupported'">
      <div class="text-center text-h6 mb-3">{{ $t('Plugin.CustomEnvWarning') }}</div>
      <div class="text-center text-danger font-weight-bold">{{ $t('Plugin.CustomRecommendWarning') }}</div>
    </template>
    <template v-else-if="settingStatus === 'error'">
      <div class="text-center text-h6">{{ $t('Notify.LoadFail') }}</div>
    </template>
  </el-collapse-item>
</template>

<script>
import { getPipelineDefaultBranch, editPipelineDefaultBranch } from '@/api/projects'
import { mapGetters } from 'vuex'

export default {
  name: 'PipelineSettings',
  data: () => ({
    isLoading: false,
    isStagesLoading: false,
    settingStatus: '',
    branch: '',
    stagesData: [],
    webDependencyKeys: ['test-postman', 'test-webinspect']
  }),
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectRepositoryId() {
      return this.selectedProject.repository_id
    }
  },
  watch: {
    selectedProject() {
      this.fetchPipelineDefaultBranch()
    }
  },
  mounted() {
    this.fetchPipelineDefaultBranch()
  },
  methods: {
    async fetchPipelineDefaultBranch() {
      this.isLoading = true
      try {
        const res = await getPipelineDefaultBranch(this.selectedProjectRepositoryId)
        const hasStages = Object.keys(res.data).length > 0
        if (hasStages) {
          const { default_branch, stages } = res.data
          this.branch = default_branch
          this.stagesData = stages.map(stage => stage)
          this.settingStatus = 'Active'
        } else {
          this.resetSettings()
        }
      } catch (err) {
        this.settingStatus = 'error'
      } finally {
        this.isLoading = false
      }
    },
    resetSettings() {
      this.settingStatus = 'unSupported'
      this.stagesData = []
      this.branch = ''
    },
    handleClick() {
      this.$router.push({ name: 'advance-branch-settings' })
    },
    handleStageChange(stage) {
      const { key, has_default_branch } = stage
      switch (key) {
        case 'web':
          this.handleWebStageChange(has_default_branch)
          break
        case 'test-postman':
          this.handleWebDependencyChange(has_default_branch)
          break
        case 'test-webinspect':
          this.handleWebDependencyChange(has_default_branch)
          break
        default:
          this.updatePipelineDefaultBranch()
          break
      }
    },
    handleWebStageChange(stageStatus) {
      const { stagesData, webDependencyKeys } = this
      if (!stageStatus) {
        webDependencyKeys.forEach(key => {
          const idx = stagesData.findIndex(stage => stage.key === key)
          if (idx !== -1) stagesData[idx].has_default_branch = false
        })
      }
      this.updatePipelineDefaultBranch()
    },
    handleWebDependencyChange(stageStatus) {
      const { stagesData } = this
      if (stageStatus) {
        const idx = stagesData.findIndex(stage => stage.key === 'web')
        if (idx !== -1) stagesData[idx].has_default_branch = true
      }
      this.updatePipelineDefaultBranch()
    },
    async updatePipelineDefaultBranch() {
      const sendData = { detail: { stages: this.stagesData } }
      this.isStagesLoading = true
      try {
        await editPipelineDefaultBranch(this.selectedProjectRepositoryId, sendData)
      } catch (err) {
        this.fetchPipelineDefaultBranch()
        this.$message({
          title: this.$t('general.Error'),
          message: err,
          type: 'error'
        })
      } finally {
        this.isStagesLoading = false
      }
    }
  }
}
</script>
