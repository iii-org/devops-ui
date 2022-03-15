<template>
  <el-dialog
    :title="$t(`User.${dialogTitle}`)"
    :visible="dialogVisible"
    width="40%"
    class="scroll-dialog"
    :close-on-click-modal="false"
    @close="handleClose('userForm')"
  >
    <el-form ref="userForm" v-loading="dialogLoading" :model="userForm" :rules="userFormRules" label-width="30%">
      <el-form-item v-if="'from_ad' in userForm" :label="$t('User.Source')" prop="login">
        <el-input v-model="source" disabled />
      </el-form-item>
      <el-form-item :label="$t('User.Account')" prop="login">
        <el-input v-model="userForm.login" :disabled="disableAccount" maxlength="60" show-word-limit />
        <div v-if="dialogTitle === 'AddUser'" style="word-break: keep-all; margin-top: 5px">
          {{ $t('User.AccountRule') }}
        </div>
      </el-form-item>
      <el-form-item :label="$t('User.Password')" prop="password">
        <el-input v-model="userForm.password" type="password" maxlength="20" show-password :disabled="disableEdit" />
        <div style="word-break: keep-all; margin-top: 5px">
          {{ $t('User.PasswordRule') }}
        </div>
      </el-form-item>
      <el-form-item :label="$t('User.RepeatPassword')" prop="repeatPassword">
        <el-input
          v-model="userForm.repeatPassword"
          type="password"
          maxlength="20"
          show-password
          :disabled="disableEdit"
        />
      </el-form-item>
      <el-form-item :label="$t('general.Name')" prop="name">
        <el-input v-model="userForm.name" :disabled="disableEdit" />
      </el-form-item>
      <el-form-item :label="$t('User.Department')">
        <el-input v-model="userForm.department" :disabled="disableEdit" />
      </el-form-item>
      <el-form-item :label="$t('User.Title')">
        <el-input v-model="userForm.title" :disabled="disableEdit" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="userForm.email" :disabled="disableEdit" />
      </el-form-item>
      <el-form-item :label="$t('User.Phone')" prop="phone">
        <el-input v-model="userForm.phone" :disabled="disableEdit" />
      </el-form-item>
      <el-form-item :label="$t('User.Role')" prop="default_role">
        <el-select v-model="userForm.default_role" style="width: 100%">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('User.IsEnable')" prop="status">
        <el-switch
          v-model="userForm.status"
          class="mt-2"
          active-value="enable"
          inactive-value="disable"
          inactive-color="#ff4949"
          :active-text="$t('general.Enable')"
          :inactive-text="$t('general.Disable')"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="buttonSecondaryReverse" @click="handleClose">{{ $t('general.Cancel') }}</el-button>
      <el-button class="buttonPrimary" @click="submitForm">{{ $t('general.Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addUser, updateUser } from '@/api/user'
import { mapGetters } from 'vuex'

export default {
  name: 'UserDialog',
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
      userForm: {
        login: '',
        name: '',
        password: '',
        repeatPassword: '',
        email: '',
        phone: '',
        default_role: '',
        status: 'enable'
      },
      userFormRules: {
        login: [
          {
            required: true,
            pattern: /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,58}[a-zA-Z0-9]$/,
            message: 'Account is invalid.',
            trigger: 'blur'
          },
          { required: true, message: 'Please input login', trigger: 'blur' }
        ],
        password: [{ validator: this.validatePassword, message: "Password can't be less than 8 characters." }],
        repeatPassword: [{ required: true, message: 'Please input password', trigger: 'blur' }],
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        phone: [{ required: true, message: 'Please input phone', trigger: 'blur' }],
        email: [
          { required: true, message: 'Please input email', trigger: 'blur' },
          { type: 'email', message: 'Invalid email', trigger: ['blur', 'change'] }
        ],
        default_role: [{ required: true, message: 'Please select role', trigger: 'blur' }]
      },
      dialogLoading: false,
      dialogTitle: 'AddUser',
      disableAccount: false,
      formName: 'userForm'
    }
  },
  computed: {
    ...mapGetters(['roleList']),
    source() {
      return this.userForm.from_ad ? this.$t('User.AD') : this.$t('User.SYSTEM')
    },
    disableEdit() {
      return this.userForm.from_ad
    }
  },
  watch: {
    userData(data) {
      this.userForm = data
      if (isNaN(data.default_role)) {
        // get role id from role object
        const default_role = data.role ? data.role.id : data.default_role_id
        this.$set(this.userForm, 'default_role', default_role)
      }
    }
  },
  updated() {
    if (this.userId === 0) {
      this.dialogTitle = 'AddUser'
      this.disableAccount = false
      // new user's role default is enginners
      this.userFormRules.password = [
        { required: true, message: 'Please input password', trigger: 'blur' },
        {
          required: true,
          pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])^[\w!@#$%^&*()+|{}\[\]`~\-'";:/?.\\>,<]{8,20}$/,
          message: 'Password is invalid.',
          trigger: 'blur'
        }
      ]
      this.userFormRules.repeatPassword = [
        { required: true, message: 'Please input repeat password', trigger: 'blur' },
        { validator: this.checkRepeatPwd, trigger: 'blur' }
      ]
    } else {
      this.disableRole = true
      this.dialogTitle = 'EditUser'
      this.disableAccount = true
      this.listLoading = true
      if (this.userForm.password) {
        if (this.userForm.password.length !== 0) {
          this.userFormRules.password = [
            { required: true, message: 'Please input password', trigger: 'blur' },
            { validator: this.checkRepeatPwd, trigger: 'blur' },
            {
              required: true,
              pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])^[\w!@#$%^&*()+|{}\[\]`~\-'";:/?.\\>,<]{8,20}$/,
              message: 'Password is invalid.',
              trigger: 'blur'
            }
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
      if ((value !== this.userForm.password) & (this.userForm.password !== '') && this.userForm.repeatPassword !== '') {
        callback(new Error('password not same'))
      } else {
        callback()
      }
    },
    validatePassword(rule, value, callback) {
      if (value === undefined) {
        callback()
      } else if (value.length > 0 && value.length < 8 && this.userForm.password !== '') {
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
      this.$refs[this.formName].validate(async valid => {
        if (valid) {
          this.dialogLoading = true
          const data = {
            login: this.userForm.login,
            password: this.userForm.password,
            username: this.userForm.name,
            department: this.userForm.department,
            title: this.userForm.title,
            name: this.userForm.name,
            email: this.userForm.email,
            phone: this.userForm.phone,
            role_id: this.userForm.default_role,
            status: this.userForm.status
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
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Added'),
                type: 'success'
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
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Updated'),
                type: 'success'
              })
            } catch (error) {
              this.dialogLoading = false
            }
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
>>> .el-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  max-height: 75vh;
}

</style>
