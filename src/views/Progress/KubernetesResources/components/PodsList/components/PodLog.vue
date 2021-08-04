<template>
  <el-dialog :visible="dialogVisible" width="90%" top="3vh" @close="handleClose">
    <span slot="title">
      <span class="text-title">{{ containerName }}</span>
    </span>
    <el-card
      id="podLogSection"
      shadow="never"
      :body-style="{
        color: '#fff',
        background: '#222',
        height: 'calc(100vh - 250px)',
        overflow: 'auto',
        'scroll-behavior': 'smooth'
      }"
    >
      <pre>{{ logData }}</pre>
    </el-card>
    <span slot="footer">
      <el-button @click="scrollTo('top')">{{ $t('general.ScrollToTop') }}</el-button>
      <el-button @click="scrollTo('bottom')">{{ $t('general.ScrollToBottom') }}</el-button>
      <el-button type="primary" @click="dialogVisible = false">{{ $t('general.Close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getPodLog } from '@/api/kubernetes'
import { mapGetters } from 'vuex'

export default {
  name: 'PodLog',
  props: {
    podName: {
      type: String,
      default: ''
    },
    containerName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      isLoading: false,
      logData: '',
      timer: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  methods: {
    async fetchData(podName, containerName) {
      this.isLoading = true
      await this.updateData(podName, containerName)
      this.timer = setInterval(() => this.updateData(podName, containerName), 5000)
      this.isLoading = false
    },
    async updateData(podName, containerName) {
      return getPodLog(this.selectedProjectId, podName, {
        container_name: containerName
      })
        .then(res => {
          if (res.data === this.logData) return 
          this.logData = res.data
          this.scrollTo('bottom')
        })
        .catch(err => {
          console.error(err)
        })
    },
    handleClose() {
      this.logData = ''
      this.dialogVisible = false
      clearInterval(this.timer)
      this.timer = null
    },
    scrollTo(target) {
      this.$nextTick(() => {
        const node = this.$el.querySelector('#podLogSection').childNodes[1]
        const anchor = target === 'bottom' ? node.scrollHeight : 0
        node.scrollTop = anchor
      })
    }
  }
}
</script>
