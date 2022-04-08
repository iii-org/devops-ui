<template>
  <el-dialog
    :show-close="false"
    :visible.sync="dialogVisible"
    width="30%"
  >
    <template slot="title" style="padding: 0">
      <div class="dialog-title">Message</div>
      <div style="color: #45474b">{{ UTCtoLocalTime(message.created_at) }}</div>
    </template>
    <el-input
      style="padding: 0"
      type="textarea"
      :value="message.message"
      readonly
      resize="none"
      :autosize="{ minRows: 2, maxRows: 5}"
    />
    <span slot="footer" class="dialog-footer">
      <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">Close</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { UTCtoLocalTime } from '@/filters'

export default {
  name: 'MessageDialog',
  props: {
    message: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    UTCtoLocalTime(value) {
      return UTCtoLocalTime(value)
    }
  }
}
</script>
