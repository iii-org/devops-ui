<template>
  <div class="app-container">
    <el-card v-loading.sync="isLoading">
      <div class="flex justify-between">
        <h3 cl>{{ $t('System.RedmineMail') }}</h3>
        <div>
          <el-switch
            v-model="redmineMailForm.active"
            class="mr-3"
            :active-text="$t('general.Enable')"
            :inactive-text="$t('general.Disable')"
          />
          <el-button
            v-if="!redmineMailForm.active"
            type="primary"
            @click="onUpdate(true)"
          >
            {{ $t('general.TemporarySave') }}
          </el-button>
          <el-button
            v-else
            type="success"
            @click="onUpdate(false)"
          >
            {{ $t('general.Save') }}
          </el-button>
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
      <div :style="getStyle('danger')" class="text-sm">{{ $t('RedmineMail.Warning') }}</div>
    </el-card>
  </div>
</template>

<script>
import { getUserRedmineMailProfile, editUserRedmineMailProfile } from '@/api/redmineMail'
import MixinElTable from '@/mixins/MixinElTable'
import variables from '@/styles/theme/variables.scss'

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
        'smtp_settings.address': [{ required: true, message: 'Please input address.', trigger: 'change' }],
        'smtp_settings.port': [{ required: true, message: 'Please input port.', trigger: 'change' }]
      },
      isLoading: false,
      stopUpdate: false,
      timer: null
    }
  },
  computed: {
    isAuthenticationNil() {
      return this.redmineMailForm.smtp_settings.authentication === 'nil'
    }
  },
  watch: {
    async 'redmineMailForm.active'(bool) {
      if (bool !== undefined && !this.stopUpdate) {
        await this.onUpdate()
      }
      if (this.stopUpdate) this.stopUpdate = false
    }
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    async fetchData() {
      await getUserRedmineMailProfile()
        .then((res) => {
          this.redmineMailForm = res.data
        })
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
    async onUpdate(isTemporary) {
      this.$refs.redmineMailForm.validate(async valid => {
        if (!valid) return
        const data = this.getUpdateData(isTemporary)
        await this.fetchUserRedmineMailProfile(data)
      })
    },
    getUpdateData(isTemporary) {
      const data = {
        redmine_mail: { smtp_settings: this.checkData().smtp_settings },
        emissoin_email_address: this.checkData().emission_email_address
      }
      if (isTemporary) this.$set(data, 'temp_save', true)
      else this.$set(data, 'active', this.redmineMailForm.active)
      return data
    },
    async fetchUserRedmineMailProfile(data) {
      this.isLoading = true
      await editUserRedmineMailProfile(data)
        .then(() => {
          this.handleMessage(data)
        })
        .catch((error) => {
          if (
            error.response.data.error.code === 7009 ||
            error.response.data.error.code === 7010
          ) {
            this.stopUpdate = true
            this.$set(this.redmineMailForm, 'active', false)
          }
        })
        .finally(async () => {
          this.isLoading = false
        })
    },
    handleMessage(data) {
      this.$message({
        message: data.temp_save ? this.$t('Notify.TemporarySaved') : this.$t('Notify.Updated'),
        type: 'success'
      })
      if (!data.hasOwnProperty('temp_save')) {
        this.timer = setTimeout(() => {
          this.$message({
            message: this.$t('Notify.RedmineMailWarning'),
            type: 'warning'
          })
        }, 1000)
      }
    },
    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    },
    getStyle(colorCode) {
      const color = variables[`${colorCode}`]
      return {
        color
      }
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
