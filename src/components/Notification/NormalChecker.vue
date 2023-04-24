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
          v-for="msg in newMsgs"
          :key="msg.id"
          @click.native="showMessage(msg)"
        >
          <div class="flex pr-3" style="font-size: 13px;">
            <em
              class="ri-information-fill ri-lg mr-2 ml-2"
              style="align-self: center; color: #67c23a; font-size: 24px;"
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
  name: 'NormalChecker',
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
    getRelativeTime(value) {
      return getRelativeTime(value)
    }
  }
}
</script>

<style lang="scss" scoped>
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
  padding-right: 22px;
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
