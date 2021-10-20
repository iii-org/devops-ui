<template>
  <el-tooltip v-if="showUpdateButton" :content="$t('SystemVersion.hasUpdate')" placement="bottom" popper-class="update-tooltip">
    <span class="flex items-center move" @click="toPage">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="cursor-pointer"
        style="color: #56b1e8"
        width="30"
        height="30"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
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
      hover: false
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
      this.hover = false
    }
  }
}
</script>

<style lang="scss" scoped>
.move {
  animation: move 2s infinite;
}

@keyframes move {
  10% {
    transform: rotate(15deg);
  }
  20% {
    transform: rotate(-10deg);
  }
  30% {
    transform: rotate(5deg);
  }
  40% {
    transform: rotate(-5deg);
  }
  50%, 100% {
    transform: rotate(0deg);
  }
}
</style>
