<template>
  <el-dialog :visible="dialogVisible" width="95%" top="10vh" @close="handleClose">
    <template slot="title">
      <span class="font-weight-bold text-h6 ml-4">
        {{ $t('ProgressPipelines.TestDetail') }}
      </span>
    </template>
    <el-tabs v-model="activeStage" tab-position="left" @tab-click="handleClick">
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
              overflow: 'auto'
            }"
            shadow="never"
          >
            <pre ref="logMsg">{{ step.message }}</pre>
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

// const socket = io(process.env.VUE_APP_BASE_API + '/rancher/websocket/logs', {
const socket = io('/rancher/websocket/logs', {
  reconnectionAttempts: 5,
  transports: ['websocket']
})

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
      timer: null,
      ciPipelineId: 0,
      emitStages: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject'])
  },
  watch: {
    pipelineId: {
      handler(val) {
        this.pipelinesExecRun = val
        this.fetchStages()
      }
    }
  },
  mounted() {
    this.fetchCiPipelineId()
    socket.on('connect', () => {
      console.log('sio connected ===>', socket)
      this.sid = socket.id
    })
    socket.on('disconnect', sioEvt => console.log('sio disconnect ===>', sioEvt))
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    fetchCiPipelineId() {
      getCiPipelineId(this.selectedProject.repository_id)
        .then(res => {
          this.ciPipelineId = res.data
        })
        .catch(err => console.error(err))
    },
    handleClose() {
      this.dialogVisible = false
      this.clearTimer()
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
    handleClick(tab) {
      const index = Number(tab.index)
      this.emitStages.push(index)
      const stage = this.stages[index]
      if (!stage.isLoading) return
      const emitObj = {
        pipelines_exec_run: this.pipelinesExecRun,
        // repository_id: this.selectedProject.repository_id,
        ci_pipeline_id: this.ciPipelineId,
        stage_index: index + 1,
        step_index: stage.steps[0].step_id,
        sid: this.sid
      }
      socket.emit('get_pipe_log', emitObj)
      console.log('EMIT get_pipe_log ===>', emitObj)
      socket.on('pipeline_log', sioEvt => {
        console.log('EVENT pipeline_log ===>', sioEvt)
        const { stage_index, step_index, data } = sioEvt
        if (data === '') {
          this.stages[stage_index - 1].isLoading = false
          const order = stage_index + 1
          const stageIdx = stage_index
          if (stage_index < this.stages.length) {
            this.changeFocusTab(order, stageIdx)
          } else {
            this.clearTimer()
          }
          return
        }
        const isHistoryMessage =
          this.stages[stage_index - 1].steps[step_index].message === data ||
          this.stages[stage_index - 1].steps[step_index].message === 'Loading...'
        if (isHistoryMessage) {
          this.stages[stage_index - 1].steps[step_index].message = data
        } else {
          this.stages[stage_index - 1].steps[step_index].message = this.stages[stage_index - 1].steps[
            step_index
          ].message.concat(data)
        }
      })
      // socket.on('disconnect', sioEvt => console.log('sio disconnect ===>', sioEvt))
    },
    async fetchStages() {
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
        this.setTimer()
      } catch (error) {
        console.error(error)
      }
    },
    changeFocusTab(order, stageIdx) {
      if (order === 1 && stageIdx === 0) {
        this.activeStage = `${order} ${this.stages[stageIdx].name}`
        if (this.emitStages.includes(stageIdx)) return
        this.handleClick({ index: stageIdx })
      } else {
        setTimeout(() => {
          this.activeStage = `${order} ${this.stages[stageIdx].name}`
          if (this.emitStages.includes(stageIdx)) return
          this.handleClick({ index: stageIdx })
        }, 2000)
      }
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
    setTimer() {
      this.timer = setInterval(() => this.updateStages(), 5000)
    },
    clearTimer() {
      clearInterval(this.timer)
      this.timer = null
    },
    scrollToBottom() {}
  }
}
</script>
