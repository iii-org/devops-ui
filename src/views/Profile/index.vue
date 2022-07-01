<template>
  <div class="app-container">
    <el-card>
      <el-tabs :tab-position="tabPosition">
        <el-tab-pane :label="$t('Profile.Basic')">
          <Basic
            :from-ad="fromAd"
            :label-position="labelPosition"
            :disable-edit="disableEdit"
            :user-profile-form="userProfileForm"
          />
        </el-tab-pane>
        <el-tab-pane :label="$t('Profile.Security')">
          <Security
            :user-pwd-form="userPwdForm"
            :label-position="labelPosition"
            :disable-edit="disableEdit"
          />
        </el-tab-pane>
        <el-tab-pane :label="$t('Profile.Notice')">
          <Message
            :original-message-form="originalMessageForm"
            :user-message-form="userMessageForm"
            :label-position="labelPosition"
            @update="fetchUserMessageInfo"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo } from '@/api/user'
import { getUserMessageInfo } from '@/api_v2/user'

export default {
  name: 'Profile',
  components: {
    Basic: () => import('./components/Basic'),
    Security: () => import('./components/Security'),
    Message: () => import('./components/Message')
  },
  data() {
    return {
      labelPosition: 'top',
      tabPosition: 'left',
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
      originalMessageForm: {
        notification: false,
        mail: false
      },
      userMessageForm: {
        notification: false,
        mail: false
      }
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
          this.originalMessageForm.notification = userMessageInfo.data.notification
          this.originalMessageForm.mail = userMessageInfo.data.mail
          this.userMessageForm.notification = userMessageInfo.data.notification
          this.userMessageForm.mail = userMessageInfo.data.mail
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
