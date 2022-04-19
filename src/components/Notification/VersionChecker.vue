<template>
  <el-tooltip :content="$t('SystemVersion.hasUpdate')" placement="bottom" popper-class="update-tooltip">
    <span class="flex items-center" @click="toPage">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="cursor-pointer"
        viewBox="0 0 24 24" 
        width="24"
        height="24"
      >
        <path fill="#56b1e8" d="M22 20H2v-2h1v-6.969C3 6.043 7.03 2 12 2s9 4.043 9 9.031V18h1v2zM9.5 21h5a2.5 2.5 0 1 1-5 0z" />
      </svg>
    </span>
  </el-tooltip>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'VersionChecker',
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['userRole', 'hasSystemUpdate', 'updateVersionName']),
    showUpdateButton() {
      return this.userRole === 'Administrator' && this.hasSystemUpdate && this.$route.name !== 'SystemVersion' && this.updateVersionName !== 'develop'
    }
  },
  mounted() {
    if (this.userRole === 'Administrator') this.checkApiVersion()
  },
  methods: {
    ...mapActions('settings', ['checkApiVersion']),
    toPage() {
      this.$router.push({ name: 'SystemVersion' })
    }
  }
}
</script>

<style lang="scss" scoped>
.swing-reverse {
  animation: swing 2s infinite;
}
</style>
