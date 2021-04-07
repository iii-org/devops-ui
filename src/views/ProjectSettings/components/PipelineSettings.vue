<template>
  <el-collapse-item v-loading="listLoading" :element-loading-text="$t('Loading')" name="PluginSettings">
    <template slot="title">
      <span class="text-subtitle-1 font-weight-bold">{{ $t('Plugin.Manage') }}</span>
    </template>

    <template v-if="settingStatus === 'Active'">
      <div class="d-flex justify-space-between align-center mb-1">
        <div>
          <span class="text-subtitle-2 mr-2">{{ $t('Git.Branch') }}：</span>
          <span class="text-subtitle-1 font-weight-bold">{{ defaultBranch }}</span>
        </div>
        <!-- <el-button type="text" size="medium" @click="handleClick">
          {{ $t('route.advanceBranchSettings') }}
        </el-button> -->
      </div>
      <el-table :data="stages" fit :show-header="false">
        <el-table-column prop="name" />
        <el-table-column align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.has_default_branch"
              active-color="#13ce66"
              inactive-color="gray"
              @change="updatePipelineDefaultBranch"
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
    listLoading: false,
    settingStatus: '',
    defaultBranch: '',
    stages: []
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
      this.listLoading = true
      try {
        const res = await getPipelineDefaultBranch(this.selectedProjectRepositoryId)
        if (Object.keys(res.data).length > 0) {
          const { default_branch, stages } = res.data
          this.defaultBranch = default_branch
          this.stages = stages.map(stage => stage)
          this.settingStatus = 'Active'
        } else {
          this.resetSettings()
        }
      } catch (err) {
        this.settingStatus = 'error'
      } finally {
        this.listLoading = false
      }
    },
    resetSettings() {
      this.settingStatus = 'unSupported'
      this.stages = []
      this.defaultBranch = ''
    },
    handleClick() {
      this.$router.push({ name: 'advance-branch-settings' })
    },
    async updatePipelineDefaultBranch() {
      const sendData = { detail: { stages: this.stages } }
      this.listLoading = true
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
        this.listLoading = false
      }
    }
  }
}
</script>
