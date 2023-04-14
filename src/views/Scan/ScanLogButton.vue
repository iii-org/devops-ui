<template>
  <span class="ml-2">
    <el-button
      v-if="pod.has_pod"
      class="buttonPrimary"
      :disabled="selectedProjectId === -1"
      @click="handleLogClick"
    >
      <em class="ri-computer-line mr-1" />
      {{ $t('SonarQube.ScanLogs') }}
    </el-button>
    <PodLog
      ref="podLogDialog"
      :pod-name="pod.pod_name"
      :container-name="pod.container_name"
    />
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPluginPod } from '@/api_v2/scans'
import PodLog from '@/views/SystemResource/PluginResource/components/PodsList/components/PodLog'

export default {
  name: 'ScanLogButton',
  components: {
    PodLog
  },
  data() {
    return {
      pod: {}
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  mounted() {
    this.getPluginPod(this.getPluginName())
  },
  methods: {
    async getPluginPod(plugin_name) {
      await getPluginPod(this.selectedProjectId, plugin_name)
        .then((res) => {
          this.pod = res.data
        })
    },
    getPluginName() {
      switch (this.$route.name) {
        case 'Sonarqube':
          return 'sonarqube'
        case 'Checkmarx':
          return 'checkmarx'
        case 'Sbom':
          return 'anchore'
        case 'Zap':
          return 'test-zap'
        case 'Cmas':
          return 'cmas'
        case 'Webinspect':
          return 'test-webinspect'
        case 'Postman':
          return 'newman'
        case 'Sideex':
          return 'text-sideex'
        default:
          return null
      }
    },
    handleLogClick() {
      this.$refs.podLogDialog.fetchData(this.pod.pod_name, this.pod.container_name)
      this.$refs.podLogDialog.dialogVisible = true
    }
  }
}
</script>
