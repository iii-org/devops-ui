<template>
  <div class="app-container">
    <div style="background: white;padding: 15px 15px;">
      <el-tabs :tab-position="tabPosition">
        <el-tab-pane label="Basic">
          <div style="padding: 0px 25px;">
            <h3>Profile Basic Setting</h3>
            <el-form
              ref="userProfileForm"
              :model="userProfileForm"
              :rules="userProfileRules"
              label-width="100px"
              class="demo-ruleForm"
              :label-position="labelPosition"
            >
              <el-form-item label="Name" prop="userName">
                <el-input v-model="userProfileForm.userName" style="width: 250px;" />
              </el-form-item>
              <el-form-item label="Email" prop="userEmail">
                <el-input v-model="userProfileForm.userEmail" style="width: 250px;" />
              </el-form-item>
              <el-form-item label="Phone" prop="userPhone">
                <el-input v-model="userProfileForm.userPhone" style="width: 250px;" />
              </el-form-item>
            </el-form>

            <el-row style="margin-top: 15px;">
              <el-col :span="8">
                <el-button type="primary" @click="submitUpdateUserProfile('userProfileForm')">Save</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Security">
          <div style="padding: 0px 25px;">
            <h3>Profile Security Setting</h3>
            <el-form
              ref="userPwdForm"
              :model="userPwdForm"
              :rules="userPwdFormRules"
              label-width="100px"
              class="demo-ruleForm"
              :label-position="labelPosition"
            >
              <el-form-item label="New Password" prop="userNewPwd">
                <el-input v-model="userPwdForm.userNewPwd" type="password" style="width: 250px;" />
                <div style="word-break: keep-all;margin-top: 5px;">Password should be 8-20 characters long with at least 1 uppercase, 1 lowercase and 1 number.</div>
              </el-form-item>
              <el-form-item label="Repeat New Password" prop="userRepeatNewPwd">
                <el-input v-model="userPwdForm.userRepeatNewPwd" type="password" style="width: 250px;" />
              </el-form-item>
            </el-form>
            <el-row style="margin-top: 15px;">
              <el-col :span="8">
                <el-button type="primary" @click="handleUpdateUserPwd('userPwdForm')">Save</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { updateUser, getInfo } from '@/api/user'
import { Message } from 'element-ui'

export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length > 0 && value.length < 8) {
        callback(new Error('The password can not be less than 8 characters'))
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
      userName: '',
      userEmail: '',
      userPhone: 0,
      userId: 0,
      userOldPwd: '',
      userNewPwd: '',
      userRepeatNewPwd: '',
      userProfileForm: {
        userName: '',
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
        userRepeatNewPwd: ''
      },
      userPwdFormRules: {
        userNewPwd: [
          { required: true, pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])^[\w!@#$%^&*()+|{}\[\]`~\-\'\";:/?.\\>,<]{8,20}$/, message: 'Password is invalid.', trigger: 'blur' },
          { validator: validatePassword, message: "Password can't be less than 8 characters." },
          { required: true, message: 'Please input new password', trigger: 'blur' }
        ],
        userRepeatNewPwd: [
          { required: true, message: 'Please input repeat password', trigger: 'blur' },
          { validator: checkRepeatPwd, trigger: 'blur' }
        ]
      }
    }
  },
  async created() {
    this.userId = store.getters.userId
    const userProfile = await getInfo(this.userId)
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
    submitUpdateUserProfile(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          const data = {
            name: this.userProfileForm.userName,
            email: this.userProfileForm.userEmail,
            phone: this.userProfileForm.userPhone
          }
          await updateUser(this.userId, data)
          Message({
            message: 'update successful',
            type: 'success',
            duration: 1 * 1000
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async handleUpdateUserPwd(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          await updateUser(this.userId, { password: this.userPwdForm.userNewPwd })
          Message({
            message: 'update successful',
            type: 'success',
            duration: 1 * 1000
          })
        }
      })
    }
  }
}
</script>
