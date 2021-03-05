<template>
  <el-dialog
    :title="$t('Project.AddProject')"
    :visible.sync="showDialog"
    width="50%"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <el-form ref="createProjectForm" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('Project.Info') }}</el-divider>
          <el-form-item :label="$t('Project.Name')" prop="display">
            <el-input v-model="form.display" />
          </el-form-item>
          <el-form-item :label="$t('Project.Identifier')" prop="name">
            <el-input v-model="form.name" :maxlength="30" show-word-limit />
            <div style="word-break: keep-all;margin-top: 5px;">
              {{ $t('Project.IdRule') }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('general.Description')" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="Please input description" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-loading="isLoadingTemplate" :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">
            {{ $t('Project.Template') }}
            <el-button class="ml-2" icon="el-icon-refresh" size="mini" circle @click="init" />
          </el-divider>
        </el-col>
        <el-col :xs="24" :sm="18" :md="20">
          <el-form-item :label="$t('Project.TemplateName')">
            <el-select
              v-model="form.template_id"
              placeholder="Please select template"
              style="width:100%"
              clearable
              filterable
              @change="handleTemplateSelect"
            >
              <el-option v-for="item in templateList" :key="item.id" :label="item.display" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="6" :md="4">
          <el-form-item :label="$t('Project.Version')">
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
          <el-form-item label="Template Description">
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
import { mapActions } from 'vuex'
import { getTemplateList, getTemplateParams, getTemplateParamsByVersion } from '@/api/template'
import { refreshRancherCatalogs } from '@/api/rancher'

const formTemplate = () => ({
  name: '',
  description: '',
  display: '',
  disabled: false,
  template_id: '',
  tag_name: '',
  argumentsForm: []
})

export default {
  name: '',
  data: () => ({
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
      display: [{ required: true, message: 'Project Name  is required', trigger: 'blur' }]
    },
    templateList: [],
    focusTemplate: {},
    isLoadingTemplate: false
  }),
  computed: {
    versionList() {
      return this.focusTemplate.version || []
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions('projects', ['addNewProject']),
    async init() {
      this.isLoadingTemplate = true
      await getTemplateList().then(res => {
        this.templateList = res
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
        const res = await this.addNewProject(sendData)
        this.isLoading = false
        if (res.message !== 'success') return
        this.$notify({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Created'),
          type: 'success'
        })
        this.showDialog = false
        this.$emit('update')
      })
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
      this.form.tag_name = ''
      this.focusTemplate = {}
      this.form.argumentsForm = []
    },
    handleTemplateSelect() {
      if (this.form.template_id !== '') {
        const idx = this.templateList.findIndex(item => item.id === this.form.template_id)
        this.focusTemplate = this.templateList[idx]
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
          if (res.arguments) {
            this.handleArguments(res.arguments)
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
          if (res.arguments) {
            this.handleArguments(res.arguments)
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
        .then(res => {
          // console.log(res)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
