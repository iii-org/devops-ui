<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="flex justify-between">
        <h3 cl>{{ $t('System.RedmineMail') }}</h3>
        <div>
          <el-switch
            v-model="redmineMailForm.smtp_settings.active"
            class="mr-3"
            :active-text="$t('general.Enable')"
            :inactive-text="$t('general.Disable')"
          />
          <el-button type="primary" @click="temporarySave">暫存</el-button>
        </div>
      </div>
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
  emission_email_address: '',
  active: false
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
  watch: {
    'redmineMailForm.smtp_settings.active'(bool) {
      console.log(bool)
      if (bool !== undefined) {
        sessionStorage.clear()
        this.updateRedmineMail()
      }
    }
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      const res = await getUserRedmineMailProfile()
      this.redmineMailForm =
        JSON.parse(sessionStorage.getItem('redmineMailForm')) &&
        Object.keys(JSON.parse(sessionStorage.getItem('redmineMailForm'))[0]).length > 0
          ? JSON.parse(sessionStorage.getItem('redmineMailForm'))[0] : res.data
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
    updateRedmineMail() {
      this.isLoading = true
      this.$refs.redmineMailForm.validate(async valid => {
        if (!valid) return
        const data = {
          redmine_mail: { smtp_settings: this.checkData().smtp_settings },
          emission_email_address: this.checkData().emission_email_address,
          active: this.redmineMailForm.smtp_settings.active
        }
        console.log(data)
        editUserRedmineMailProfile(data)
          .then(async () => {
            await this.fetchData()
            this.$message({
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
          })
          .catch(() => {
            this.redmineMailForm.smtp_settings.active = false
          })
      })
      this.isLoading = false
    },
    temporarySave() {
      sessionStorage.setItem('redmineMailForm', JSON.stringify([this.redmineMailForm]))
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
