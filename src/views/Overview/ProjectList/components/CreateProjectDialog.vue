<template>
  <el-dialog
    :title="$t('Project.AddProject')"
    :visible.sync="showDialog"
    width="70%"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <el-form ref="createProjectForm" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('Project.Info') }}</el-divider>
          <el-col :span="24" :sm="12" :xl="9">
            <el-form-item :label="$t('Project.Name')" prop="display">
              <el-input v-model="form.display" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :xl="9">
            <el-form-item :label="$t('Project.Identifier')" prop="name">
              <el-input v-model="form.name" :maxlength="30" show-word-limit />
              <div style="word-break: keep-all;margin-top: 5px;">
                {{ $t('Project.IdRule') }}
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :xl="3">
            <el-form-item :label="$t('Project.StartDate')" prop="start_date">
              <el-date-picker
                v-model="form.start_date"
                type="date"
                value-format="yyyy-MM-dd"
                style="width: 100%"
                @change="checkDueDate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :xl="3">
            <el-form-item :label="$t('Project.DueDate')" prop="due_date">
              <el-date-picker
                v-model="form.due_date"
                type="date"
                value-format="yyyy-MM-dd"
                style="width: 100%"
                :picker-options="pickerOptions(form.start_date)"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="checkOwnerRequired" :span="24">
            <el-form-item :label="$t('Project.ProjectOwner')" :prop="checkOwnerRequired ? 'owner_id' : ''">
              <el-select v-model="form.owner_id" filterable style="width:100%">
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :value="user.id"
                  :label="user.name + ' (' + user.login + ')'"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('general.Description')" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="Please input description" />
            </el-form-item>
          </el-col>
        </el-col>
      </el-row>
      <el-row class="loading-template" :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">
            {{ $t('Project.Template') }}
            <el-button class="ml-2" icon="el-icon-refresh" size="mini" circle @click="init(1)" />
          </el-divider>
        </el-col>
        <el-col :xs="24" :sm="18" :md="20">
          <el-form-item :label="$t('Project.TemplateName')">
            <div slot="label" class="d-flex mb-2 align-center">
              <span class="mr-3">{{ $t('Project.TemplateName') }}</span>
              <el-radio-group v-model="focusSources" size="mini">
                <el-radio-button label="Public Templates">Public</el-radio-button>
                <el-radio-button label="Local Templates">Local</el-radio-button>
              </el-radio-group>
            </div>
            <el-select
              v-model="form.template_id"
              :placeholder="$t('Project.SelectTemplate')"
              style="width:100%"
              clearable
              filterable
              @change="handleTemplateSelect"
            >
              <el-option
                v-for="item in activeTemplateList"
                :key="item.id"
                :label="item.display || item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="6" :md="4">
          <el-form-item :label="$t('Project.Version')">
            <div slot="label" class="mb-2">
              <span>{{ $t('Project.Version') }}</span>
            </div>
            <el-select
              v-model="form.tag_name"
              style="width:100%"
              :disabled="!form.template_id"
              @change="handleVersionSelect"
            >
              <el-option v-for="item in versionList" :key="item.name" :label="item.name" :value="item.name">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="focusTemplate.description" :span="24">
          <el-form-item :label="$t('Project.TemplateDescription')">
            <p v-html="focusTemplate.description" />
          </el-form-item>
        </el-col>
        <div>
          <el-col v-for="(argument, idx) in form.argumentsForm" :key="argument.key" :span="8">
            <el-form-item
              :label="argument.display"
              :prop="'argumentsForm.' + idx + '.value'"
              :rules="{
                required: true,
                message: `${argument.display} is required`,
                trigger: 'blur'
              }"
            >
              <el-input v-if="argument.input_type === 'text'" v-model="argument.value" placeholder="Please input" />
              <el-input
                v-else-if="argument.input_type === 'password'"
                v-model="argument.value"
                placeholder="Please input"
                show-password
              />
            </el-form-item>
          </el-col>
        </div>
      </el-row>
      <!-- <el-row :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('general.Active') }}</el-divider>
          <el-form-item prop="disabled">
            <el-switch
              v-model="form.disabled"
              :active-value="false"
              :inactive-value="true"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-text="$t('general.Enable')"
              :inactive-text="$t('general.Disable')"
            />
          </el-form-item>
        </el-col>
      </el-row> -->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :loading="isLoading" @click="onDialogClosed">{{ $t('general.Cancel') }}</el-button>
      <el-button type="primary" :loading="isLoading" @click="handleConfirm">{{ $t('general.Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import dayjs from 'dayjs'
import { mapActions, mapGetters } from 'vuex'
import { getTemplateList, getTemplateParams, getTemplateParamsByVersion } from '@/api/template'
import { refreshRancherCatalogs } from '@/api/rancher'
import { getUserListByFilter } from '@/api/user'

const formTemplate = () => ({
  name: '',
  description: '',
  display: '',
  disabled: false,
  template_id: '',
  start_date: dayjs().format('YYYY-MM-DD'),
  due_date: '',
  tag_name: '',
  argumentsForm: []
})

export default {
  name: 'CreateDialog',
  data() {
    return {
      showDialog: false,
      isLoading: false,
      form: formTemplate(),
      rules: {
        name: [
          { required: true, message: 'Project Identifier is required', trigger: 'blur' },
          {
            required: true,
            pattern: /^[a-z][a-z0-9-]{0,28}[a-z0-9]$/,
            message: 'Identifier is invalid.',
            trigger: 'blur'
          }
        ],
        display: [{ required: true, message: 'Project Name is required', trigger: 'blur' }],
        start_date: [{ required: true, message: 'Start Date is required', trigger: 'blur' }],
        due_date: [{ required: true, message: 'Due Date is required', trigger: 'blur' }],
        owner_id: [{ required: true, message: 'Owner is required', trigger: 'blur' }]
      },
      userList: [],
      templateList: [],
      focusTemplate: {},
      isLoadingTemplate: false,
      pickerOptions(startDate) {
        return {
          disabledDate(time) {
            return time.getTime() < new Date(startDate).getTime()
          }
        }
      },
      loadingText: ['createRedmine', 'createGitLab', 'createHarbor', 'integrationProject'],
      loadingTemplateText: ['', '.', '..', '...'],
      loadingInstance: {},
      tamplateLoadingInstance: {},
      timeout: '',
      focusSources: 'Public Templates'
    }
  },
  computed: {
    ...mapGetters(['userRole']),
    versionList() {
      return this.focusTemplate.version || []
    },
    checkOwnerRequired() {
      return this.userRole === 'QA' || this.userRole === 'Administrator'
    },
    activeTemplateList() {
      if (this.templateList.length === 0) return []
      const idx = this.templateList.findIndex(item => item.source === this.focusSources)
      return this.templateList[idx].options
    }
  },
  watch: {
    isLoading(val) {
      if (val) {
        this.loadingInstance = this.$loading({
          text: this.$t('Loading'),
          lock: true,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
          customClass: 'project-dialog-loading'
        })
        this.loadingText.map((text, index) => {
          this.timeout = setTimeout(() => this.openFullLoading(text), 3000 * index)
        })
      } else {
        clearTimeout(this.timeout)
        this.openFullLoading()
      }
    },
    isLoadingTemplate(val) {
      if (val) {
        const text = this.$t('LoadingText.loadingTemplateText')
        this.tamplateLoadingInstance = this.$loading({
          text,
          spinner: 'el-icon-loading',
          background: 'rgba(255, 255, 255, 0.9)',
          target: '.loading-template',
          customClass: 'project-dialog-template-loading'
        })
        // set 60secs for loading to show different words
        for (let sec = 1; sec < 60; sec++) {
          const templateText = `${text}${this.loadingTemplateText[sec % 4]}`
          this.timeout = setTimeout(() => this.openTemplateFullLoading(templateText), 1000 * sec)
        }
      } else {
        clearTimeout(this.timeout)
        this.openTemplateFullLoading()
      }
    },
    focusSources(val) {
      this.clearFocusTemplate()
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions('projects', ['addNewProject']),
    async init(isForceUpdate) {
      if (this.checkOwnerRequired) {
        const userList = await getUserListByFilter({ role_ids: 3 }) // pm
        this.userList = userList.data.user_list
      }
      this.isLoadingTemplate = true
      await getTemplateList({ force_update: isForceUpdate }).then(res => {
        this.templateList = res.data
      })
      this.isLoadingTemplate = false
    },
    onDialogClosed() {
      this.showDialog = false
      this.$nextTick(() => {
        this.$refs.createProjectForm.resetFields()
        this.form = formTemplate()
        this.clearFocusTemplate()
      })
    },
    async handleConfirm() {
      this.$refs.createProjectForm.validate(async valid => {
        if (!valid) return
        this.isLoading = true
        const sendData = this.handleSendData()
        this.addNewProject(sendData)
          .then(() => {
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Created'),
              type: 'success'
            })
            this.showDialog = false
            this.$emit('update')
          })
          .catch(err => {
            console.log(err)
          })
          .then(() => {
            this.isLoading = false
          })
      })
    },
    openFullLoading(loadingText) {
      // handle i18n log warning when loadingText is undefined
      const text = loadingText ? this.$t(`LoadingText.${loadingText}`) : this.$t('LoadingText.integrationProject')
      if (loadingText) this.loadingInstance.setText(text) // set loading text every 3 second
      else this.loadingInstance.close() // if loadingText is undefined, close the instance
    },
    openTemplateFullLoading(loadingText) {
      if (loadingText) this.tamplateLoadingInstance.setText(loadingText)
      else this.tamplateLoadingInstance.close()
    },
    handleSendData() {
      const result = Object.assign({}, this.form)
      if (result.argumentsForm.length > 0) {
        result.arguments = result.argumentsForm.reduce(
          (result, cur) => Object.assign(result, { [cur.key]: cur.value }),
          {}
        )
      }
      if (result.description === '') delete result.description
      if (result.template_id === '') delete result.template_id
      if (result.tag_name === '') delete result.tag_name
      delete result.argumentsForm
      return result
    },
    clearFocusTemplate() {
      this.form.template_id = ''
      this.form.tag_name = ''
      this.focusTemplate = {}
      this.form.argumentsForm = []
    },
    handleTemplateSelect() {
      if (this.form.template_id !== '') {
        const idx = this.activeTemplateList.findIndex(item => item.id === this.form.template_id)
        this.focusTemplate = this.activeTemplateList[idx]
        this.form.tag_name = this.versionList[0] ? this.versionList[0].name : ''
        this.handleVersionSelect()
      } else {
        this.clearFocusTemplate()
      }
    },
    handleVersionSelect() {
      if (this.form.tag_name !== '') {
        this.fetchTemplateParamsByVersion()
      } else {
        this.fetchTemplateParams()
      }
    },
    fetchTemplateParams() {
      this.isLoadingTemplate = true
      getTemplateParams(this.form.template_id)
        .then(res => {
          if (res.data['arguments']) {
            this.handleArguments(res.data['arguments'])
          } else {
            this.form.argumentsForm = []
          }
        })
        .catch(err => {
          this.form.template_id = ''
          this.clearFocusTemplate()
          console.error('fetchTemplateParams error', err)
        })
        .then(() => {
          this.isLoadingTemplate = false
        })
    },
    fetchTemplateParamsByVersion() {
      this.isLoadingTemplate = true
      getTemplateParamsByVersion(this.form.template_id, this.form.tag_name)
        .then(res => {
          if (res.data.arguments) {
            this.handleArguments(res.data.arguments)
          } else {
            this.form.argumentsForm = []
          }
        })
        .catch(err => {
          this.form.template_id = ''
          this.clearFocusTemplate()
          console.error(err)
        })
        .then(() => {
          this.isLoadingTemplate = false
        })
    },
    handleArguments(data) {
      this.form.argumentsForm = data.map(item => {
        const result = item
        result.value = item.default_value
        return result
      })
    },
    async refreshTemplate() {
      await refreshRancherCatalogs()
        .then(() => {
          // console.log(res)
        })
        .catch(err => {
          console.error(err)
        })
    },
    checkDueDate(startDate) {
      if (new Date(startDate).getTime() >= new Date(this.form.due_date)) this.form.due_date = ''
    }
  }
}
</script>
