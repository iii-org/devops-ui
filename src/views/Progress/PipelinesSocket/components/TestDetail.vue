<template>
  <el-dialog :visible="dialogVisible" width="95%" top="10vh" @close="handleClose">
    <template slot="title">
      <span class="font-weight-bold text-h6 ml-4">
        {{ $t('ProgressPipelines.TestDetail') }}
      </span>
    </template>
    <el-tabs v-model="activeStage" tab-position="left" @tab-click="handleStageClick">
      <el-tab-pane
        v-for="(stage, idx) in stages"
        :key="idx"
        :name="`${idx + 1} ${stage.name}`"
        :disabled="!stage.state"
      >
        <div slot="label" class="d-flex justify-space-between align-center">
          <span class="text-right">{{ idx + 1 }} {{ stage.name }}</span>
          <el-tag
            v-if="stage.state"
            class="el-tag ml-2"
            :type="getStateTagType(stage.state)"
            size="mini"
            :effect="getStateTagEffect(stage.state)"
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
          <div class="text-h6 mb-3">
            <i class="el-icon-tickets mr-2" />
            <span class="mr-3">{{ stage.name }}</span>
            <i v-if="stage.isLoading" class="el-icon-loading font-weight-bold" style="color: #F89F03" />
            <i v-else class="el-icon-check font-weight-bold" style="color: #72C040" />
          </div>
          <el-card
            v-for="(step, stepIdx) in stage.steps"
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
            <pre>{{ step.message }}</pre>
          </el-card>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button @click="handleClose">{{ $t('general.Close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { io } from 'socket.io-client'
import { mapGetters } from 'vuex'
import { getPipelinesConfig, getCiPipelineId } from '@/api/cicd'

export default {
  name: 'TestDetailSocket',
  props: {
    pipelineId: {
      type: Number,
      default: 0
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
      socket: io('/rancher/websocket/logs', {
        // io(process.env.VUE_APP_BASE_API + '/rancher/websocket/logs', {
        reconnectionAttempts: 5,
        transports: ['websocket']
      })
    }
  },
  computed: {
    ...mapGetters(['selectedProject'])
  },
  mounted() {
    if (this.selectedProject.id === -1) return
    this.fetchCiPipelineId()
    this.setConnectStatusListener()
  },
  beforeDestroy() {
    this.handleClose()
  },
  methods: {
    handleStageClick(tab) {
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
      // console.log('EMIT get_pipe_log ===>', emitObj)
      this.socket.emit('get_pipe_log', emitObj)
      this.updateStageLogMessage()
    },
    updateStageLogMessage() {
      this.socket.on('pipeline_log', sioEvt => {
        // console.log('EVENT pipeline_log ===>', sioEvt)
        const { stage_index, step_index, data } = sioEvt
        const stageIdx = stage_index - 1
        if (data === '') {
          this.stages[stageIdx].isLoading = false
          const order = stage_index + 1
          if (stage_index <= this.stages.length) {
            if (!this.isBuildingPipeline()) return
            this.changeFocusTab(order, stage_index)
          }
          return
        }
        const isHistoryMessage =
          this.stages[stageIdx].steps[step_index].message === data ||
          this.stages[stageIdx].steps[step_index].message === 'Loading...'
        if (isHistoryMessage) {
          this.stages[stageIdx].steps[step_index].message = data
        } else {
          if (!this.stages[stageIdx].steps[step_index].message.includes(data)) {
            this.stages[stageIdx].steps[step_index].message = this.stages[stageIdx].steps[step_index].message.concat(
              data
            )
          }
        }
        this.scrollToBottom()
      })
    },
    changeFocusTab(order, stageIdx) {
      if (order === 1 && stageIdx === 0) {
        this.activeStage = `${order} ${this.stages[stageIdx].name}`
        if (this.emitStages.includes(stageIdx)) return
        this.handleStageClick({ index: stageIdx })
      } else {
        setTimeout(() => {
          this.activeStage = `${order} ${this.stages[stageIdx].name}`
          if (this.emitStages.includes(stageIdx)) return
          this.handleStageClick({ index: stageIdx })
        }, 2000)
      }
    },
    async fetchStages() {
      this.socket.connect()
      const { repository_id } = this.selectedProject
      try {
        const res = await getPipelinesConfig(repository_id, { pipelines_exec_run: this.pipelinesExecRun })
        this.stages = res.map(stage => ({
          stage_id: stage.stage_id,
          name: stage.name,
          state: stage.state,
          isLoading: true,
          steps: stage.steps.map(step => ({
            step_id: step.step_id,
            state: step.state,
            message: 'Loading...'
          }))
        }))
        this.dialogVisible = true
        this.changeFocusTab(1, 0)
        if (this.isBuildingPipeline()) this.setTimer()
      } catch (error) {
        console.error(error)
      }
    },
    fetchCiPipelineId() {
      getCiPipelineId(this.selectedProject.repository_id)
        .then(res => {
          this.ciPipelineId = res.data
        })
        .catch(err => console.error(err))
    },
    setConnectStatusListener() {
      this.socket.on('connect', () => {
        this.$notify({
          title: this.$t('general.Success'),
          message: 'WebSocket connect',
          type: 'success'
        })
        // console.log('sio connected ===>', this.socket)
        this.sid = this.socket.id
      })
      // this.socket.on('disconnect', sioEvt => {
      // this.$notify({
      //   title: this.$t('general.Info'),
      //   message: sioEvt,
      //   type: 'warning'
      // })
      // console.log('sio disconnect ===>', sioEvt)
      // })
    },
    async updateStages() {
      const { repository_id } = this.selectedProject
      try {
        const res = await getPipelinesConfig(repository_id, { pipelines_exec_run: this.pipelinesExecRun })
        res.forEach((data, idx) => {
          this.stages[idx].state = data.state
        })
      } catch (error) {
        console.error(error)
      }
    },
    handleClose() {
      this.clearTimer()
      this.stages = []
      this.emitStages = []
      this.socket.close()
      this.dialogVisible = false
    },
    setTimer() {
      this.timer = setInterval(() => this.updateStages(), 5000)
    },
    clearTimer() {
      clearInterval(this.timer)
      this.timer = null
    },
    isBuildingPipeline() {
      return this.stages.some(item => item.state === 'Building' || item.state === 'Waiting')
    },
    getStateTagType(state) {
      switch (state) {
        case 'Failed':
          return 'danger'
        case 'Success':
          return 'success'
        case 'Aborted':
          return 'warning'
        case 'Waiting':
          return 'slow'
        case 'Building':
          return 'success'
        case 'Skipped':
          return 'info'
        default:
          return 'info'
      }
    },
    getStateTagEffect(state) {
      switch (state) {
        case 'Building':
          return 'light'
        default:
          return 'dark'
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const target = this.$el.querySelector('.el-card__body').childNodes[2].childNodes[1]
        target.scrollTop = target.scrollHeight
      })
    }
  }
}
</script>
