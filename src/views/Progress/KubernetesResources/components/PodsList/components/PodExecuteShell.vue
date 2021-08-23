<template>
  <div class="app-container">
    <el-button type="text" size="medium" icon="el-icon-arrow-left" @click="handleBackPage">
      {{ $t('general.Back') }}
    </el-button>
    <div class="flex justify-between mb-2">
      <span class="text-title"><em class="ri-terminal-line mr-3" />{{ podName }}</span>
      <div class="flex items-center">
        <span class="dot relative" :class="connectStatus" />
        <span class="dot absolute animate-ping" :class="connectStatus" />
        <span class="text-title ml-3">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
      </div>
    </div>
    <div class="p-3 bg-black">
      <div ref="terminal" />
    </div>
  </div>
</template>

<script>
import 'xterm/css/xterm.css'
import { io } from 'socket.io-client'
import { Terminal } from 'xterm'
import { mapGetters } from 'vuex'

export default {
  name: 'PodExecuteShell',
  data() {
    return {
      socket: null,
      term: null,
      projectName: '',
      podName: '',
      containerName: '',
      command: '',
      isConnected: false
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    connectStatus() {
      return this.isConnected ? 'bg-success' : 'bg-danger'
    }
  },
  mounted() {
    this.initSocket()
    this.containerName = this.$route.query.containerName
    this.podName = this.$route.query.podName
  },
  beforeDestroy() {
    if (this.isConnected) this.disconnectSocket()
  },
  methods: {
    initSocket() {
      this.socket =
        io('/k8s/websocket/pod_exec', {
        // io(process.env.VUE_APP_BASE_API + '/k8s/websocket/pod_exec', {
          reconnectionAttempts: 5,
          transports: ['websocket']
        })
      this.isConnected = true
      this.setConnectStatusListener()
      this.setCmdResponseListener()
      this.initTerm()
    },
    initTerm() {
      this.term = new Terminal({
        rendererType: 'canvas',
        cursorBlink: true
      })
      this.term.open(this.$refs.terminal)
      this.term.write(`\r\n$ `)
      this.term.focus()
      this.setTermKeyListener()
    },
    setConnectStatusListener() {
      // this.socket.on('connect', () => {
      //   this.isConnected = true
      //   this.$notify({
      //     title: this.$t('general.Success'),
      //     message: 'Pod Execute is Connected',
      //     type: 'success'
      //   })
      // })
      this.socket.on('disconnect', (msg) => {
        this.isConnected = false
        this.$notify({
          title: this.$t('general.Info'),
          message: `Pod Execute is disconnected (${msg})`,
          type: 'warning'
        })
      })
    },
    setCmdResponseListener() {
      this.socket.on('get_cmd_response', sioEvt => {
        const { output } = sioEvt
        let str = output || sioEvt
        str = str.replace(/\n/g, '\r\n')
        this.term.write(`${str}\r\n$ `)
      })
    },
    setTermKeyListener() {
      this.term.onKey(data => {
        const { key, domEvent } = data
        const { code } = domEvent
        if (code === 'Enter') {
          this.onEnter()
        } else if (code === 'Backspace') {
          this.onBackspace()
        } else {
          this.onKeydown(key)
        }
      })
    },
    onEnter() {
      if (this.command === 'clear') {
        this.term.clear()
        this.term.write(`\r\n$ `)
      } else if (this.command === '') {
        this.term.write(`\r\n$ `)
      } else {
        this.term.write(`\r\n`)
        this.emitCommand()
      }
      this.command = ''
    },
    onBackspace() {
      if (this.command.length === 0) return
      this.command = this.command.slice(0, -1)
      this.term.write('\b \b')
    },
    onKeydown(key) {
      this.command += key
      this.term.write(key)
    },
    emitCommand() {
      const emitObj = {
        project_name: this.selectedProject.name,
        pod_name: this.podName,
        container_name: this.containerName,
        command: this.command
      }
      this.socket.emit('pod_exec_cmd', emitObj)
      console.log('emit', emitObj)
    },
    disconnectSocket() {
      this.socket.close()
      this.term.dispose()
      this.isConnected = false
    },
    handleBackPage() {
      this.$router.push({ name: 'Pods List' })
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
