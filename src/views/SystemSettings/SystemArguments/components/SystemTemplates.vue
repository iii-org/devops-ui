<template>
  <div class="app-container">
    <el-card v-if="!isLogs" v-loading="isLoading">
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
      <el-row>
        <el-col :span="8">
          <el-button
            icon="ri-terminal-box-line"
            @click.native="handleExecuteLogs"
          >
            Execution Logs
          </el-button>
        </el-col>
        <el-col :span="16" class="text-right">
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
        </el-col>
      </el-row>
    </el-card>
    <el-card v-if="isLogs">
      <el-button 
        type="text"
        icon="el-icon-arrow-left"
        @click="handleClose"
      >
        Back
      </el-button>
      <span>
        <span class="text-title">Template Synchronization Execute Logs</span>
      </span>
      <el-card
        id="podLogSection"
        shadow="never"
        :body-style="{
          color: '#fff',
          background: '#222',
          height: 'calc(100vh - 250px)',
          overflow: 'auto',
          'scroll-behavior': 'smooth'
        }"
      >
        <!-- <pre>{{ logData }}</pre> -->
        <pre>{{ logData }}</pre>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import { getSystemParameter, updateSystemParameter, runSystemParameter, getGithubVerifyStatus } from '@/api/systemParameter'
import { BasicData, Table } from '@/newMixins/index'
import { io } from 'socket.io-client'

const formData = () => ({
  id: '',
  name: '',
  value: {
    token: '',
    account: ''
  },
  active: '',
  logData: 'Loading...'
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
      intervalTimer: null,
      isLogs: false,
      socket: io(process.env.VUE_APP_BASE_API + '/sync_template/websocket/logs', {
      // socket: io('/sync_template/websocket/logs', {
        reconnectionAttempts: 5,
        transports: ['websocket']
      }),
      logData: 'Loading...'
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
    },
    handleExecuteLogs() {
      this.isLogs = true
      this.setLogMessageListener()
    },
    setLogMessageListener() {
      this.socket.on('get_perl_log', sioEvt => {
        console.log(sioEvt)
        const data = sioEvt
        this.setLogMessage(data)
        this.scrollToBottom()
      })
    },
    setLogMessage(data) {
      const target = this.logData
      const isHistoryMessage = target === data || target === 'Loading...'
      if (isHistoryMessage) {
        this.logData = data
      } else {
        if (target.includes(data)) return
        this.logData = this.logData.concat(data)
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const target = this.$el.querySelector(`#podLogSection`).childNodes[1]
        target.scrollTop = target.scrollHeight
      })
    },
    handleClose() {
      this.socket.close()
      // this.logData = 'Loading...'
      this.isLogs = false
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
