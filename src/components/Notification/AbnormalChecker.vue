<template>
  <div class="flex right-menu items-center">
    <el-dropdown
      trigger="click"
      class="international"
    >
      <span class="flex items-center">
        <el-badge :value="msgs.length" class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="cursor-pointer"
            style="color: #e85656;"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M9.72961 3.99268C10.8216 2.39501 13.1784 2.39502 14.2703 3.99268L14.7023 4.62463C17.4083 8.58385 19.7333 12.7905 21.646 17.1881L21.7362 17.3956C22.4103 18.9453 21.3919 20.705 19.7124 20.8927C14.5867 21.4656 9.41323 21.4656 4.2876 20.8927C2.60805 20.705 1.58969 18.9453 2.26374 17.3956L2.35396 17.1881C4.26669 12.7905 6.59165 8.58384 9.29769 4.62463L9.72961 3.99268ZM13 9.00005C13 9.55233 12.5523 10 12 10C11.4477 10 11 9.55233 11 9.00005C11 8.44776 11.4477 8.00005 12 8.00005C12.5523 8.00005 13 8.44776 13 9.00005ZM12 11.75C12.4142 11.75 12.75 12.0858 12.75 12.5V17.5C12.75 17.9143 12.4142 18.25 12 18.25C11.5858 18.25 11.25 17.9143 11.25 17.5V12.5C11.25 12.0858 11.5858 11.75 12 11.75Z" clip-rule="evenodd" />
          </svg>
        </el-badge>
      </span>
      <el-dropdown-menu slot="dropdown" style="width: 260px">
        <el-dropdown-item
          v-for="msg in msgs"
          :key="msg.id"
          class="pa-0"
          @click.native="showMessage(msg)"
        >
          <el-row class="flex">
            <el-col :span="4" style="line-height: 28px">
              <em class="el-icon-warning" style="color: #D7A217" />
            </el-col>
            <el-col style="line-height: 24px"> 
              {{ msg.message }}
            </el-col>
          </el-row>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog
      title="Message"
      :show-close="false"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-input
        type="textarea"
        :value="message"
        readonly
        resize="none"
      />
      <span slot="footer" class="dialog-footer">
        <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">Close</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AbnormalChecker',
  props: {
    msgs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      message: '',
      dialogVisible: false
    }
  },
  // computed: {
  //   ...mapGetters(['serverStatus']),
  //   isSystemAbnormal() {
  //     return !this.serverStatus.all_alive
  //   }
  // },
  // async mounted() {
  //   await this.getSystemServerStatus()
  //   this.fetchDataInterval()
  // },
  methods: {
    // ...mapActions('monitoring', ['getSystemServerStatus']),
    // fetchDataInterval() {
    //   const tenMinutes = 1000 * 60 * 10
    //   let intervalTimer = window.setInterval(async () => {
    //     await this.getSystemServerStatus()
    //   }, tenMinutes)
    //   this.$once('hook:beforeDestroy', () => {
    //     clearInterval(intervalTimer)
    //     intervalTimer = null
    //   })
    // },
    // toPage() {
    //   this.$router.push({ name: 'Service Monitoring' })
    // }
    showMessage(msg) {
      console.log(msg)
      this.dialogVisible = true
      this.message = msg.message
    }
  }
}
</script>

<style lang="scss" scoped>
.swing {
  animation: swing 2s infinite;
}
</style>
