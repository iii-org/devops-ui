<template>
  <el-tooltip :content="$t('SystemVersion.hasUpdate')" placement="bottom" popper-class="update-tooltip">
    <span class="flex items-center swing-reverse" @click="toPage">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="cursor-pointer"
        style="color: #56b1e8"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M6.42883 2.41297C6.70119 2.10089 6.66899 1.62711 6.35692 1.35475C6.04484 1.08238 5.57106 1.11458 5.2987 1.42665L4.00689 2.90682C3.27413 3.74643 2.8599 4.81695 2.83666 5.9311L2.77998 8.64876C2.77135 9.06288 3.10006 9.4056 3.51418 9.41423C3.9283 9.42287 4.27102 9.09416 4.27966 8.68003L4.33634 5.96238C4.35223 5.20006 4.63565 4.4676 5.13702 3.89314L6.42883 2.41297Z" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.23703 7.70075C6.37593 5.48001 8.21752 3.75 10.4426 3.75H11V3C11 2.44772 11.4477 2 12 2C12.5523 2 13 2.44772 13 3V3.75H13.5574C15.7825 3.75 17.6241 5.48001 17.763 7.70074L17.984 11.2342C18.0682 12.5814 18.5205 13.8797 19.2916 14.9876C19.9883 15.9886 19.3681 17.3712 18.1571 17.5165L14.75 17.9254V19C14.75 20.5188 13.5188 21.75 12 21.75C10.4812 21.75 9.25001 20.5188 9.25001 19V17.9254L5.84288 17.5165C4.63196 17.3712 4.01173 15.9886 4.70842 14.9876C5.47948 13.8797 5.93177 12.5814 6.01603 11.2342L6.23703 7.70075ZM10.75 19C10.75 19.6904 11.3097 20.25 12 20.25C12.6904 20.25 13.25 19.6904 13.25 19V18.25H10.75V19Z" />
        <path d="M17.6431 1.35475C17.331 1.62711 17.2988 2.10089 17.5712 2.41297L18.863 3.89314C19.3644 4.46761 19.6478 5.20006 19.6637 5.96238L19.7204 8.68004C19.729 9.09416 20.0717 9.42287 20.4858 9.41423C20.9 9.4056 21.2287 9.06288 21.22 8.64876L21.1634 5.9311C21.1401 4.81695 20.7259 3.74643 19.9931 2.90683L18.7013 1.42666C18.429 1.11458 17.9552 1.08239 17.6431 1.35475Z" />
      </svg>
    </span>
  </el-tooltip>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'VersionChecker',
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['userRole', 'hasSystemUpdate', 'updateVersionName']),
    showUpdateButton() {
      return this.userRole === 'Administrator' && this.hasSystemUpdate && this.$route.name !== 'SystemVersion' && this.updateVersionName !== 'develop'
    }
  },
  mounted() {
    if (this.userRole === 'Administrator') this.checkApiVersion()
  },
  methods: {
    ...mapActions('settings', ['checkApiVersion']),
    toPage() {
      this.$router.push({ name: 'SystemVersion' })
    }
  }
}
</script>

<style lang="scss" scoped>
.swing-reverse {
  animation: swing 2s infinite;
}
</style>
