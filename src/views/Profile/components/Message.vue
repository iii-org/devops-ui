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
            <el-switch
              v-model="userMessageForm.notification"
              :disabled="userRole === 'Administrator'"
            />
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
    userMessageForm: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      isStopUpdateMessage: false
    }
  },
  computed: {
    ...mapGetters(['userId', 'userRole'])
  },
  watch: {
    userMessageForm: {
      async handler(form) {
        if (form.mail) {
          await this.handleMailChange()
          return
        }
        this.updateUserMessageInfo()
      },
      deep: true
    }
  },
  mounted() {
    if (this.userMessageForm.mail) {
      this.isStopUpdateMessage = true
      this.handleMailChange(true)
    }
  },
  methods: {
    async handleMailChange(isFirst) {
      const active = (await getRedmineMailActive()).data
      if (!active) {
        this.userMessageForm.mail = false
        this.$message({
          message: isFirst
            ? this.$t('Notify.RedmineMailAutoDisableWarning')
            : this.$t('Notify.RedmineMailActiveWarning'),
          type: 'warning'
        })
        this.isStopUpdateMessage = true
      } else {
        this.updateUserMessageInfo()
      }
    },
    async updateUserMessageInfo() {
      await updateUserMessageInfo(this.userId, this.userMessageForm)
        .then(() => {
          if (this.isStopUpdateMessage) {
            this.isStopUpdateMessage = false
            return
          }
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
