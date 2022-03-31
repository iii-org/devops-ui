<template>
  <div class="flex right-menu items-center">
    <el-dropdown
      trigger="click"
      class="international"
    >
      <span class="flex items-center">
        <el-badge :value="msgs.length" class="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            class="cursor-pointer swing"
            viewBox="0 0 24 24" 
            width="24" 
            height="24"
          >
            <path fill="#e85656" d="M12.866 3l9.526 16.5a1 1 0 0 1-.866 1.5H2.474a1 1 0 0 1-.866-1.5L11.134 3a1 1 0 0 1 1.732 0zM11 16v2h2v-2h-2zm0-7v5h2V9h-2z" />
          </svg>
        </el-badge>
      </span>
      <el-dropdown-menu slot="dropdown" style="width: 300px; max-height: 50%" class="filter-list">
        <el-dropdown-item
          v-for="msg in msgs"
          :key="msg.id"
          class="pa-0"
          @click.native="showMessage(msg)"
        >
          <div class="flex">
            <em 
              class="ri-error-warning-fill ri-lg mr-2" 
              style="align-self: center" 
              :style="{color: iconColor(msg.alert_level)}"
            />
            <span class="msg-text">{{ msg.message }}</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog
      title="Message"
      :show-close="false"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-input
        type="textarea"
        :value="message"
        readonly
        resize="none"
      />
      <span slot="footer" class="dialog-footer">
        <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AbnormalChecker',
  props: {
    msgs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      message: '',
      dialogVisible: false
    }
  },
  methods: {
    showMessage(msg) {
      this.dialogVisible = true
      this.message = msg.message
      this.$emit('read', msg.id)
    },
    iconColor(alert_level) {
      // alert level = { WARNING, 3: ERROR, 4: CRITICAL }
      return (alert_level === 2) ? '#e6d53c' : (alert_level === 3) ? '#e6a23c' : '#f56c6c'
    }
  }
}
</script>

<style lang="scss" scoped>
.swing {
  animation: swing 2s infinite;
}
.filter-list {
  max-height: 80vh;
  overflow-x: hidden;
  overflow-y: scroll;
  overflow-y: overlay;
}
.msg-text {
  white-space: nowrap; 
  text-overflow: ellipsis; 
  overflow: hidden; 
}
</style>
