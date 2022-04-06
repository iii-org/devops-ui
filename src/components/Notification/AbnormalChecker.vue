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
          <div class="flex pr-3">
            <em 
              class="ri-error-warning-fill ri-lg mr-2" 
              style="align-self: center;"
              :style="{color: iconColor(msg.alert_level)}"
            />
            <span style="">
              <div class="msg-text">{{ msg.message }}</div>
              <div style="color: #909399; line-height: 25px"> {{ relativeTime(msg.created_at) }} </div>
            </span>
          </div>
          <el-divider class="divider" />
        </el-dropdown-item>
        <el-dropdown-item>
          <router-link
            :to="'/inbox/'"
            class="linkTextColor"
          >
            <el-button class="w-full" type="text">View All</el-button>
          </router-link>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
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
  </div>
</template>

<script>
import { UTCtoLocalTime, relativeTime } from '@/filters'

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
      message: {},
      dialogVisible: false
    }
  },
  methods: {
    showMessage(msg) {
      this.dialogVisible = true
      this.message = msg
      this.$emit('read', msg.id)
    },
    iconColor(alert_level) {
      // alert level = { 2: WARNING, 3: ERROR, 4: CRITICAL }
      return (alert_level === 2) ? '#e6d53c' : (alert_level === 3) ? '#e6a23c' : '#f56c6c'
    },
    UTCtoLocalTime(value) {
      return UTCtoLocalTime(value)
    },
    relativeTime(value) {
      return relativeTime(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.swing {
  animation: swing 1.5s infinite;
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
  width: 220px;
  height: 30px;
  font-weight: bold;
}
.dialog-title {
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;
  color: #45474b
}
.divider {
  margin: 0;
}
</style>
