<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="tabActive" :tab-position="tabPosition">
        <el-tab-pane :label="$t('Profile.Basic')" name="basic">
          <Basic
            :from-ad="fromAd"
            :label-position="labelPosition"
            :disable-edit="disableEdit"
            :user-profile-form="userProfileForm"
          />
        </el-tab-pane>
        <el-tab-pane :label="$t('Profile.Security')" name="security">
          <Security
            :user-pwd-form="userPwdForm"
            :label-position="labelPosition"
            :disable-edit="disableEdit"
          />
        </el-tab-pane>
        <el-tab-pane :label="$t('Profile.Notice')" name="message">
          <Message
            v-if="tabActive === 'message'"
            :user-message-form.sync="userMessageForm"
            @update="fetchUserMessageInfo"
          />
        </el-tab-pane>
        <el-tab-pane :label="$t('Profile.ServerPassword')" name="server">
          <Server
            :server-password-form="serverPasswordForm"
            :disable-edit="disableEdit"
            @directToSecurity="tabActive = 'security'"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo } from '@/api/user'
import {
  getUserMessageInfo,
  getServerPasswordInfo
} from '@/api_v2/user'

export default {
  name: 'Profile',
  components: {
    Basic: () => import('./components/Basic'),
    Security: () => import('./components/Security'),
    Message: () => import('./components/Message'),
    Server: () => import('./components/Server')
  },
  data() {
    return {
      labelPosition: 'top',
      tabPosition: 'left',
      tabActive: 'basic',
      fromAd: false,
      userProfileForm: {
        userName: '',
        title: '',
        department: '',
        userEmail: '',
        userPhone: 0
      },
      userPwdForm: {
        userNewPwd: '',
        userRepeatNewPwd: '',
        old_password: ''
      },
      userMessageForm: {
        notification: false,
        mail: false
      },
      serverPasswordForm: []
    }
  },
  computed: {
    ...mapGetters(['userId']),
    disableEdit() {
      return this.fromAd
    }
  },
  mounted() {
    this.fetchUserInfo()
    this.fetchUserMessageInfo()
    this.fetchServerPasswordInfo()
  },
  methods: {
    async fetchUserInfo() {
      await getUserInfo(this.userId)
        .then((userProfile) => {
          this.fromAd = userProfile.from_ad
          this.userProfileForm.userName = userProfile.name
          this.userProfileForm.userEmail = userProfile.email
          this.userProfileForm.userPhone = userProfile.phone
          this.userProfileForm.department = userProfile.department
          this.userProfileForm.title = userProfile.title
        })
        .catch((error) => console.error(error))
    },
    async fetchUserMessageInfo() {
      await getUserMessageInfo(this.userId)
        .then((userMessageInfo) => {
          this.userMessageForm.notification = userMessageInfo.data.notification
          this.userMessageForm.mail = userMessageInfo.data.mail
        })
        .catch((error) => console.error(error))
    },
    async fetchServerPasswordInfo() {
      await getServerPasswordInfo(this.userId)
        .then((serverPasswordInfo) => {
          this.serverPasswordForm = serverPasswordInfo.data.map((item) => {
            if (item.status === 0) item.visible = false
            return item
          })
        })
        .catch((error) => console.error(error))
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';
>>> .el-tabs__item {
  &:hover {
    color: $linkTextColor !important;
    cursor: pointer;
  }
  &.is-active{
    color: $linkTextColor !important;
  }
}

>>> .el-tabs__active-bar {
  background-color: $linkTextColor !important;
}

</style>
