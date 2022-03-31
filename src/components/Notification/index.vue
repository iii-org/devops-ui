<template>
  <div class="flex right-menu items-center">
    <AbnormalChecker 
      v-if="alert.length > 0" 
      :msgs="alert" class="mx-3" 
      @read="readMessage"
    />
    <NormalChecker 
      v-if="info.length > 0" 
      :msgs="info" class="mx-3"
      @read="readMessage"
    />
    <VersionChecker 
      v-if="update.length > 0" 
      class="mx-3"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { io } from 'socket.io-client'
import { setReadMessage } from '@/api/monitoring'

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
        if (reason !== 'io client disconnect') {
          this.connectSocket()
        }
      })
    },
    setNotificationList(data) {
      // alert level = {1: INFO, 2: WARNING, 3: ERROR, 4: CRITICAL, 101: VERSION UPDATE}
      // type id = {1: ALL, 2: AM, 3: PROJECT, 4: USER}
      const findChangeIndex = this.msgList.findIndex(msg => parseInt(data.id) === parseInt(msg.id))
      if (findChangeIndex !== -1) {
        this.$set(this.msgList, findChangeIndex, data)
      } else {
        this.$set(this.msgList, this.msgList.length, data)
      }
      this.filterMsg()
    },
    filterMsg() {
      this.alert = this.msgList.filter((item) => item.alert_level !== 1)
      this.info = this.msgList.filter((item) => item.alert_level === 1)
      this.update = this.msgList.filter((item) => item.alert_level === 101)
    },
    readMessage(msg_id) {
      setReadMessage(this.userId, { message_ids: [msg_id] })
      const findChangeIndex = this.msgList.findIndex(msg => parseInt(msg_id) === parseInt(msg.id))
      this.$delete(this.msgList, findChangeIndex)
      this.filterMsg()
    }
  }
}
</script>
