<template>
  <div class="tab-inner">
    <h3>{{ $t('Profile.MessageReceptionSetting') }}</h3>
    <el-form
      ref="userMessageForm"
      :model="userMessageForm"
      class="demo-ruleForm"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item :label="$t('Profile.PlatformNotice')">
            <el-switch v-model="userMessageForm.notification" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item :label="$t('Profile.MailNotice')">
            <el-switch v-model="userMessageForm.mail" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="mt-4">
        <el-col :span="8">
          <el-button
            class="buttonPrimary"
            @click="submitMessageSettings"
          >{{
            $t('Profile.Save')
          }}</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { updateUserMessageInfo } from '@/api_v2/user'

export default {
  name: 'Message',
  props: {
    userMessageForm: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    async submitMessageSettings() {
      await updateUserMessageInfo(this.userId, this.userMessageForm)
        .then((res) => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-inner {
  padding: 0 25px;
}
.form-input {
  width: 250px;
}
</style>
