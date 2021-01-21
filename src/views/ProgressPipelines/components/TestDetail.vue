<template>
  <el-dialog title="Test Detail" :visible="dialogVisible" width="50%" @close="handleClose" :width="'80%'">
    <el-timeline>
      <el-timeline-item v-for="(activity, index) in activities" :key="index" placement="top">
        <el-card
          :body-style="{
            color: '#000000',
            background: '#FFFFFF',
            lineHeight: 2
          }"
        >
          <h4>
            <b>
              {{ activity.name }}
            </b>
            <el-tag :type="activity.state.toLowerCase()" effect="dark">
              {{ activity.state.toLowerCase() }}
            </el-tag>
          </h4>
          <el-divider />
          <el-card
            v-for="step in activity.steps"
            :key="step.message"
            class="mb-2"
            :body-style="{
              color: '#fff',
              background: '#333',
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
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Close</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    theData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      activities: []
    }
  },
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
    }
  }
}
</script>
<style lang="scss">
.el-upload-dragger {
  height: 50px;
}
</style>
