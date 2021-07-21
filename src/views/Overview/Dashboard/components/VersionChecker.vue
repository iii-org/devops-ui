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
import { getDevopsVersion } from '@/api/devopsVersion'
import { mapGetters } from 'vuex'

export default {
  name: 'VersionChecker',
  data() {
    return {
      hover: false,
      hasUpdate: false
    }
  },
  computed: {
    ...mapGetters(['userRole']),
    showUpdateButton() {
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
    toPage() {
      this.$router.push({ name: 'SystemVersion' })
    }
  }
}
</script>

<style>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
