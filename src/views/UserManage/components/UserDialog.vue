<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="40%"
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
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input v-model="userForm.password" type="password" />
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
        <el-input v-model.number="userForm.phone" />
      </el-form-item>
      <el-form-item label="Role" prop="role">
        <el-select v-model="userForm.role" style="width:100%">
          <el-option
            v-for="item in roleList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Statue" prop="status">
        <el-switch
          v-model="userForm.status"
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
        label: 'Enginner'
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
          { required: true, message: 'Please input login', trigger: 'blur' }
        ],
        password: [],
        repeatPassword: [],
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: 'Please input phone', trigger: 'blur' },
          { type: 'number', message: 'Please input number', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'Please input email', trigger: 'blur' },
          { type: 'email', message: 'Invalid email', trigger: ['blur', 'change'] }
        ],
        role: [
          { required: true, message: 'Please select role', trigger: 'blur' }
        ],
        statue: [
          { required: true, message: 'Please set statue', trigger: 'blur' }
        ]
      },
      dialogLoading: false,
      dialogTitle: 'Add User',
      disableAccount: false,
      formName: 'userForm'
    }
  },
  watch: {
    userData: function(data) {
      if (isNaN(data.role)) {
        // get role id from role object
        data.role = data.role.id
      }
      // force transfer to int
      if (data['phone']) {
        data['phone'] = parseInt(data['phone'])
      }
      this.userForm = data
    }
  },
  updated() {
    if (this.userId === 0) {
      this.dialogTitle = 'Add User'
      this.disableAccount = false
      // new user's role default is enginner
      this.userForm.role = 1
      this.userFormRules.password = [
        { required: true, message: 'Please input password', trigger: 'blur' }
      ]
      this.userFormRules.repeatPassword = [
        { required: true, message: 'Please input repeat password', trigger: 'blur' },
        { validator: this.checkRepeatPwd, trigger: 'blur' }
      ]
    } else {
      this.dialogTitle = 'Update User'
      this.disableAccount = true
      this.listLoading = true
      this.userFormRules.password = []
      this.userFormRules.repeatPassword = [
        { required: false },
        { validator: this.checkRepeatPwd, trigger: 'blur' }
      ]
    }
  },
  methods: {
    checkRepeatPwd(rule, value, callback) {
      if (value !== this.userForm.password) {
        callback(new Error('password not same'))
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
            await addUser(data)
          } else {
            delete data['login']
            await updateUser(this.userId, data)
          }

          this.$refs[this.formName].resetFields()
          this.dialogLoading = false
          this.$emit('add-user-visible', false)
          Message({
            message: 'add successful',
            type: 'success',
            duration: 1 * 1000
          })
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
