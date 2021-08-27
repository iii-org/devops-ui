<template>
  <div class="app-container">
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
import { FitAddon } from 'xterm-addon-fit'
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
        fontSize: 12,
        rows: Math.floor((window.innerHeight - 120) / 15),
        cursorBlink: true
      })
      const fitAddon = new FitAddon()
      this.term.loadAddon(fitAddon)
      fitAddon.fit()
      window.addEventListener('resize', resizeScreen)
      function resizeScreen() {
        try { 
          fitAddon.fit()
        } catch (e) {
          console.log('e', e.message)
        }
      }
      this.term.open(this.$refs.terminal)
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
      this.term.onKey(key => {
        console.log('onKey ===>', key)
        const { code } = key.domEvent
        if (code === 'Enter') {
          this.onEnter()
        } else if (code === 'Backspace') {
          this.onBackspace()
        } else if (code === 'ArrowUp') {
          this.command = this.commandQueue[this.commandQueue.length - 1]
          this.term.write(this.command)
        } else if (code === 'ArrowDown') {
          this.command = this.commandQueue[this.commandQueue.length + 1]
          this.term.write(this.command)
        }
      }) 
      this.term.onData(data => {
        console.log('onData ===>', data)
        if (data.length > 1) {
          this.command += data
          this.term.write(data)
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
        this.emitCommand(this.command)
        this.commandQueue.push(this.command)
        this.term.write(`\r\n`)
      }
      this.command = ''
    },
    onBackspace() {
      if (this.command.length === 0) return
      this.command = this.command.slice(0, -1)
      this.term.write('\b \b')
    },
    emitCommand(command) {
      const { podName, containerName, selectedProject } = this
      const emitObj = {
        project_name: selectedProject.name,
        pod_name: podName,
        container_name: containerName,
        command
      }
      this.socket.emit('pod_exec_cmd', emitObj)
      console.log('emit ===>', emitObj)
    },
    disconnectSocket() {
      this.socket.close()
      this.term.dispose()
      this.isConnected = false
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
