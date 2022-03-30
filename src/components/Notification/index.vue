<template>
  <div class="flex right-menu items-center">
    <AbnormalChecker v-if="alert.length > 0" :msgs="alert" class="mx-3" />
    <NormalChecker v-if="info.length > 0" :msgs="info" class="mx-3" />
    <VersionChecker v-if="update.length > 0" :msgs="update" class="mx-3" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { io } from 'socket.io-client'

export default {
  name: 'Notification',
  components: {
    VersionChecker: () => import('@/components/Notification/VersionChecker'),
    AbnormalChecker: () => import('@/components/Notification/AbnormalChecker'),
    NormalChecker: () => import('@/components/Notification/NormalChecker')
  },
  data() {
    return {
      msgList: [],
      alert: [],
      info: [],
      update: [],
      socket: io(`/get_notification_message`, { // production socket
        reconnectionAttempts: 5
      })
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  mounted() {
    this.connectSocket()
  },
  beforeDestroy() {
    this.socket.disconnect()
  },
  methods: {
    async connectSocket() {
      this.setSocketListener()
      await this.socket.connect()
      await this.socket.emit('join', { user_id: this.userId })
      await this.socket.emit('get_message', { user_id: this.userId })
    },
    setSocketListener() {
      this.socket.on('system_message', async (data) => {
        this.setNotificationList(data)
      })
      this.socket.on('disconnect', (reason) => {
        if (reason === 'transport error' || reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          this.connectSocket()
        }
      })
    },
    setNotificationList(data) {
      // alert level = {1: INFO, 2: WARNING, 3: ERROR, 4: CRITICAL, 101: VERSION UPDATE}
      // type id = {1: ALL, 2: AM, 3: PROJECT, 4: USER}
      const findChangeIndex = this.msgList.findIndex(issue => parseInt(data.id) === parseInt(issue.id))
      if (findChangeIndex !== -1) {
        this.$set(this.msgList, findChangeIndex, data)
      } else {
        this.$set(this.msgList, this.msgList.length, data)
      }
      this.alert = this.msgList.filter((item) => item.alert_level !== 1)
      this.info = this.msgList.filter((item) => item.alert_level === 1)
      this.update = this.msgList.filter((item) => item.alert_level === 101)
    }
  }
}
</script>
