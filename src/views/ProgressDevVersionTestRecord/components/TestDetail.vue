<template>
  <el-dialog title="Test Detail" :visible="dialogVisible" width="50%" @close="handleClose">
    <el-timeline>
      <el-timeline-item v-for="(activity, index) in activities" :key="index" placement="top">
        <el-card
          :body-style="{
            color: '#fff',
            background: 'linear-gradient(to bottom right, #3a3985, #3499ff)',
            lineHeight: 2
          }"
        >
          <h4>
            <b>{{ activity }}</b>
          </h4>
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
