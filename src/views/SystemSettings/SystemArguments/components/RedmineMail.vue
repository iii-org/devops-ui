<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <h3>{{ $t('System.RedmineMail') }}</h3>
      <el-form
        ref="redmineMailForm"
        :model="redmineMailForm"
        :rules="redmineMailRules"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-row :gutter="10">
          <el-col :span="24" :sm="12" :md="7" :lg="7">
            <el-form-item label="User Name">
              <el-input
                v-model="redmineMailForm.smtp_settings.user_name"
                :disabled="isAuthenticationNil"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="7" :lg="7">
            <el-form-item label="Password">
              <el-input
                v-model="redmineMailForm.smtp_settings.password"
                show-password :disabled="isAuthenticationNil"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="5" :lg="6">
            <el-form-item label="Domain">
              <el-input v-model="redmineMailForm.smtp_settings.domain" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="5" :lg="4">
            <el-form-item label="Authentication">
              <el-select
                v-model="redmineMailForm.smtp_settings.authentication"
                :placeholder="$t('RuleMsg.PleaseSelect')"
                style="width: 100%"
              >
                <el-option
                  v-for="item in authenticationOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="7" :lg="7">
            <el-form-item label="Delivery Method">
              <el-input value=":stmp" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="12" :lg="13">
            <el-form-item label="Address" prop="smtp_settings.address">
              <el-input v-model="redmineMailForm.smtp_settings.address" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="5" :lg="4">
            <el-form-item label="Port" prop="smtp_settings.port" :placeholder="$t('general.PleaseInput')">
              <el-input v-model="redmineMailForm.smtp_settings.port" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="7" :lg="7">
            <el-form-item label="Openssl Verify Mode" prop="smtp_settings.openssl_verify_mode">
              <el-input v-model="redmineMailForm.smtp_settings.openssl_verify_mode" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="12" :lg="13">
            <el-form-item label="Emission Email Address" prop="emission_email_address">
              <el-input v-model="redmineMailForm.emission_email_address" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="5" :lg="4">
            <el-form-item label="SSL" prop="smtp_settings.ssl">
              <el-input v-model="redmineMailForm.smtp_settings.ssl" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Starttls Auto">
              <el-radio-group v-model="redmineMailForm.smtp_settings.enable_starttls_auto">
                <el-radio :label="true" border>Enable</el-radio>
                <el-radio :label="false" border>Disable</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="text-right">
        <el-button class="buttonPrimary" @click="submitUpdateRedmineMail">
          {{ $t('general.Save') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getUserRedmineMailProfile, editUserRedmineMailProfile } from '@/api/redmineMail'
import MixinElTable from '@/mixins/MixinElTable'

const defaultFormData = () => ({
  smtp_settings: {
    address: '',
    authentication: '',
    domain: '',
    enable_starttls_auto: '',
    password: '',
    port: '',
    user_name: '',
    openssl_verify_mode: '',
    ssl: ''
  },
  emission_email_address: ''
})

export default {
  name: 'RedmineMail',
  mixins: [MixinElTable],
  data() {
    return {
      deliveryMethodOptions: [{ value: ':smtp', label: ':smtp' }, { value: ':semdmail', label: ':sendmail' }],
      authenticationOptions: [
        { value: 'nil', label: 'nil' },
        { value: ':plain', label: ':plain' },
        { value: ':login', label: ':login' },
        { value: ':cram_md5', label: ':cram_md5' }
      ],
      redmineMailForm: defaultFormData(),
      redmineMailRules: {
        'smtp_settings.address': [{ required: true, message: 'Please input address.', trigger: 'blur' }],
        'smtp_settings.port': [{ required: true, message: 'Please input port.', trigger: 'blur' }]
      },
      isLoading: false
    }
  },
  computed: {
    isAuthenticationNil() {
      return this.redmineMailForm.smtp_settings.authentication === 'nil'
    }
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      const res = await getUserRedmineMailProfile()
      this.redmineMailForm = res.data
      this.isLoading = false
    },
    filterEmpty(data) {
      const arr = ['openssl_verify_mode', 'user_name', 'password', 'ssl']
      Object.keys(data).forEach((item) => {
        if (typeof data[item] === 'object') this.filterEmpty(data[item])
        if (arr.includes(item) && data[item] === '') delete data[item]
      })
    },
    checkData() {
      const res = this.redmineMailForm
      if (this.isAuthenticationNil) {
        delete res.smtp_settings.user_name
        delete res.smtp_settings.password
      }
      this.filterEmpty(res)
      return res
    },
    submitUpdateRedmineMail() {
      this.isLoading = true
      this.$refs.redmineMailForm.validate(async valid => {
        if (!valid) return
        const data = {
          redmine_mail: { smtp_settings: this.checkData().smtp_settings },
          emission_email_address: this.checkData().emission_email_address
        }
        editUserRedmineMailProfile(data)
          .then(() => {
            this.$message({
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
          })
          .catch(err => {
            this.$message({
              message: err,
              type: 'error'
            })
          })
          .then(() => {
            this.isLoading = false
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-form-item {
  &__label {
    font-size: 16px;
  }
}
</style>
