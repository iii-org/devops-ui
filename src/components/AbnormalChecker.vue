<template>
  <el-tooltip v-if="isSystemAbnormal" :content="$t('Dashboard.ADMIN.ExceptionNotification')" placement="bottom" popper-class="abnormal-tooltip">
    <span class="flex items-center swing" @click="toPage">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="cursor-pointer"
        style="color: #e85656;"
        width="30"
        height="30"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
    </span>
  </el-tooltip>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AbnormalChecker',
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['serverStatus']),
    isSystemAbnormal() {
      return !this.serverStatus.all_alive
    }
  },
  async mounted() {
    await this.getSystemServerStatus()
    this.fetchDataInterval()
  },
  methods: {
    ...mapActions('monitoring', ['getSystemServerStatus']),
    fetchDataInterval() {
      const tenMinutes = 1000 * 60 * 10
      let intervalTimer = window.setInterval(async () => {
        await this.getSystemServerStatus()
      }, tenMinutes)
      this.$once('hook:beforeDestroy', () => {
        clearInterval(intervalTimer)
        intervalTimer = null
      })
    },
    toPage() {
      this.$router.push({ name: 'ServiceMonitoring' })
    }
  }
}
</script>

<style lang="scss" scoped>
.swing {
  animation: swing 2s infinite;
}
</style>
