<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="40%"
    :close-on-click-modal="false"
    @close="handleClose('userForm')"
  >
    <el-form
      ref="userForm"
      v-loading="dialogLoading"
      :model="userForm"
      :rules="userFormRules"
      label-width="30%"
      class="demo-ruleForm"
    >
      <el-form-item label="Account" prop="login">
        <el-input v-model="userForm.login" :disabled="disableAccount" />
        <div v-if="dialogTitle === 'Add User'" style="word-break: keep-all;margin-top: 5px;">	Account should be 2-60 characters long and "._-" can be accepted at the middle of string. </div>
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input v-model="userForm.password" type="password" />
        <div style="word-break: keep-all;margin-top: 5px;">Password should be 8-20 characters long with at least 1 uppercase, 1 lowercase and 1 number.</div>
      </el-form-item>
      <el-form-item label="Repeat Password" prop="repeatPassword">
        <el-input v-model="userForm.repeatPassword" type="password" />
      </el-form-item>
      <el-form-item label="Name" prop="name">
        <el-input v-model="userForm.name" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="userForm.email" />
      </el-form-item>
      <el-form-item label="Phone" prop="phone">
        <el-input v-model="userForm.phone" />
      </el-form-item>
      <el-form-item label="Role" prop="role">
        <el-select v-model="userForm.role" style="width:100%" :disabled="disableRole">
          <el-option
            v-for="item in roleList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Active" prop="status">
        <el-switch
          v-model="userForm.status"
          style="margin-top: 10px;"
          active-value="enable"
          inactive-value="disable"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="Enable"
          inactive-text="Disable"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="submitForm">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addUser, updateUser } from '@/api/user'
import { Message } from 'element-ui'

export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Number,
      default: 0
    },
    userData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // TODO: roleList's data should from API
      roleList: [{
        value: 1,
        label: 'Engineer'
      }, {
        value: 3,
        label: 'Project Manager'
      }, {
        value: 5,
        label: 'Administrator'
      }],
      userForm: {
        login: '',
        name: '',
        password: '',
        repeatPassword: '',
        email: '',
        phone: '',
        role: '',
        status: 'enable'
      },
      userFormRules: {
        login: [
          { required: true, pattern: /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,58}[a-zA-Z0-9]$/, message: 'Account is invalid.', trigger: 'blur' },
          { required: true, message: 'Please input login', trigger: 'blur' }
        ],
        password: [
          { validator: this.validatePassword, message: "Password can't be less than 8 characters." }
        ],
        repeatPassword: [
          { required: true, message: 'Please input password', trigger: 'blur' }
        ],
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: 'Please input phone', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'Please input email', trigger: 'blur' },
          { type: 'email', message: 'Invalid email', trigger: ['blur', 'change'] }
        ],
        role: [
          { required: true, message: 'Please select role', trigger: 'blur' }
        ]
      },
      dialogLoading: false,
      dialogTitle: 'Add User',
      disableAccount: false,
      formName: 'userForm',
      disableRole: true
    }
  },
  watch: {
    userData: function(data) {
      if (isNaN(data.role)) {
        // get role id from role object
        data.role = data.role.id
      }
      this.userForm = data
    }
  },
  updated() {
    if (this.userId === 0) {
      this.dialogTitle = 'Add User'
      this.disableAccount = false
      this.disableRole = false
      // new user's role default is enginners
      this.userFormRules.password = [
        { required: true, message: 'Please input password', trigger: 'blur' },
        { required: true, pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])^[\w!@#$%^&*()+|{}\[\]`~\-\'\";:/?.\\>,<]{8,20}$/, message: 'Password is invalid.', trigger: 'blur' }
      ]
      this.userFormRules.repeatPassword = [
        { required: true, message: 'Please input repeat password', trigger: 'blur' },
        { validator: this.checkRepeatPwd, trigger: 'blur' }
      ]
    } else {
      this.disableRole = true
      this.dialogTitle = 'Update User'
      this.disableAccount = true
      this.listLoading = true
      if (this.userForm.password) {
        if (this.userForm.password.length !== 0) {
          this.userFormRules.password = [
            { required: true, message: 'Please input password', trigger: 'blur' },
            { validator: this.checkRepeatPwd, trigger: 'blur' },
            { required: true, pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])^[\w!@#$%^&*()+|{}\[\]`~\-\'\";:/?.\\>,<]{8,20}$/, message: 'Password is invalid.', trigger: 'blur' }
          ]
        } else {
          this.userFormRules.password = [
            { required: false },
            { validator: this.checkRepeatPwd, trigger: 'blur' },
            { validator: this.validatePassword, trigger: 'blur' }
          ]
        }
      } else {
        this.userFormRules.password = [
          { required: false },
          { validator: this.checkRepeatPwd, trigger: 'blur' },
          { validator: this.validatePassword, trigger: 'blur' }
        ]
      }
      // this.userFormRules.password = [
      //   { required: false },
      //   { validator: this.checkRepeatPwd, trigger: 'blur' },
      //   { validator: this.validatePassword, trigger: 'blur' }
      // ]
      this.userFormRules.repeatPassword = [
        { required: false },
        { validator: this.checkRepeatPwd, trigger: 'blur' },
        { validator: this.validatePassword, trigger: 'blur' }
      ]
    }
  },
  methods: {
    checkRepeatPwd(rule, value, callback) {
      if (value !== this.userForm.password & this.userForm.password !== '' & this.userForm.repeatPassword !== '') {
        callback(new Error('password not same'))
      } else {
        callback()
      }
    },
    validatePassword(rule, value, callback) {
      // console.log('rule', rule)
      // console.log('value', value)
      if (value === undefined) {
        callback()
      } else if (value.length > 0 && value.length < 8 & this.userForm.password !== '') {
        callback(new Error('The password can not be less than 8 digits'))
      } else {
        callback()
      }
    },
    handleClose() {
      this.$refs[this.formName].resetFields()
      this.$emit('add-user-visible', false)
    },
    submitForm() {
      // this.userFormRules.password = [
      //   { required: true, message: 'Please input password', trigger: 'blur' }
      // ]
      this.$refs[this.formName].validate(async(valid) => {
        if (valid) {
          this.dialogLoading = true
          const data = {
            'login': this.userForm.login,
            'password': this.userForm.password,
            'username': this.userForm.name,
            'name': this.userForm.name,
            'email': this.userForm.email,
            'phone': this.userForm.phone,
            'role_id': this.userForm.role,
            'status': this.userForm.status
          }

          // remove useless field
          Object.keys(data).forEach(item => {
            if (data[item] === '') {
              delete data[item]
            }
          })
          if (this.userId === 0) {
            try {
              await addUser(data)
              this.$refs[this.formName].resetFields()
              this.dialogLoading = false
              this.$emit('add-user-visible', false, 'refresh')
              Message({
                message: 'add successful',
                type: 'success',
                duration: 1 * 1000
              })
            } catch (error) {
              this.dialogLoading = false
            }
          } else {
            delete data['login']
            try {
              await updateUser(this.userId, data)
              this.$refs[this.formName].resetFields()
              this.dialogLoading = false
              this.$emit('add-user-visible', false, 'refresh')
              Message({
                message: 'update successful',
                type: 'success',
                duration: 1 * 1000
              })
            } catch (error) {
              this.dialogLoading = false
            }
          }
        } else {
          console.log('error!!')
          return false
        }
      })
    }
  }
}
</script>
<style lang="scss">
  .el-dialog{
    display: flex;
    flex-direction: column;
    margin:0 !important;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
  }
  .el-dialog .el-dialog__body{
    flex:1;
    overflow: auto;
  }
</style>
