<template>
  <el-dialog title="Test Detail" :visible="dialogVisible" width="90%" @close="handleClose">
    <el-timeline>
      <el-timeline-item v-for="(activity, idx) in activities" :key="idx" placement="top">
        <el-card
          :body-style="{
            color: '#000',
            background: '#fcf7f8',
            lineHeight: 2
          }"
        >
          <div class="d-flex justify-space-between mb-3">
            <span class="text-h6"><i class="el-icon-tickets mr-2" /> {{ activity.name }} </span>
            <el-tag v-if="activity.state" :type="getStateTagType(activity.state)" size="medium" effect="dark">
              {{ activity.state }}
            </el-tag>
          </div>
          <el-card
            v-for="(step, stepIdx) in activity.steps"
            :key="stepIdx"
            class="mb-2"
            :body-style="{
              color: '#fff',
              background: '#222',
              lineHeight: 1,
              fontSize: '14px',
              height: '300px',
              overflow: 'auto'
            }"
            shadow="never"
          >
            <pre>{{ step.message }}</pre>
          </el-card>
        </el-card>
      </el-timeline-item>
    </el-timeline>
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
    activities: []
  }),
  computed: {
    ...mapGetters(['selectedProject'])
  },
  watch: {
    theData: {
      immediate: true,
      handler(val) {
        this.activities = val
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
      this.activities.forEach((item, itemIdx) =>
        item.steps.forEach((step, stepIdx) => {
          const emitObj = { repository_id, pipelines_exec_run: 3, stage_index: item.stage_id, step_index: step.step_id }
          const manager = new Manager(process.env.VUE_APP_BASE_API, { reconnectionAttempts: 5 })
          const socket = manager.socket('/rancher/websocket/logs')
          // socket.on('connect', () => {
          //   console.log('socket.connected', socket.connected)
          // })
          socket.emit('get_pipe_log', emitObj)
          socket.on('pipeline_log', sioEvt => {
            const { data } = sioEvt
            data.length ? this.$set(this.activities[itemIdx].steps[stepIdx], 'message', data) : socket.disconnect()
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
