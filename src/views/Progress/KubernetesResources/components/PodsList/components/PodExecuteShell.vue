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

const envKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
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
      isConnected: false,
      commandQueue: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    connectStatus() {
      return this.isConnected ? 'bg-success' : 'bg-danger'
    }
  },
  // watch: {
  //   initPath() {
  //     const initStr = ['whoami', 'hostname', 'pwd']
  //     initStr.forEach(i => this.emitCommand(i))
  //   }
  // },
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
    disconnectSocket() {
      this.socket.close()
      this.term.dispose()
      this.isConnected = false
    },
    setConnectStatusListener() {
      this.socket.on('disconnect', message => {
        this.isConnected = false
        this.$notify({
          title: this.$t('general.Info'),
          message,
          type: 'warning'
        })
      })
    },
    setCmdResponseListener() {
      this.socket.on('get_cmd_response', sioEvt => {
        const { output } = sioEvt
        let str = output || sioEvt
        str = str.replace(/\n/g, '\r\n')
        this.term.writeln('\r\n' + str)
        this.term.write('\r\n# ')
      })
    },
    initTerm() {
      this.term = new Terminal({
        rendererType: 'canvas',
        fontSize: 12,
        rows: Math.floor((window.innerHeight - 120) / 15),
        cursorBlink: true
      })
      this.setResizeListener()
      this.term.open(this.$refs.terminal)
      this.term.write('\r\n# ')
      this.term.focus()
      this.setTermKeyListener()
    },
    setResizeListener() {
      const fitAddon = new FitAddon()
      this.term.loadAddon(fitAddon)
      fitAddon.fit()
      window.onresize = () => {
        try {
          fitAddon.fit()
        } catch (error) {
          console.log(error)
        }
      }
    },
    setTermKeyListener() {
      this.term.onKey(data => {
        const { key, code, keyCode } = data.domEvent
        console.log('on (Key, Code) ===>', key, code)
        if (envKeys.includes(key)) return
        if (keyCode === 13) {
          this.onEnter()
        } else if (keyCode === 8) {
          this.onBackspace()
        } else {
          this.term.write(key)
          this.command += key
        }
      })
    },
    onEnter() {
      // if (this.command === 'clear') {
      //   this.term.clear()
      // } else {
      //   this.emitCommand(this.command)
      // }
      this.emitCommand(this.command)
      this.command = ''
    },
    onBackspace() {
      this.command = this.command.substr(0, this.command.length - 1)
      this.term.write('\x1b[2K\r')
      this.term.write('# ' + this.command)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
