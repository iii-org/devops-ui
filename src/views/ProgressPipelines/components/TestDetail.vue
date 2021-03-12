<template>
  <el-dialog :visible="dialogVisible" width="95%" @close="handleClose">
    <template slot="title">
      <span class="font-weight-bold text-h6 ml-4">
        {{ $t('ProcessDevBranchTest.TestDetail') }}
      </span>
    </template>

    <!-- <el-timeline>
      <el-timeline-item v-for="(stage, idx) in stages" :key="idx" placement="top">
        <el-card
          :body-style="{
            color: '#000',
            background: '#DADADA',
            lineHeight: 2
          }"
        >
          <div class="d-flex justify-space-between mb-3">
            <span class="text-h6">
              <i class="el-icon-tickets mr-2" />
              <span class="mr-3">{{ stage.name }}</span>
              <i v-if="stage.isLoading" class="el-icon-loading font-weight-bold" style="color: #F89F03" />
              <i v-else class="el-icon-check font-weight-bold" style="color: #72C040" />
            </span>
            <el-tag
              v-if="stage.state"
              :type="getStateTagType(stage.state)"
              class="font-weight-bold"
              size="medium"
              effect="dark"
            >
              {{ stage.state }}
            </el-tag>
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
              'max-height': '300px',
              overflow: 'auto'
            }"
            shadow="never"
          >
            <pre>{{ step.message }}</pre>
          </el-card>
        </el-card>
      </el-timeline-item>
    </el-timeline> -->

    <el-tabs v-model="activeStage" tab-position="left">
      <el-tab-pane v-for="(stage, idx) in stages" :key="idx" :name="stage.name">
        <div slot="label">
          <div>
            <el-tag
              v-if="stage.state"
              :type="getStateTagType(stage.state)"
              class="mr-2"
              size="mini"
              effect="dark"
            >
              {{ stage.state }}
            </el-tag>
            {{ stage.name }}
          </div>
        </div>
        <el-card
          :body-style="{
            color: '#000',
            background: '#DADADA',
            lineHeight: 2
          }"
        >
          <div class="d-flex justify-space-between mb-3">
            <span class="text-h6">
              <i class="el-icon-tickets mr-2" />
              <span class="mr-3">{{ stage.name }}</span>
              <i v-if="stage.isLoading" class="el-icon-loading font-weight-bold" style="color: #F89F03" />
              <i v-else class="el-icon-check font-weight-bold" style="color: #72C040" />
            </span>
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
              'max-height': '40vh',
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
        this.stages = val
        this.activeStage = this.stages[0].name
        this.fetchHarborLogByStep()
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
    fetchHarborLogByStep() {
      const { repository_id } = this.selectedProject
      this.stages.forEach((item, itemIdx) =>
        item.steps.forEach((step, stepIdx) => {
          const emitObj = { repository_id, pipelines_exec_run: 3, stage_index: item.stage_id, step_index: step.step_id }
          this.$set(this.stages[itemIdx], 'isLoading', true)
          const manager = new Manager(process.env.VUE_APP_BASE_API, { reconnectionAttempts: 5 })
          const socket = manager.socket('/rancher/websocket/logs')
          // socket.on('connect', () => {
          //   console.log('socket.connected', socket.connected)
          // })
          socket.emit('get_pipe_log', emitObj)
          socket.on('pipeline_log', sioEvt => {
            const { data } = sioEvt
            if (data.length) {
              this.$set(this.stages[itemIdx].steps[stepIdx], 'message', data)
            } else {
              socket.disconnect()
              this.stages[itemIdx].isLoading = false
            }
          })
          // socket.on('disconnect', () => {
          //   console.log('socket.disconnected', socket.disconnected)
          // })
        })
      )
    }
  }
}
</script>
