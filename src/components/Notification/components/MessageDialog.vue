<template>
  <el-dialog
    :show-close="false"
    :visible.sync="dialogVisible"
    width="50%"
  >
    <template slot="title">
      <h2 style="margin-bottom: 12px">{{ message.title ? message.title : 'No Title' }}</h2>
      <div style="color: #45474b">{{ UTCtoLocalTime(message.created_at) }}</div>
    </template>
    <div class="border">
      <Viewer :initial-value="message.message" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">{{ $t('general.Close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { UTCtoLocalTime } from '@/filters'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import { Viewer } from '@toast-ui/vue-editor'

export default {
  name: 'MessageDialog',
  components: { Viewer },
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

<style>
.el-dialog__header {
  padding: 10px 20px 0px 20px
}
.border {
  border: 2px solid rgb(180, 180, 180);
  border-radius: 5px;
  border-width: medium;
  padding: 10px 10px 10px 10px
}
</style>
