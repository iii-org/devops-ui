<template>
  <div class="app-container">
    <div style="background: white;padding: 15px 15px;">
      <el-tabs :tab-position="tabPosition">
        <el-tab-pane label="Basic">
          <div style="padding: 0px 25px;">
            <h3>Profile Basic Setting</h3>
            <el-form 
              :model="userProfileForm" 
              :rules="userProfileRules" 
              ref="userProfileForm" 
              label-width="100px" 
              class="demo-ruleForm"
              :label-position="labelPosition"
            >
              <el-form-item label="Name" prop="userName">
                <el-input v-model="userProfileForm.userName" style="width: 250px;"></el-input>
              </el-form-item>
              <el-form-item label="Email" prop="userEmail">
                <el-input v-model="userProfileForm.userEmail" style="width: 250px;"></el-input>
              </el-form-item>
              <el-form-item label="Phone" prop="userPhone">
                <el-input v-model="userProfileForm.userPhone" style="width: 250px;"></el-input>
              </el-form-item>
            </el-form>

            <el-row style="margin-top: 15px;">
              <el-col :span="8">
                <!-- <el-button type="primary" @click="handleUpdateUserProfile">Save</el-button> -->
                <el-button type="primary" @click="submitUpdateUserProfile('userProfileForm')">Save</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Security">
          <div style="padding: 0px 25px;">
            <h3>Profile Security Setting</h3>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Old Password
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input v-model="userOldPwd" type="password"/>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                New Password
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input v-model="userNewPwd" type="password"/>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" style="line-height: 30px;">
                Repeat New Password
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input v-model="userRepeatNewPwd" type="password"/>
              </el-col>
            </el-row>
            <el-row style="margin-top: 15px;">
              <el-col :span="8">
                <el-button type="primary" @click="handleUpdateUserPwd">Save</el-button>
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
        userName: [
          { required: true, message: 'Please input user name', trigger: 'blur' }
        ],
        userEmail: [
          { required: true, message: 'Please input email', trigger: 'blur' },
          { type: 'email', message: 'Invalid email', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  async created() {
    this.userId = store.getters.userId
    const userProfile = await getInfo(this.userId)
    this.userProfileForm.userName = userProfile.data.usernmae
    this.userProfileForm.userEmail = userProfile.data.email
    this.userProfileForm.userPhone = userProfile.data.phone
  },
  methods: {
    submitUpdateUserProfile(formName) {
      this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const data = {
              'name': this.userProfileForm.userName,
              'email': this.userProfileForm.userEmail,
              'phone': this.userProfileForm.userPhone
            }
            await updateUser(this.userId, data)
            Message({
              message: 'update successful',
              type: 'success',
              duration: 1 * 1000
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    async handleUpdateUserPwd() {
      console.log('aaa')
      if (this.userNewPwd !== this.userRepeatNewPwd) {
        Message({
          message: 'new password not equal repeat new password',
          type: 'error',
          duration: 1 * 1000
        })
      }
      await updateUser(this.userId, { 'password': this.userNewPwd })
      Message({
        message: 'update successful',
        type: 'success',
        duration: 1 * 1000
      })
    }
  }
}
</script>
