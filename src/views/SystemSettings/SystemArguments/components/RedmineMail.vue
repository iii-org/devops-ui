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
          <el-col :span="24" :sm="12" :md="8" :lg="7">
            <el-form-item label="User Name">
              <el-input v-model="redmineMailForm.smtp_settings.user_name" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="8" :lg="7">
            <el-form-item label="Password">
              <el-input v-model="redmineMailForm.smtp_settings.password" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="Domain">
              <el-input v-model="redmineMailForm.smtp_settings.domain" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="8" :lg="4">
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
          <el-col :span="24" :sm="12" :md="8" :lg="5">
            <el-form-item label="Delivery Method" prop="delivery_method">
              <el-select
                v-model="redmineMailForm.delivery_method"
                :placeholder="$t('RuleMsg.PleaseSelect')"
                style="width: 100%"
              >
                <el-option
                  v-for="item in deliveryMethodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="8" :lg="7">
            <el-form-item label="Address" prop="smtp_settings.address">
              <el-input v-model="redmineMailForm.smtp_settings.address" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :md="6" :lg="2">
            <el-form-item label="Port" prop="smtp_settings.port" :placeholder="$t('RuleMsg.PleaseInput')">
              <el-input v-model="redmineMailForm.smtp_settings.port" />
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
        <el-button type="primary" @click="submitUpdateRedmineMail">
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
  delivery_method: '',
  smtp_settings: {
    address: '',
    authentication: '',
    domain: '',
    enable_starttls_auto: '',
    password: '',
    port: '',
    user_name: ''
  }
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
        delivery_method: [{ required: true, message: 'Please input user name.', trigger: 'blur' }],
        'smtp_settings.address': [{ required: true, message: 'Please input address.', trigger: 'blur' }],
        'smtp_settings.port': [{ required: true, message: 'Please input port.', trigger: 'blur' }]
      },
      isLoading: false
    }
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      const res = await getUserRedmineMailProfile()
      this.redmineMailForm = res.data
      this.isLoading = false
    },
    submitUpdateRedmineMail() {
      this.isLoading = true
      this.$refs.redmineMailForm.validate(async valid => {
        if (!valid) return
        const data = { redmine_mail: this.redmineMailForm }
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
