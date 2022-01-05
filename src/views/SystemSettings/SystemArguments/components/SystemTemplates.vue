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
          type="success"
          :loading="is_lock"
          @click="handleUpdate(true)"
        >
          {{ $t('general.Run') }}
        </el-button>
        <el-button
          type="primary"
          @click="handleUpdate(false)"
        >
          {{ $t('general.Save') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getSystemParameter, updateSystemParameter, runSystemParameter, getGithubVerifyStatus } from '@/api/systemParameter'
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
      isLoading: false,
      is_lock: false,
      intervalTimer: null
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
  mounted() {
    this.getLockCheck()
  },
  beforeDestroy() {
    this.clearTimer()
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
    handleUpdate(isRun) {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.updateSystemParameter(isRun)
      })
    },
    async updateSystemParameter(isRun) {
      const data = this.getUpdateData
      const paramId = this.paramId
      this.isLoading = true
      await updateSystemParameter(paramId, data)
        .then(() => {
          this.showSuccessMessage(this.$t('Notify.Updated'))
          if (isRun) {
            this.runTemplate()
          }
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(async () => {
          await this.loadData()
          this.isLoading = false
        })
    },
    async runTemplate() {
      const githubData = { name: 'github_verify_info' }
      try {
        await runSystemParameter(githubData)
          .then(() => {
            this.showSuccessMessage('Running GitHub template')
          })
          .catch((err) => {
            console.log(err)
            console.error(err)
          })
        await this.getLockCheck()
      } catch (err) {
        console.error(err)
      }
    },
    async getLockCheck() {
      try {
        const res = await getGithubVerifyStatus()
        this.is_lock = res.data.is_lock
        console.log(res.data)
        if (!this.is_lock) {
          if (this.intervalTimer) {
            this.clearTimer()
          }
        } else if (!this.intervalTimer) {
          this.intervalTimer = window.setInterval(this.getLockCheck, 5000)
        }
        return Promise.resolve(res.data)
      } catch (e) {
        console.error(e)
      }
    },
    clearTimer() {
      clearInterval(this.intervalTimer)
      this.intervalTimer = null
    },
    showSuccessMessage(msg) {
      this.$message({
        message: msg,
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
