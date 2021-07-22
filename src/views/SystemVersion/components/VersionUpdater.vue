<template>
  <div v-if="showUpdater" class="flex justify-between items-center bg-gray-600 text-white py-3 px-4 rounded mb-5">
    <div class="flex items-center">
      <span class="dot relative" />
      <span class="dot absolute animate-ping" />
      <span class="text-title ml-3">{{ `${notifyTitle}（${updateVersionName}）` }}</span>
    </div>
    <el-button size="mini" type="success" plain @click="updateVersion">立即更新</el-button>
  </div>
</template>

<script>
import { updateDevopsVersion } from '@/api/devopsVersion'
import { mapActions, mapGetters } from 'vuex'
import { Loading } from 'element-ui'

export default {
  name: 'VersionUpdater',
  data() {
    return {
      loadingInstance: null,
      timer: null
    }
  },
  computed: {
    ...mapGetters(['userRole', 'hasSystemUpdate', 'updateVersionName']),
    showUpdater() {
      return this.userRole === 'Administrator' && this.hasSystemUpdate
    },
    notifyTitle() {
      return this.updateVersionName === 'develop' ? '開發版/Develop' : '新版本通知'
    }
  },
  mounted() {
    if (this.userRole === 'Administrator') this.checkApiVersion()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    ...mapActions('settings', ['checkApiVersion']),
    updateVersion() {
      this.showLoading()
      updateDevopsVersion()
        .then(() => this.handleUpdate())
        .catch(err => {
          console.error(err)
          this.loadingInstance.close()
        })
    },
    showLoading() {
      this.loadingInstance = Loading.service({
        lock: true,
        text: '更新中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    async handleUpdate() {
      const res = await this.checkApiVersion()
      const hasUpdate = res.data.has_update
      if (hasUpdate) {
        this.timer = setTimeout(() => {
          updateDevopsVersion()
            .then(() => this.handleUpdate())
            .catch(err => {
              this.loadingInstance.close()
              this.$message({
                message: '更新失敗',
                type: 'error'
              })
              console.error(err)
            })
        }, 5000)
      } else {
        this.loadingInstance.close()
      }
    },
    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2 bg-success;
}
</style>
