<template>
  <div class="app-container">
    <el-card>
      <div class="form">
        <h3>{{ $t('System.RedmineMail') }}</h3>
        <el-form
          ref="redmineMailForm"
          :model="redmineMailForm"
          :rules="redmineMailRules"
          label-width="100px"
          class="demo-ruleForm"
          :label-position="labelPosition"
        >
          <el-form-item label="user_name">
            <el-input v-model="redmineMailForm.smtp_settings.user_name" class="form-input" />
          </el-form-item>
          <el-form-item label="delivery_method" prop="delivery_method">
            <el-select v-model="redmineMailForm.delivery_method" placeholder="請選擇">
              <el-option
                v-for="item in deliveryMethodOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="enable_starttls_auto">
            <el-radio v-model="redmineMailForm.smtp_settings.enable_starttls_auto" :label="true">true</el-radio>
            <el-radio v-model="redmineMailForm.smtp_settings.enable_starttls_auto" :label="false">false</el-radio>
          </el-form-item>
          <el-form-item label="authentication">
            <el-select v-model="redmineMailForm.smtp_settings.authentication" placeholder="請選擇">
              <el-option
                v-for="item in authenticationOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="address" prop="smtp_settings.address">
            <el-input v-model="redmineMailForm.smtp_settings.address" class="form-input" />
          </el-form-item>
          <el-form-item label="port" prop="smtp_settings.port">
            <el-input v-model="redmineMailForm.smtp_settings.port" class="form-input" />
          </el-form-item>
          <el-form-item label="domain">
            <el-input v-model="redmineMailForm.smtp_settings.domain" class="form-input" />
          </el-form-item>
          <el-form-item label="password">
            <el-input v-model="redmineMailForm.smtp_settings.password" class="form-input" show-password />
          </el-form-item>
        </el-form>
        <el-row class="mt-4">
          <el-col :span="8">
            <el-button type="primary" @click="submitUpdateRedmineMail('redmineMailForm')">{{
              $t('Profile.Save')
            }}</el-button>
          </el-col>
        </el-row>
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
      labelPosition: 'top',
      deliveryMethodOptions: [{ value: ':smtp', label: ':smtp' }, { value: ':semdmail', label: ':sendmail' }],
      authenticationOptions: [
        { value: 'nil', label: 'nil' },
        { value: 'plain', label: 'plain' },
        { value: 'login', label: 'login' },
        { value: 'cram_md5', label: 'cram_md5' }
      ],
      redmineMailForm: defaultFormData(),
      redmineMailRules: {
        delivery_method: [{ required: true, message: 'Please input user name.', trigger: 'blur' }],
        'smtp_settings.address': [{ required: true, message: 'Please input address.', trigger: 'blur' }],
        'smtp_settings.port': [{ required: true, message: 'Please input port.', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getUserRedmineMailProfile()
      this.redmineMailForm = res.data
    },
    submitUpdateRedmineMail(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          const data = { redmine_mail: this.redmineMailForm }
          await editUserRedmineMailProfile(data)
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
