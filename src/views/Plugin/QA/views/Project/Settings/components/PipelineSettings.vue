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
      <div class="text-right mt-3">
        <el-button size="mini" :loading="isStagesLoading" @click="fetchPipeDefBranch">
          {{ $t('general.Cancel') }}
        </el-button>
        <el-button size="mini" type="primary" :loading="isStagesLoading" @click="updatePipeDefBranch">
          {{ $t('general.Confirm') }}
        </el-button>
      </div>
    </template>
    <template v-else-if="settingStatus === 'unSupported'">
      <div class="text-center text-h6 mb-3">{{ $t('Plugin.CustomEnvWarning') }}</div>
      <div class="text-center text-danger font-weight-bold">{{ $t('Plugin.CustomRecommendWarning') }}</div>
    </template>
    <template v-else-if="settingStatus === 'error'">
      <div class="text-center text-h6">{{ $t('Notify.LoadFail') }}</div>
    </template>
    <template v-else>
      <el-empty :description="$t('general.NoData')" :image-size="100" />
    </template>
  </el-collapse-item>
</template>

<script>
import { getPipelineDefaultBranch, editPipelineDefaultBranch } from '@/api/projects'
import { mapGetters } from 'vuex'

export default {
  name: 'QAPipelineSettings',
  data() {
    return {
      isLoading: false,
      isStagesLoading: false,
      settingStatus: '',
      branch: '',
      stagesData: [],
      services: ['web', 'db'],
      dependenceKeys: ['test-postman', 'test-webinspect', 'test-zap', 'test-sideex']
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
    }
  },
  watch: {
    selectedProject() {
      this.fetchPipeDefBranch()
    }
  },
  mounted() {
    this.fetchPipeDefBranch()
  },
  methods: {
    async fetchPipeDefBranch() {
      if (this.selectedRepositoryId === -1) return
      this.isLoading = true
      try {
        const res = await getPipelineDefaultBranch(this.selectedRepositoryId)
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
      if (this.services.includes(key)) {
        if (has_default_branch) return
        this.dependenceKeys.forEach(key => {
          const idx = this.stagesData.findIndex(stage => key === stage.key)
          if (idx < 0) return
          this.stagesData[idx].has_default_branch = has_default_branch
        })
      }
      if (this.dependenceKeys.includes(key)) {
        if (!has_default_branch) return
        this.services.forEach(key => {
          const idx = this.stagesData.findIndex(stage => key === stage.key)
          if (idx < 0) return
          this.stagesData[idx].has_default_branch = has_default_branch
        })
      }
    },
    async updatePipeDefBranch() {
      const sendData = { detail: { stages: this.stagesData }}
      this.isStagesLoading = true
      try {
        await editPipelineDefaultBranch(this.selectedRepositoryId, sendData)
      } catch (err) {
        await this.fetchPipeDefBranch()
        this.$notify({
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
