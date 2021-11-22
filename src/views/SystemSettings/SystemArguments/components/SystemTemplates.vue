<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="text-2xl">{{ $t('SystemTemplates.TemplatesSettings') }}</div>
      <el-form
        ref="form"
        :model="form"
        :rules="formRules"
      >
        <el-row>
          <el-col
            :span="24"
            :sm="12"
            :md="8"
            :lg="7"
          >
            <el-form-item
              :label="$t('SystemTemplates.GithubAccount')"
              prop="value.account"
            >
              <el-input
                v-model="form.value.account"
                :placeholder="$t('SystemTemplates.GithubAccountPlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="Github Token"
              prop="value.token"
            >
              <el-input
                v-model="form.value.token"
                :placeholder="$t('SystemTemplates.GithubTokenPlaceholder')"
                type="textarea"
                rows="5"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <el-checkbox v-model="form.active">
                <strong>{{ $t('SystemTemplates.EnableTemplateSync') }}</strong>
              </el-checkbox>
              <div
                class="ml-5"
                style="color: gray;"
              >
                <section>{{ $t('SystemTemplates.TokenWarning') }}</section>
                <section>{{ $t('SystemTemplates.DocumentUrl') }}:
                  <el-link
                    :href="link"
                    target="_blank"
                  >{{ link }}</el-link>
                </section>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="text-right">
        <el-button
          type="primary"
          @click="handleUpdate"
        >
          {{ $t('general.Save') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getSystemParameter, updateSystemParameter } from '@/api/systemParameter'
import { BasicData, Table } from '@/newMixins/index'

const formData = () => ({
  id: '',
  name: '',
  value: {
    token: '',
    account: ''
  },
  active: ''
})

export default {
  name: 'SystemTemplates',
  mixins: [BasicData, Table],
  data() {
    this.link = 'https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token'
    this.formRules = {
      'value.token': [{ required: true, message: 'Please input token.', trigger: 'blur' }],
      'value.account': [{ required: true, message: 'Please input account name.', trigger: 'blur' }]
    }
    return {
      form: formData(),
      originData: {},
      isLoading: false
    }
  },
  computed: {
    paramId() {
      return this.form.id
    },
    getUpdateData() {
      const { value, active } = this.form
      return {
        value: {
          token: value.token,
          account: value.account
        },
        active
      }
    }
  },
  methods: {
    async loadData() {
      await this.fetchData()
    },
    async fetchData() {
      this.isLoading = true
      const res = await getSystemParameter()
      this.getSystemParameterData(res.data)
      this.isLoading = false
    },
    getSystemParameterData(data) {
      const key = 'github_verify_info'
      const githubParams = data.find((item) => item.name === key)
      this.form = githubParams
      this.setOriginData(githubParams)
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    handleUpdate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.updateSystemParameter()
      })
    },
    async updateSystemParameter() {
      const data = this.getUpdateData
      const paramId = this.paramId
      this.isLoading = true
      await updateSystemParameter(paramId, data)
        .then(() => {
          this.showSuccessMessage()
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(async () => {
          await this.loadData()
          this.isLoading = false
        })
    },
    showSuccessMessage() {
      this.$message({
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$font-size: 16px;

>>> .el-form-item {
  &__content {
    line-height: 30px;
  }
  &__label {
    font-size: $font-size;
  }
}
>>> .el-checkbox__label {
  font-size: $font-size;
}
</style>
