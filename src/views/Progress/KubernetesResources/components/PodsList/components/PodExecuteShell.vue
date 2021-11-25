<template>
  <div class="app-container">
    <div class="flex justify-between mb-2">
      <div>
        <span class="text-title"><em class="ri-terminal-line mr-3" />{{ podName }}</span>
        <el-popover
          placement="top"
          width="160"
          trigger="hover"
        >
          <div>{{ $t('PodsList.ExecuteShellNotify') }}</div>
          <div>ls, ls -al, whoami, hostname, pwd, cd</div>
          <em
            slot="reference"
            class="ri-information-line ml-3"
          />
        </el-popover>
      </div>
      <div class="flex items-center">
        <span
          class="dot relative"
          :class="connectStatus"
        />
        <span
          class="dot absolute animate-ping"
          :class="connectStatus"
        />
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

const envKeys = [
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Escape',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12'
]
const fitAddon = new FitAddon()

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
      arrowUpQueue: [],
      arrowDownQueue: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'sidebar']),
    connectStatus() {
      return this.isConnected ? 'bg-success' : 'bg-danger'
    }
  },
  watch: {
    'sidebar.opened'(val) {
      fitAddon.fit()
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
      this.socket = io('/k8s/websocket/pod_exec', {
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
      this.socket.on('disconnect', (message) => {
        this.isConnected = false
        this.$notify({
          title: this.$t('general.Info'),
          message,
          type: 'warning'
        })
      })
    },
    setCmdResponseListener() {
      this.socket.on('get_cmd_response', (sioEvt) => {
        // console.log('get_cmd_response ===>', sioEvt)
        const { output } = sioEvt
        let str = output || sioEvt
        str = str.replace(/\n/g, '\r\n')
        this.term.writeln('\r\n' + str)
        this.term.write('\r\n# ')
      })
    },
    async initTerm() {
      this.term = new Terminal({
        rendererType: 'canvas',
        fontSize: 12,
        rows: Math.floor((window.innerHeight - 120) / 15),
        cursorBlink: true
      })
      this.term.open(this.$refs.terminal)
      await this.setResizeListener()
      this.term.write('\r\n# ')
      this.term.focus()
      this.setTermKeyListener()
    },
    setResizeListener() {
      return new Promise((resolve) => {
        this.term.loadAddon(fitAddon)
        fitAddon.fit()
        window.onresize = () => {
          try {
            fitAddon.fit()
          } catch (error) {
            console.error(error)
          }
        }
        resolve()
      })
    },
    setTermKeyListener() {
      this.term.onKey((data) => {
        const { key, keyCode } = data.domEvent
        if (envKeys.includes(key)) return
        if (keyCode === 13) {
          this.arrowUpQueue.push(this.command)
          this.onEnter()
        } else if (keyCode === 8) {
          this.onBackspace()
        } else if (key === 'ArrowUp') {
          this.onArrowUp()
        } else if (key === 'ArrowDown') {
          this.onArrowDown()
        } else {
          this.term.write(key)
          this.command += key
        }
      })
    },
    onArrowUp() {
      if (this.arrowUpQueue.length > 0) {
        const tempCommand = this.arrowUpQueue.pop()
        this.command = tempCommand
        this.arrowDownQueue.push(tempCommand)
        this.term.write('\x1b[2K\r')
        this.term.write('# ' + this.command)
      }
    },
    onArrowDown() {
      if (this.arrowDownQueue.length > 0) {
        const tempCommand = this.arrowDownQueue.pop()
        this.command = tempCommand
        this.arrowUpQueue.push(tempCommand)
        this.term.write('\x1b[2K\r')
        this.term.write('# ' + this.command)
      }
    },
    onEnter() {
      if (this.command === 'clear') {
        this.term.write('\r\n# ')
        this.term.clear()
      } else if (this.command === '') {
        this.term.write('\r\n# ')
      } else if (this.command.includes('cd')) {
        this.term.write('\r\n# ')
        this.emitCommand(this.command)
      } else {
        this.term.write('\r\n')
        this.emitCommand(this.command)
      }
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
      // console.log('emit ===>', emitObj)
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
