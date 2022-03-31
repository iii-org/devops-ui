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
            class="cursor-pointer"
            viewBox="0 0 24 24" 
            width="24" 
            height="24"
          >
            <path fill="#D7A217" d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9.06 8.683L5.648 6.238 4.353 7.762l7.72 6.555 7.581-6.56-1.308-1.513-6.285 5.439z" />
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
          <div class="flex pr-3">
            <em 
              class="ri-information-fill ri-lg mr-2" 
              style="align-self: center; color: #67c23a"
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
