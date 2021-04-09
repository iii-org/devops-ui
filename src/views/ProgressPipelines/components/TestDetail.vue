<template>
  <el-dialog :visible="dialogVisible" width="95%" top="10vh" @close="handleClose">
    <template slot="title">
      <span class="font-weight-bold text-h6 ml-4">
        {{ $t('ProcessDevBranchTest.TestDetail') }}
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
            class="el-tag--circle ml-2"
            :type="getStateTagType(stage.state)"
            size="mini"
            effect="dark"
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
// Testing
import { Manager } from 'socket.io-client'
import { mapGetters } from 'vuex'

export default {
  name: 'TestDetail',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    theData: {
      type: Array,
      default: () => []
    },
    pipelinesExecRun: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    stages: [],
    activeStage: ''
  }),
  computed: {
    ...mapGetters(['selectedProject'])
  },
  watch: {
    theData: {
      handler(val) {
        this.stages = val.map(item => item)
        this.activeStage = `1 ${this.stages[0].name}`
        this.handleClick({ index: 0 })
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('test-detail-visible', false)
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
          return 'warning'
        default:
          return 'slow'
      }
    },
    handleClick(tab) {
      const index = Number(tab.index)
      if (this.stages[index].isLoading === false) {
        return
      } else if (this.stages[index].state === 'Waiting') {
        this.stages[index].isLoading = false
        this.stages[index].steps.forEach(step => (step.message = 'Waiting'))
        return
      }
      const manager = new Manager(process.env.VUE_APP_BASE_API, { reconnectionAttempts: 5 })
      const { repository_id } = this.selectedProject
      const socket = manager.socket('/rancher/websocket/logs')
      this.stages[index].steps.forEach((step, stepIdx) => {
        const emitObj = {
          repository_id,
          pipelines_exec_run: this.pipelinesExecRun,
          stage_index: index + 1,
          step_index: step.step_id
        }
        socket.emit('get_pipe_log', emitObj)
        // console.log('sioEmit ===>', { emitObj, stage_index: emitObj.stage_index, step_index: emitObj.step_index })
        socket.on('pipeline_log', sioEvt => {
          const { stage_index, step_index, data } = sioEvt
          // console.log('sioEvt ===>', { sioEvt, stage_index, step_index, data })
          if (data.length && stage_index - 1 === index && step_index === stepIdx) {
            this.stages[index].steps[stepIdx].message = data
          } else if (!data.length && stage_index - 1 === index && step_index === stepIdx) {
            this.stages[index].isLoading = false
            socket.disconnect()
          }
        })
      })
    }
  }
}
</script>
