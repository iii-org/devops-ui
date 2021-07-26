<template>
  <el-button
    v-if="showUpdateButton"
    size="mini"
    type="warning"
    plain
    @mouseover.native="hover = true"
    @mouseleave.native="hover = false"
    @click="toPage"
  >
    <div class="flex items-center">
      <span class="dot relative" :class="hover ? 'bg-white' : 'bg-warning'" />
      <span class="dot absolute animate-ping" :class="hover ? 'bg-white' : 'bg-warning'" />
      <span class="ml-2">{{ $t('SystemVersion.hasUpdate') }}</span>
    </div>
  </el-button>
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

<style>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
