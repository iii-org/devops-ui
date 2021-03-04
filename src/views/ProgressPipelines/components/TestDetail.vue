<template>
  <el-dialog title="Test Detail" :visible="dialogVisible" width="80%" @close="handleClose">
    <el-timeline>
      <el-timeline-item v-for="(activity, idx) in activities" :key="idx" placement="top">
        <el-card
          :body-style="{
            color: '#000',
            background: '#FFF',
            lineHeight: 2
          }"
        >
          <div class="d-flex justify-space-between">
            <span class="text-h6"> {{ activity.name }} </span>
            <el-tag v-if="activity.state" :type="getStateTagType(activity.state)" size="medium" effect="dark">
              {{ activity.state }}
            </el-tag>
          </div>
          <el-divider />
          <el-card
            v-for="step in activity.steps"
            :key="step.message"
            class="mb-2"
            :body-style="{
              color: '#fff',
              background: '#222',
              lineHeight: 1,
              fontSize: '14px',
              height: '200px',
              overflow: 'auto'
            }"
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
  watch: {
    theData: {
      immediate: true,
      handler(val) {
        this.activities = val
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
    }
  }
}
</script>
