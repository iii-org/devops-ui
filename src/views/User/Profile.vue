<template>
  <div class="app-container">
    <el-card>
      <el-tabs :tab-position="tabPosition">
        <el-tab-pane :label="$t('Profile.Basic')">
          <div class="tab-inner">
            <h3>{{ $t('Profile.ProfileBasicSetting') }}</h3>
            <el-form
              ref="userProfileForm"
              :model="userProfileForm"
              :rules="userProfileRules"
              label-width="100px"
              class="demo-ruleForm"
              :label-position="labelPosition"
            >
              <el-form-item v-if="'from_ad' in $data" :label="$t('User.Source')" class="form-input">
                <el-input v-model="source" :disabled="true" />
              </el-form-item>
              <el-form-item :label="$t('general.Name')" prop="userName">
                <el-input v-model="userProfileForm.userName" :disabled="disableEdit" class="form-input" />
              </el-form-item>
              <el-form-item :label="$t('Profile.Department')">
                <el-input v-model="userProfileForm.department" :disabled="disableEdit" class="form-input" />
              </el-form-item>
              <el-form-item :label="$t('Profile.Title')">
                <el-input v-model="userProfileForm.title" :disabled="disableEdit" class="form-input" />
              </el-form-item>
              <el-form-item label="Email" prop="userEmail">
                <el-input v-model="userProfileForm.userEmail" :disabled="disableEdit" class="form-input" />
              </el-form-item>
              <el-form-item :label="$t('Profile.Phone')" prop="userPhone">
                <el-input v-model="userProfileForm.userPhone" :disabled="disableEdit" class="form-input" />
              </el-form-item>
            </el-form>
            <el-row class="mt-4">
              <el-col :span="8">
                <el-button type="primary" @click="downloadK8SConfig()">{{ $t('Profile.K8SConfigDownload') }}</el-button>
              </el-col>
            </el-row>
            <el-row class="mt-4">
              <el-col :span="8">
                <el-button :disabled="disableEdit" type="primary" @click="submitUpdateUserProfile('userProfileForm')">{{
                  $t('Profile.Save')
                }}</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('Profile.Security')">
          <div class="tab-inner">
            <h3>{{ $t('Profile.ProfileSecuritySetting') }}</h3>
            <el-form
              ref="userPwdForm"
              :model="userPwdForm"
              :rules="userPwdFormRules"
              label-width="100px"
              class="demo-ruleForm"
              :label-position="labelPosition"
            >
              <el-form-item :label="$t('Profile.Password')" prop="old_password">
                <el-input v-model="userPwdForm.old_password" :disabled="disableEdit" type="password" class="form-input" />
              </el-form-item>
              <el-form-item :label="$t('Profile.NewPassword')" prop="userNewPwd">
                <el-input v-model="userPwdForm.userNewPwd" :disabled="disableEdit" type="password" class="form-input" />
                <div style="word-break: keep-all; margin-top: 5px">
                  {{ $t('Profile.PasswordRule') }}
                </div>
              </el-form-item>
              <el-form-item :label="$t('Profile.RepeatNewPassword')" prop="userRepeatNewPwd">
                <el-input v-model="userPwdForm.userRepeatNewPwd" :disabled="disableEdit" type="password" class="form-input" />
              </el-form-item>
            </el-form>
            <el-row class="mt-4">
              <el-col :span="8">
                <el-button :disabled="disableEdit" type="primary" @click="handleUpdateUserPwd('userPwdForm')">{{
                  $t('Profile.Save')
                }}</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import store from '@/store'
import { updateUser, getInfo, getK8SConfig } from '@/api/user'

export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length > 0 && value.length < 8) {
        callback(new Error('The password can not be less than 8 characters'))
      } else if (this.userPwdForm.old_password === value) {
        callback(new Error('Your new password must be different from your old password.'))
      } else {
        callback()
      }
    }
    const checkRepeatPwd = (rule, value, callback) => {
      if (value !== this.userPwdForm.userNewPwd) {
        callback(new Error('password not same'))
      } else {
        callback()
      }
    }
    return {
      labelPosition: 'top',
      tabPosition: 'left',
      from_ad: false,
      userName: '',
      userEmail: '',
      userPhone: 0,
      userId: 0,
      userOldPwd: '',
      userNewPwd: '',
      userRepeatNewPwd: '',
      userProfileForm: {
        userName: '',
        title: '',
        department: '',
        userEmail: '',
        userPhone: 0
      },
      userProfileRules: {
        userName: [{ required: true, message: 'Please input user name', trigger: 'blur' }],
        userEmail: [
          { required: true, message: 'Please input email', trigger: 'blur' },
          { type: 'email', message: 'Invalid email', trigger: ['blur', 'change'] }
        ]
      },
      userPwdForm: {
        userNewPwd: '',
        userRepeatNewPwd: '',
        old_password: ''
      },
      userPwdFormRules: {
        userNewPwd: [
          {
            required: true,
            pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])^[\w!@#$%^&*()+|{}\[\]`~\-\'\";:/?.\\>,<]{8,20}$/,
            message: 'Password is invalid.',
            trigger: 'blur'
          },
          { validator: validatePassword, trigger: 'blur' },
          { required: true, message: 'Please input new password', trigger: 'blur' }
        ],
        userRepeatNewPwd: [
          { required: true, message: 'Please input repeat password', trigger: 'blur' },
          { validator: checkRepeatPwd, trigger: 'blur' }
        ],
        old_password: [{ required: true, message: 'Please input password', trigger: 'blur' }]
      }
    }
  },
  computed: {
    disableEdit() {
      return this.from_ad
    },
    source() {
      return (this.from_ad) ? this.$t('User.AD') : this.$t('User.SYSTEM')
    }
  },
  async created() {
    this.userId = store.getters.userId
    const userProfile = await getInfo(this.userId)
    this.from_ad = userProfile.data.from_ad
    this.userProfileForm.userName = userProfile.data.name
    this.userProfileForm.userEmail = userProfile.data.email
    this.userProfileForm.userPhone = userProfile.data.phone
  },
  methods: {
    checkRepeatPwd(rule, value, callback) {
      if (value !== this.userForm.password) {
        callback(new Error('password not same'))
      } else {
        callback()
      }
    },
    async downloadK8SConfig() {
      const res = await getK8SConfig(this.userId)
      const config = res.data.config
      var fileURL = window.URL.createObjectURL(new Blob([config]))
      var fileLink = document.createElement('a')
      fileLink.href = fileURL
      fileLink.setAttribute('download', 'config')
      document.body.appendChild(fileLink)
      fileLink.click()
    },
    submitUpdateUserProfile(formName) {
      if (!this.disableEdit) {
        this.$refs[formName].validate(async valid => {
          if (valid) {
            const data = {
              name: this.userProfileForm.userName,
              email: this.userProfileForm.userEmail,
              phone: this.userProfileForm.userPhone
            }
            await updateUser(this.userId, data)
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    },
    async handleUpdateUserPwd(formName) {
      if (!this.disableEdit) {
        this.$refs[formName].validate(async valid => {
          if (valid) {
            await updateUser(this.userId, {
              password: this.userPwdForm.userNewPwd,
              old_password: this.userPwdForm.old_password
            })
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-inner{
  padding: 0 25px;
}
.form-input{
  width: 250px;
}
</style>
