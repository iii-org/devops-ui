<template>
  <div>
    <template v-if="settingStatus === 'active'">
      <div class="flex justify-between items-center mb-1">
        <div>
          <span class="text-sm mr-2">{{ $t('Git.Branch') }}：</span>
          <el-select v-model="selectedBranchIndex">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div>
          <el-button
            size="mini"
            class="buttonSecondary"
            :loading="isLoading"
            plain
            @click="updatePipelineBranch(false)"
          >
            {{ $t('general.Save') }}
          </el-button>
          <el-button
            size="mini"
            class="buttonSecondary"
            :loading="isLoading"
            @click="isDataChanged ? updatePipelineBranch(true) : updateUnalteredPipelineBranch()"
          >
            <em class="el-icon-refresh" />
            {{ $t('general.DirectExecution') }}
          </el-button>
        </div>
      </div>
      <template v-if="showWarning">
        <div style="color: red; font-size: 10px; margin-bottom: 5px;">
          {{ $t('Notify.pluginWarnNotifications') }}
        </div>
      </template>
      <el-table
        v-loading="isLoading"
        :element-loading-text="$t('Updating')"
        :data="selectedToolData"
        fit
        :row-style="rowStyle"
        :show-header="false"
      >
        <el-table-column prop="name" />
        <el-table-column align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.enable"
              active-color="#13ce66"
              inactive-color="gray"
            />
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template v-else-if="settingStatus === 'unSupported'">
      <div class="text-center text-title mb-3">{{ $t('Plugin.CustomEnvWarning') }}</div>
      <div class="text-center text-danger font-bold">{{ $t('Plugin.CustomRecommendWarning') }}</div>
    </template>
    <template v-else-if="settingStatus === 'error'">
      <div class="text-center text-title">{{ $t('Notify.LoadFail') }}</div>
    </template>
    <template v-else>
      <el-empty
        :description="$t('general.NoData')"
        :image-size="100"
      />
    </template>
  </div>
</template>

<script>
import { getPipelineBranch, editPipelineBranch, updateUnalteredPipelineBranch } from '@/api/projects'
import { mapGetters } from 'vuex'

export default {
  name: 'PipelineSettingsTable',
  data() {
    return {
      isLoading: false,
      branches: [],
      options: [],
      pipelineSettingsData: [],
      originData: [],
      selectedBranchIndex: 0,
      settingStatus: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
    },
    selectedBranch() {
      return this.branches[this.selectedBranchIndex]
    },
    selectedToolData() {
      return this.pipelineSettingsData[this.selectedBranchIndex].testing_tools
    },
    originToolData() {
      return this.originData[this.selectedBranchIndex].testing_tools
    },
    isDataChanged() {
      let isChanged = false
      this.selectedToolData.forEach((item, index) => {
        if (item.enable !== this.originToolData[index].enable) isChanged = true
      })
      return isChanged
    },
    selectedBranchData() {
      const data = []
      const selectedData = this.pipelineSettingsData[this.selectedBranchIndex]
      data.push(selectedData)
      return data
    },
    branchesList() {
      return function (data) {
        return Object.keys(data)
      }
    },
    // count the frequency of each plugin appeared
    // for example: { Web: 2, Sonarqube: 1, Checkmarx: 1, ...}
    countFrequency() {
      const countFreq = this.selectedToolData.reduce((preVal, curVal) => {
        if (curVal.name in preVal) preVal[curVal.name]++
        else preVal[curVal.name] = 1
        return preVal
      }, {})
      return countFreq
    },
    // find the repeat plugin
    repeatPlugins() {
      const repeatPlugins = []
      Object.keys(this.countFrequency).forEach((item) => {
        if (this.countFrequency[item] > 1) repeatPlugins.push(item)
      })
      return repeatPlugins
    },
    // if the enable values of repeat plugins are not the same, showWarning will be true
    showWarning() {
      let showWarning = false
      this.selectedToolData.reduce((preVal, curVal) => {
        const hasProperty = preVal.hasOwnProperty(curVal.name)
        if (hasProperty && preVal[curVal.name] !== curVal.enable) showWarning = true
        preVal[curVal.name] = curVal.enable
        return preVal
      }, {})
      return showWarning
    }
  },
  watch: {
    selectedProject() {
      this.fetchPipelineBranch()
    }
  },
  mounted() {
    this.settingStatus = ''
    this.fetchPipelineBranch()
  },
  methods: {
    async fetchPipelineBranch() {
      if (this.selectedRepositoryId === -1) return
      this.isLoading = true
      try {
        const res = await getPipelineBranch(this.selectedRepositoryId)
        this.handleStages(res.data)
      } catch (err) {
        this.settingStatus = 'error'
      } finally {
        this.isLoading = false
      }
    },
    handleStages(data) {
      const hasStages = this.branchesList(data).length > 0
      if (hasStages) {
        this.getBranch(data)
        this.getPipelineSettingsData(data)
        this.settingStatus = 'active'
      } else {
        this.resetSettings()
      }
    },
    getBranch(data) {
      const branches = this.branchesList(data)
      const options = []
      branches.forEach((branch, index) => {
        const option = { value: index, label: branch }
        options.push(option)
      })
      this.branches = branches
      this.options = options
    },
    getPipelineSettingsData(data) {
      const branches = this.branchesList(data)
      const settingsData = branches.map((branch) => {
        const { commit_message, commit_time, testing_tools } = data[branch]
        return {
          branch,
          commit_message,
          commit_time,
          testing_tools
        }
      })
      this.pipelineSettingsData = settingsData
      this.setOriginData(settingsData)
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    resetSettings() {
      this.settingStatus = 'unSupported'
      this.branches = []
      this.options = []
      this.pipelineSettingsData = []
    },
    async updatePipelineBranch(runPipeline) {
      if (this.showWarning) {
        this.showWarningMessage()
        return
      }
      const sendData = this.getSendData(runPipeline)
      const message = runPipeline
        ? this.$t('ProgressPipelines.RerunPipeline', [this.selectedBranch])
        : this.$t('Notify.Saved')
      this.isLoading = true
      try {
        await editPipelineBranch(this.selectedRepositoryId, sendData)
      } catch (err) {
        this.showErrorMessage(err)
      } finally {
        this.fetchPipelineBranch()
        this.showSuccessMessage(message)
      }
    },
    async updateUnalteredPipelineBranch() {
      const sendData = new FormData()
      sendData.append('branch', this.selectedBranch)
      this.isLoading = true
      try {
        await updateUnalteredPipelineBranch(this.selectedRepositoryId, sendData)
      } catch (err) {
        this.showErrorMessage(err)
      } finally {
        this.isLoading = false
        this.showSuccessMessage(this.$t('ProgressPipelines.RerunPipeline', [this.selectedBranch]))
      }
    },
    getSendData(runPipeline) {
      const getData = (result, cur) =>
        Object.assign(result, {
          [cur.branch]: cur.testing_tools.map((tool) => ({ enable: tool.enable, key: tool.key }))
        })
      const detail = this.selectedBranchData.reduce(getData, {})
      const sendData = runPipeline ? { run: true, detail } : { detail }
      return sendData
    },
    showErrorMessage(err) {
      this.$message({
        title: this.$t('general.Error'),
        message: err,
        type: 'error'
      })
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
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
      this.repeatPlugins.forEach((plugin) => {
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

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';
.buttonSecondary {
  background-color: $buttonSecondary;
  color: white
}
</style>
