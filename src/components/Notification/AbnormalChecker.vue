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
          v-for="msg in newMsgs"
          :key="msg.id"
          class="pa-0"
          @click.native="showMessage(msg)"
        >
          <div class="flex pr-3" style="font-size: 13px;">
            <em
              class="ri-error-warning-fill ri-lg mr-2 ml-2"
              style="align-self: center; font-size: 24px;"
              :style="{color: iconColor(msg.alert_level)}"
            />
            <span>
              <div class="msg-text">{{ msg.title ? msg.title : 'No Title' }}</div>
              <div style="color: #909399; line-height: 20px"> {{ getRelativeTime(msg.created_at) }} </div>
            </span>
          </div>
          <el-divider class="divider" />
        </el-dropdown-item>
        <el-dropdown-item>
          <router-link
            :to="'/inbox/'"
            class="linkTextColor"
          >
            <el-button class="w-full" type="text">{{ $t('Inbox.ViewAll') }}</el-button>
          </router-link>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { getRelativeTime } from '@/utils/handleTime'

export default {
  name: 'AbnormalChecker',
  props: {
    msgs: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    newMsgs() {
      if (this.msgs.length > 10) {
        return this.msgs.slice(0, 10)
      }
      return this.msgs
    }
  },
  methods: {
    showMessage(msg) {
      this.$emit('read', msg)
    },
    iconColor(alert_level) {
      // alert level = { 2: WARNING, 3: URGENT, 102: SYSTEM ALERT, 103: SYSTEM WARNING }
      if (alert_level === 2 || alert_level === 103) return '#e6d53c'
      else if (alert_level === 3) return '#e6a23c'
      else return '#f56c6c'
    },
    getRelativeTime(value) {
      return getRelativeTime(value)
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
  line-height: 22px;
  font-weight: bold;
  padding-right: 10px;
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
