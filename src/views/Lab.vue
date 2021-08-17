<template>
  <div class="app-container">
    <project-list-selector class="mb-2" />
    <el-row :gutter="10" class="mb-3">
      <el-col :span="9">
        <el-input v-model="podName" size="small">
          <template slot="prepend">Pod Name</template>
        </el-input>
      </el-col>
      <el-col :span="10">
        <el-input v-model="containerName" label="Container Name" size="small">
          <template slot="prepend">Container Name</template>
        </el-input>
      </el-col>
      <el-col :span="5" class="text-right">
        <el-button type="primary" size="small" :disabled="isConnected" @click="initSocket">Connect</el-button>
        <el-button type="danger" size="small" :disabled="!isConnected" @click="disconnectSocket">Disconnect</el-button>
      </el-col>
    </el-row>
    <div class="flex justify-between mb-2">
      <span class="text-title"><em class="ri-terminal-line mr-2" />{{ podName }}</span>
      <div class="flex items-center">
        <span class="dot relative" :class="connectStatus" />
        <span class="dot absolute animate-ping" :class="connectStatus" />
        <span class="text-title ml-3">{{ isConnected ?'Connected':'Disconnected' }}</span>
      </div>
    </div>
    <div class="p-3 bg-black">
      <div ref="terminal" />
    </div>
    <div class="mt-3">
      Emit Data 
      <pre>{{ emitData }}</pre>
    </div>
  </div>
</template>

<script>
import 'xterm/css/xterm.css'
import { io } from 'socket.io-client'
import { Terminal } from 'xterm'
import { mapGetters } from 'vuex'
import { ProjectSelector } from '@/newMixins'

export default {
  name: 'Lab',
  mixins: [ProjectSelector],
  data() {
    return {
      socket: null,
      term: null,
      podName: 'devopsdb-64db86bc58-vsw59',
      containerName: '',
      command: '',
      isConnected: false,
      emitData: null
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    connectStatus() {
      return this.isConnected ? 'bg-success' : 'bg-danger'
    }
  },
  // mounted() {
  //   this.initSocket()
  // },
  beforeDestroy() {
    if (this.isConnected) this.disconnectSocket()
  },
  methods: {
    initSocket() {
      this.socket =
        // io('/k8s/websocket/pod_exec', {
        io(process.env.VUE_APP_BASE_API + '/k8s/websocket/pod_exec', {
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
      this.term.writeln('Connecting...')
      this.term.write(`\r\n$ `)
      this.term.focus()
      this.setTermKeyListener()
    },
    setConnectStatusListener() {
      this.socket.on('connect', () => {
        this.$notify({
          title: this.$t('general.Success'),
          message: 'Pod cmd 已連線',
          type: 'success'
        })
      })
      this.socket.on('disconnect', msg => {
        this.$notify({
          title: this.$t('general.Info'),
          message: 'Pod cmd 連線中斷',
          type: 'warning'
        })
      })
    },
    setCmdResponseListener() {
      this.socket.on('get_cmd_response', sioEvt => {
        console.log('setCmdResponseListener', sioEvt)
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
      }
      if (this.command === '') {
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
      this.emitData = emitObj
      console.log('emit', emitObj)
    },
    disconnectSocket() {
      this.socket.close()
      this.term.dispose()
      this.isConnected = false
      this.emitData = null
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
