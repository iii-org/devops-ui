<template>
  <div v-loading="isLoading" :element-loading-text="$t('Loading')">
    <div v-if="isShowTitle" class="text-lg mr-3 mb-2">{{ $t('Plugin.Manage') }}</div>
    <template v-if="settingStatus === 'Active'">
      <div class="flex justify-between items-center mb-1">
        <div>
          <span class="text-sm mr-2">{{ $t('Git.Branch') }}：</span>
          <span class="text-title">{{ branch }}</span>
        </div>
        <el-button class="linkTextColor" type="text" size="medium" @click="handleClick">
          {{ $t('route.advanceBranchSettings') }}
        </el-button>
      </div>
      <template v-if="showWarning">
        <div style="color: red; font-size: 10px;">
          {{ $t('Notify.pluginWarnNotifications') }}
        </div>
      </template>
      <el-table
        v-loading="isStagesLoading"
        :element-loading-text="$t('Updating')"
        :data="stagesData"
        :row-style="rowStyle"
        fit
        :show-header="false"
      >
        <el-table-column prop="name" />
        <el-table-column align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.has_default_branch"
              inactive-color="gray"
              @change="handleStageChange(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <div class="text-right mt-3">
        <el-button size="mini" class="buttonSecondaryReverse" :loading="isStagesLoading" @click="fetchPipeDefBranch">
          {{ $t('general.Cancel') }}
        </el-button>
        <el-button size="mini" class="buttonPrimary" :loading="isStagesLoading" @click="updatePipeDefBranch">
          {{ $t('general.Confirm') }}
        </el-button>
      </div>
    </template>
    <template v-else-if="settingStatus === 'unSupported'">
      <div class="text-center text-title mb-3">{{ $t('Plugin.CustomEnvWarning') }}</div>
      <div class="text-center text-danger font-bold">{{ $t('Plugin.CustomRecommendWarning') }}</div>
    </template>
    <template v-else-if="settingStatus === 'error'">
      <div class="text-center text-title">{{ $t('Notify.LoadFail') }}</div>
    </template>
    <template v-else>
      <el-empty :description="$t('general.NoData')" :image-size="100" />
    </template>
  </div>
</template>

<script>
import { getPipelineDefaultBranch, editPipelineDefaultBranch } from '@/api/projects'
import { mapGetters } from 'vuex'

export default {
  name: 'PipelineSettings',
  props: {
    isShowTitle: {
      type: Boolean,
      default: false
    }
  },
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
    },
    // count the frequency of each plugin appeared
    // for example: { Web: 2, Sonarqube: 1, Checkmarx: 1, ...}
    countFrequency() {
      return this.stagesData.reduce((preVal, curVal) => {
        if (curVal.name in preVal) preVal[curVal.name]++
        else preVal[curVal.name] = 1
        return preVal
      }, {})
    },
    // find the repeat plugin
    repeatPlugins() {
      const repeatPlugins = []
      Object.keys(this.countFrequency).forEach(item => {
        if (this.countFrequency[item] > 1) repeatPlugins.push(item)
      })
      return repeatPlugins
    },
    // if the enable values of repeat plugins are not the same, showWarning will be true
    showWarning() {
      let showWarning = false
      this.stagesData.reduce((preVal, curVal) => {
        const enable = 'has_default_branch'
        const hasProperty = preVal.hasOwnProperty(curVal.name)
        if (hasProperty && preVal[curVal.name] !== curVal[enable]) showWarning = true
        preVal[curVal.name] = curVal[enable]
        return preVal
      }, {})
      return showWarning
    }
  },
  watch: {
    selectedProject() {
      this.fetchPipeDefBranch()
    }
  },
  mounted() {
    this.settingStatus = ''
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
      this.$router.push({ name: 'advance-branch-settings', params: { projectName: this.selectedProject.name }})
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
      if (this.showWarning) {
        this.showWarningMessage()
        return
      }
      const sendData = { detail: { stages: this.stagesData }}
      this.isStagesLoading = true
      try {
        await editPipelineDefaultBranch(this.selectedRepositoryId, sendData)
      } catch (err) {
        this.fetchPipeDefBranch()
        this.$notify({
          title: this.$t('general.Error'),
          message: err,
          type: 'error'
        })
      } finally {
        this.isStagesLoading = false
      }
    },
    showWarningMessage() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.pluginWarnNotifications'),
        type: 'warning'
      })
    },
    rowStyle({ row }) {
      const style = {}
      this.repeatPlugins.forEach(plugin => {
        if (row.name === plugin) {
          style['background-color'] = '#F9CECE'
          style['color'] = 'red'
        }
      })
      return style
    }
  }
}
</script>
