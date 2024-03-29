<template>
  <el-dialog :visible.sync="dialogVisible" width="95%" top="3vh" @close="handleClose">
    <template slot="title">
      <span class="text-title mx-4"> {{ $t('ProgressPipelines.TestDetail') }}</span>
      <span> {{ pipelineInfos.commitMessage }} </span>
    </template>
    <el-tabs v-model="activeStage" tab-position="left" @tab-click="userClick">
      <el-tab-pane
        v-for="(stage, idx) in stages"
        :key="idx"
        :name="`${idx + 1} ${stage.name}`"
        :disabled="!stage.state"
      >
        <div slot="label" class="flex justify-between items-center">
          <span class="text-right">{{ idx + 1 }} {{ stage.name }}</span>
          <el-tag
            v-if="stage.state"
            class="el-tag ml-2"
            :type="mapStateType(stage.state)"
            size="mini"
            :effect="mapStateEffect(stage.state)"
          >
            {{ stage.state }}
          </el-tag>
        </div>
        <el-card
          :body-style="{
            color: '#000',
            background: '#DADADA',
            lineHeight: 2
          }"
        >
          <div class="text-title mb-3">
            <em class="el-icon-tickets mr-2" />
            <span class="mr-3">{{ stage.name }}</span>
            <em v-if="stage.isLoading" class="el-icon-loading font-bold" style="color: #f89f03" />
            <em v-else class="el-icon-check font-bold" style="color: #72c040" />
          </div>
          <el-card
            v-for="(step, stepIdx) in stage.steps"
            :id="'preWindow' + idx"
            :key="stepIdx"
            class="mb-2"
            :body-style="{
              color: '#fff',
              background: '#222',
              lineHeight: 1,
              fontSize: '14px',
              height: '45vh',
              overflow: 'auto',
              'scroll-behavior': 'smooth'
            }"
            shadow="never"
          >
            <pre v-html="step.message" />
          </el-card>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button class="buttonSecondaryReverse" @click="handleClose">{{ $t('general.Close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { io } from 'socket.io-client'
import AnsiUp from 'ansi_up'
import { mapGetters } from 'vuex'
import { getPipelinesConfig, getCiPipelineId } from '@/api/cicd'

export default {
  name: 'TestDetailSocket',
  props: {
    pipelineInfos: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      stages: [],
      activeStage: '',
      sid: '',
      pipelinesExecRun: 0,
      ciPipelineId: 0,
      emitStages: [],
      timer: null,
      socket: io(process.env.VUE_APP_WS_API + '/rancher/websocket/logs', {
        reconnectionAttempts: 5,
        transports: ['websocket']
      })
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
      this.fetchCiPipelineId()
    }
  },
  mounted() {
    if (this.selectedProject.id === -1) return
    this.fetchCiPipelineId()
    this.setLogMessageListener()
  },
  beforeDestroy() {
    this.handleClose()
  },
  methods: {
    userClick(tab) {
      this.emitPipeLog(tab)
    },
    emitPipeLog(tab) {
      const index = Number(tab.index)
      this.emitStages.push(index)
      const stage = this.stages[index]
      if (!stage.isLoading) return
      const emitObj = {
        pipelines_exec_run: this.pipelinesExecRun,
        ci_pipeline_id: this.ciPipelineId,
        stage_index: index + 1,
        step_index: stage.steps[0].step_id,
        sid: this.sid
      }
      this.socket.emit('get_pipe_log', emitObj)
    },
    setLogMessageListener() {
      this.socket.on('pipeline_log', (sioEvt) => {
        const { stage_index, step_index, data } = sioEvt
        const stageIdx = stage_index - 1
        if (data === '') {
          this.stages[stageIdx].isLoading = false
          this.moveToNextStage(stage_index)
        } else {
          this.setLogMessage(stageIdx, step_index, data)
        }
        this.scrollToBottom(stageIdx)
      })
    },
    moveToNextStage(stage_index) {
      if (stage_index < this.stages.length) {
        const buildingStageIdx = this.getBuildingStageIdx()
        if (buildingStageIdx < 0) return
        this.changeFocusTab(stage_index + 1, stage_index, 1500)
      }
    },
    setLogMessage(stageIdx, step_index, data) {
      const ansiUp = new AnsiUp()
      const html = ansiUp.ansi_to_html(data.replaceAll('&gt;', '>'))
      const target = this.stages[stageIdx].steps[step_index].message
      const isHistoryMessage = target === data || target === 'Loading...'
      if (isHistoryMessage) {
        this.stages[stageIdx].steps[step_index].message = html
      } else {
        if (target.includes(data)) return
        this.stages[stageIdx].steps[step_index].message = this.stages[stageIdx].steps[step_index].message.concat(html)
      }
    },
    changeFocusTab(order, stageIdx, timeout = 0) {
      if (order === 1 && stageIdx === 0) {
        this.activeStage = `${order} ${this.stages[stageIdx].name}`
        if (this.emitStages.includes(stageIdx)) return
        this.emitPipeLog({ index: stageIdx })
      } else {
        setTimeout(() => {
          this.activeStage = `${order} ${this.stages[stageIdx].name}`
          if (this.emitStages.includes(stageIdx)) return
          this.emitPipeLog({ index: stageIdx })
        }, timeout)
      }
    },
    async fetchStages() {
      this.socket.connect()
      try {
        const res = await getPipelinesConfig(this.selectedRepositoryId, { pipelines_exec_run: this.pipelinesExecRun })
        this.stages = res.map((stage) => ({
          stage_id: stage.stage_id,
          name: stage.name,
          state: stage.state,
          isLoading: true,
          steps: stage.steps.map((step) => ({
            step_id: step.step_id,
            state: step.state,
            message: 'Loading...'
          }))
        }))
        this.dialogVisible = true
        const buildingStageIdx = this.getBuildingStageIdx()
        if (buildingStageIdx < 0) {
          this.changeFocusTab(1, 0)
        } else {
          this.changeFocusTab(buildingStageIdx + 1, buildingStageIdx)
        }
        this.setTimer()
      } catch (error) {
        console.error(error)
      } finally {
        this.$emit('loaded')
      }
    },
    fetchCiPipelineId() {
      getCiPipelineId(this.selectedRepositoryId)
        .then((res) => {
          this.ciPipelineId = res.data
        })
        .catch((err) => console.error(err))
    },
    updateStagesState() {
      getPipelinesConfig(this.selectedRepositoryId, { pipelines_exec_run: this.pipelinesExecRun })
        .then((res) => {
          res.forEach((stage, idx) => {
            this.stages[idx].state = stage.state
          })
          this.setTimer()
        })
        .catch(() => ({}))
    },
    handleClose() {
      this.socket.close()
      this.clearTimer()
      this.stages = []
      this.emitStages = []
      this.dialogVisible = false
      this.activeStage = ''
    },
    setTimer() {
      const isActive = this.stages.some((item) => item.state === 'Building' || item.state === 'Waiting')
      if (isActive) this.timer = setTimeout(() => this.updateStagesState(), 1000)
    },
    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    },
    getBuildingStageIdx() {
      return this.stages.findIndex((item) => item.state === 'Building')
    },
    mapStateType(state) {
      const mapping = {
        Failed: 'danger',
        Success: 'success',
        Aborted: 'warning',
        Waiting: 'slow',
        Building: 'success',
        Skipped: 'info'
      }
      return mapping[state] || 'info'
    },
    mapStateEffect(state) {
      return state === 'Building' ? 'light' : 'dark'
    },
    scrollToBottom(stageIdx) {
      this.$nextTick(() => {
        const target = this.$el.querySelector(`#preWindow${stageIdx}`).childNodes[1]
        target.scrollTop = target.scrollHeight
      })
    }
  }
}
</script>
