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
            v-if="canSave"
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
import { mapGetters } from 'vuex'
import { updateUserMessageInfo } from '@/api_v2/user'
import { getRedmineMailActive } from '@/api/redmineMail'

export default {
  name: 'Message',
  props: {
    originalMessageForm: {
      type: Object,
      default: () => ({})
    },
    userMessageForm: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapGetters(['userId']),
    canSave() {
      return !this.compareObj(this.userMessageForm, this.originalMessageForm)
    }
  },
  watch: {
    async 'userMessageForm.mail'(bool) {
      if (bool !== undefined && bool && !this.originalMessageForm.mail) {
        const active = (await getRedmineMailActive()).data
        if (!active) this.userMessageForm.mail = false
        this.$message({
          message: this.$t('Notify.RedmineMailActiveWarning'),
          type: 'warning'
        })
      }
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
        .finally(() => {
          this.$emit('update')
        })
    },
    compareObj(obj1, obj2) {
      const Obj1_keys = Object.keys(obj1)
      const Obj2_keys = Object.keys(obj2)
      if (Obj1_keys.length !== Obj2_keys.length) {
        return false
      }
      for (const k of Obj1_keys) {
        if (obj1[k] !== obj2[k]) {
          return false
        }
      }
      return true
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
