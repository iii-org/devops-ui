<template>
  <div v-if="showUpdater" class="flex justify-between items-center bg-gray-600 text-white py-3 px-4 rounded mb-5">
    <div class="flex items-center">
      <span class="dot relative" />
      <span class="dot absolute animate-ping" />
      <span class="text-title ml-3">{{ `${notifyTitle}（${updateVersionName}）` }}</span>
    </div>
    <el-button size="mini" type="success" plain @click="updateVersion">{{ $t('SystemVersion.UpdateNow') }}</el-button>
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
      return this.userRole === 'Administrator' && (this.updateVersionName === 'develop' || this.hasSystemUpdate)
    },
    notifyTitle() {
      return this.updateVersionName === 'develop'
        ? this.$t('SystemVersion.Develop')
        : this.$t('SystemVersion.NewVersion')
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
        text: this.$t('Updating'),
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
                message: this.$t('SystemVersion.UpdateFailed'),
                type: 'error'
              })
              console.error(err)
            })
        }, 5000)
      } else {
        this.loadingInstance.close()
        this.$message({
          message: this.$t('SystemVersion.UpdatedNotify'),
          type: 'success',
          duration: 12000
        })
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
