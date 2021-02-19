<template>
  <el-dialog
    :title="$t(`Project.${dialogStatusText}Project`)"
    :visible.sync="showDialog"
    width="50%"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <el-form ref="createProjectForm" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('Project.Info') }}</el-divider>
        </el-col>
        <el-col :span="24">
          <el-form-item v-if="dialogStatus === 2" :label="$t('Project.Identifier')">
            <el-input v-model="form.name" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="$t('Project.Name')" prop="display">
            <el-input v-model="form.display" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item v-if="dialogStatus === 1" :label="$t('Project.Identifier')" prop="name">
            <el-input v-model="form.name" />
            <div v-if="dialogStatus === 1" style="word-break: keep-all;margin-top: 5px;">
              {{ $t('Project.IdRule') }}
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="$t('general.Description')" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="Please input description" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="dialogStatus === 1" v-loading="isLoadingTemplate" :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('Project.Template') }}</el-divider>
        </el-col>
        <el-col :span="20">
          <el-form-item v-if="dialogStatus === 1" :label="$t('Project.TemplateName')">
            <el-select v-model="form.template_id" placeholder="Please select template" style="width:100%" clearable>
              <el-option v-for="item in templateList" :key="item.id" :label="item.name" :value="item.id">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item v-if="dialogStatus === 1" :label="$t('Project.Version')">
            <el-select
              v-model="focusVersion"
              style="width:100%"
              :disabled="!form.template_id"
              @change="fetchTemplateParams"
            >
              <el-option v-for="item in versionList" :key="item.name" :label="item.name" :value="item.name">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <div v-if="form.template_param.length !== 0">
            <div v-for="(item, idx) in focusTemplate" :key="item.name">
              <span class="text-subtitle-1 font-weight-bold">{{ item.name }}</span>
              <div v-for="(value, key, index) in item" :key="key + index">
                <el-form-item v-if="key !== 'name' && value !== null" :label="key">
                  <el-select
                    v-if="key === 'branchs'"
                    v-model="form.template_param[idx].branchs"
                    class="my-1"
                    style="width:100%"
                    placeholder="Please select branch"
                  >
                    <el-option v-for="branch in item.branchs" :key="branch" :label="branch" :value="branch">
                      <span>{{ branch }}</span>
                    </el-option>
                  </el-select>
                  <el-switch
                    v-if="key === 'checkmarx.enabled'"
                    v-model="form.template_param[idx]['checkmarx.enabled']"
                    class="my-1"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-switch
                    v-if="key === 'newman.enabled'"
                    v-model="form.template_param[idx]['newman.enabled']"
                    class="my-1"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-switch
                    v-if="key === 'webinspect.enabled'"
                    v-model="form.template_param[idx]['webinspect.enabled']"
                    class="my-1"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-switch
                    v-if="key === 'sonarqube.enabled'"
                    v-model="form.template_param[idx]['sonarqube.enabled']"
                    class="my-1"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-input
                    v-if="key === 'db.name'"
                    v-model="form.template_param[idx]['db.name']"
                    class="my-1"
                    placeholder="Please input DB Name"
                  />
                  <el-input
                    v-if="key === 'db.username'"
                    v-model="form.template_param[idx]['db.username']"
                    class="my-1"
                    placeholder="Please input DB Username"
                  />
                  <el-input
                    v-if="key === 'db.password'"
                    v-model="form.template_param[idx]['db.password']"
                    class="my-1"
                    placeholder="Please input DB Password"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-col :span="24">
        <el-divider content-position="left">{{ $t('general.Active') }}</el-divider>
      </el-col>
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
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :loading="isLoading" @click="onDialogClosed">{{ $t('general.Cancel') }}</el-button>
      <el-button type="primary" :loading="isLoading" @click="handleConfirm">{{ $t('general.Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { getTemplateList, getTemplateParams } from '@/api/template'
import { Message } from 'element-ui'

const formTemplate = () => ({
  name: '',
  display: '',
  disabled: false,
  description: '',
  template_id: '',
  template_param: []
})

export default {
  name: '',
  props: {
    dialogStatus: {
      type: Number,
      default: 1
    },
    editProjectObj: {
      type: Object,
      default: () => {}
    }
  },
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
    versionList: [],
    focusTemplate: '',
    focusVersion: '',
    isLoadingTemplate: false
  }),
  computed: {
    dialogStatusText() {
      switch (this.dialogStatus) {
        case 1:
          return 'Add'
        case 2:
          return 'Edit'
        default:
          return 'Null'
      }
    }
  },
  watch: {
    'form.template_id'(id) {
      if (id !== '') {
        const idx = this.templateList.findIndex(item => item.id === id)
        this.versionList = this.templateList[idx].version
        this.focusVersion = this.versionList[0].name || ''
        this.fetchTemplateParams()
      } else {
        this.focusVersion = ''
        this.form.template_param = []
        this.versionList = []
      }
    },
    editProjectObj() {
      this.form.id = this.editProjectObj.id
      this.form.name = this.editProjectObj.name
      this.form.display = this.editProjectObj.display
      this.form.description = this.editProjectObj.description
      this.form.disabled = this.editProjectObj.disabled
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions('projects', ['addNewProject', 'editProject']),
    async init() {
      await getTemplateList().then(res => {
        this.templateList = res
      })
    },
    onDialogClosed() {
      this.showDialog = false
      this.$nextTick(() => {
        this.$refs.createProjectForm.resetFields()
        this.form = formTemplate()
      })
    },
    async handleConfirm() {
      this.$refs.createProjectForm.validate(async valid => {
        if (!valid) return
        if (this.dialogStatus === 2) return this.handleConfirmEdit()
        this.isLoading = true
        const sendData = {
          name: this.form.name,
          display: this.form.display,
          description: this.form.description,
          disabled: this.form.disabled
        }
        const res = await this.addNewProject(sendData)
        this.isLoading = false
        if (res.message !== 'success') return
        Message({
          message: 'Project added successfully',
          type: 'success',
          duration: 1 * 1000
        })
        this.showDialog = false
        this.$emit('update')
      })
    },
    async handleConfirmEdit() {
      this.isLoading = true
      const sendData = {
        pId: this.form.id,
        data: {
          display: this.form.display,
          description: this.form.description,
          disabled: this.form.disabled
        }
      }
      const res = await this.editProject(sendData)
      this.isLoading = false
      if (res.message !== 'success') return
      Message({
        message: 'Project update successfully',
        type: 'success',
        duration: 1 * 1000
      })
      this.showDialog = false
      this.$emit('update')
    },
    async fetchTemplateParams() {
      this.form.template_param = []
      this.isLoadingTemplate = true
      await getTemplateParams(this.form.template_id, this.focusVersion).then(res => {
        this.focusTemplate = res.template_param
        this.form.template_param = JSON.parse(JSON.stringify(res.template_param))
      })
      this.isLoadingTemplate = false
    }
  }
}
</script>
