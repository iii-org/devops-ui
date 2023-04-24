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
    <MessageDialog ref="messageDialog" :message="message" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { io } from 'socket.io-client'
import MessageDialog from './components/MessageDialog.vue'
import { setReadMessage } from '@/api_v2/monitoring'
import { getLocalTime } from '@/utils/handleTime'

export default {
  name: 'Notification',
  components: {
    VersionChecker: () => import('@/components/Notification/VersionChecker'),
    AbnormalChecker: () => import('@/components/Notification/AbnormalChecker'),
    NormalChecker: () => import('@/components/Notification/NormalChecker'),
    MessageDialog
  },
  data() {
    return {
      msgList: [],
      alert: [],
      info: [],
      update: [],
      message: {},
      msgIds: [],
      socket: io(`/v2/get_notification_message`, {
        reconnectionAttempts: 5
      }),
      dateNow: new Date().toJSON().slice(0, 10)
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
    ...mapActions('user', ['setMessageIds']),
    async connectSocket() {
      this.setSocketListener()
      await this.socket.connect()
      await this.socket.emit('join', { user_id: this.userId })
      await this.socket.emit('get_message', { user_id: this.userId })
    },
    setSocketListener() {
      this.socket.on('create_message', async (data) => {
        this.setNotificationList(data)
        if (getLocalTime(data.created_at).slice(0, 10) >= this.dateNow) {
          this.$notification.show('III DevOps', {
            body: data.title,
            badge: 'https://www.iiidevops.org/wp-content/uploads/2021/07/IIIDevOps-logo.png',
            icon: 'https://www.iiidevops.org/wp-content/uploads/2021/07/IIIDevOps-logo.png'
          }, {
            onclick: () => this.readMessage(data)
          })
        }
      })
      this.onSocket('read_message')
      this.onSocket('delete_message')
      this.socket.on('disconnect', (reason) => {
        if (reason !== 'io client disconnect') {
          this.connectSocket()
        }
      })
    },
    onSocket(event) {
      this.socket.on(event, async (msg_id) => {
        const findChangeIndex = this.msgList.findIndex(msg => parseInt(msg_id) === parseInt(msg.id))
        this.$delete(this.msgList, findChangeIndex)
        this.filterMsg()
      })
    },
    setNotificationList(data) {
      // alert level = {1: INFO, 2: WARNING, 3: URGENT, 101: VERSION UPDATE, 102: SYSTEM ALERT, 103: SYSTEM WARNING}
      // type id = {1: ALL, 2: AM, 3: PROJECT, 4: USER}
      const findChangeIndex = this.msgList.findIndex(msg => parseInt(data.id) === parseInt(msg.id))
      if (findChangeIndex !== -1) {
        this.$set(this.msgList, findChangeIndex, data)
      } else {
        this.$set(this.msgList, this.msgList.length, data)
      }
      this.msgList = this.msgList
        .sort((a, b) => -(new Date(a.created_at) - new Date(b.created_at)))
      this.filterMsg()
    },
    filterMsg() {
      this.setMessageIds(this.msgList.filter(x => x.users_can_read === true).map(a => a.id))
      this.alert = this.msgList.filter((item) =>
        item.alert_level.id === 2 || item.alert_level.id === 3 ||
        item.alert_level.id === 102 || item.alert_level.id === 103 ||
        (item.alert_level.id >= 300 && item.alert_level.id < 400)
      )
      this.info = this.msgList.filter((item) =>
        item.alert_level.id === 1 ||
        (item.alert_level.id >= 200 && item.alert_level.id < 300)
      )
      this.update = this.msgList.filter((item) => item.alert_level.id === 101)
    },
    async readMessage(msg) {
      this.$refs.messageDialog.dialogVisible = true
      this.message = msg
      if (msg.users_can_read === true) {
        try {
          await setReadMessage(this.userId, { message_ids: [msg.id] }).then(() => {
            const findChangeIndex = this.msgList.findIndex(item => parseInt(msg.id) === parseInt(item.id))
            this.$delete(this.msgList, findChangeIndex)
            this.filterMsg()
          })
        } catch (err) {
          console.error(err)
        }
      }
    }
  }
}
</script>
