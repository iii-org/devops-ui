<template>
  <div class="flex justify-between items-center bg-gray-600 text-white py-3 px-4 rounded mb-5">
    <div class="flex items-center">
      <span class="dot relative" />
      <span class="dot absolute animate-ping" />
      <span class="text-title ml-3">新版本通知</span>
    </div>
    <el-button size="mini" type="success" plain @click="updateVersion">立即更新</el-button>
  </div>
</template>

<script>
import { getDevopsVersion, updateDevopsVersion } from '@/api/devopsVersion'
import { mapGetters } from 'vuex'
import { Loading } from 'element-ui'

export default {
  name: 'VersionUpdater',
  data() {
    return {
      loadingInstance: null,
      hover: false,
      hasUpdate: false
    }
  },
  computed: {
    ...mapGetters(['userRole']),
    showUpdater() {
      return this.userRole === 'Administrator' && this.hasUpdate
    }
  },
  mounted() {
    this.checkApiVersion()
  },
  methods: {
    async checkApiVersion() {
      const res = await getDevopsVersion()
      const { has_update } = res.data
      this.hasUpdate = has_update 
    },
    async updateVersion() {
      this.showLoading()
      // const res = updateDevopsVersion()
      this.hideLoading()
    },
    showLoading() {
      this.loadingInstance = Loading.service({
        lock: true,
        text: '更新中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    hideLoading() {
      setTimeout(() => {
        this.loadingInstance.close()
      }, 2000)
    }
  }
}

</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2 bg-success;
}
</style>
