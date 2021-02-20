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
          <el-divider content-position="left">{{ $t('Project.Template') }}</el-divider>
          <el-form-item :label="$t('Project.TemplateName')">
            <el-select v-model="form.template_id" placeholder="Please select template" style="width:100%" clearable>
              <el-option v-for="item in templateList" :key="item.id" :label="item.name" :value="item.id">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="4">
          <el-form-item :label="$t('Project.Version')">
            <el-select
              v-model="form.tag_name"
              style="width:100%"
              :disabled="!form.template_id"
              @change="fetchTemplateParams"
            >
              <el-option v-for="item in versionList" :key="item.name" :label="item.name" :value="item.name">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col> -->
        <!-- <el-col :span="24">
          <div v-if="templateParamForm.length !== 0">
            <div v-for="(item, idx) in focusTemplate" :key="item.name">
              <span class="text-subtitle-1 font-weight-bold">{{ item.name }}</span>
              <div v-for="(value, key, index) in item" :key="key + index">
                <el-form-item v-if="key !== 'name' && value !== null" :label="key">
                  <el-select
                    v-if="key === 'branchs'"
                    v-model="templateParamForm[idx].branchs"
                    class="my-1"
                    style="width:100%"
                    placeholder="Please select branch"
                    multiple
                  >
                    <el-option v-for="branch in item.branchs" :key="branch" :label="branch" :value="branch">
                      <span>{{ branch }}</span>
                    </el-option>
                  </el-select>
                  <el-switch
                    v-if="key === 'checkmarx.enabled'"
                    v-model="templateParamForm[idx]['checkmarx.enabled']"
                    class="my-1"
                    :active-text="$t('general.Enable')"
                    :inactive-text="$t('general.Disable')"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-switch
                    v-if="key === 'newman.enabled'"
                    v-model="templateParamForm[idx]['newman.enabled']"
                    class="my-1"
                    :active-text="$t('general.Enable')"
                    :inactive-text="$t('general.Disable')"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-switch
                    v-if="key === 'webinspect.enabled'"
                    v-model="templateParamForm[idx]['webinspect.enabled']"
                    class="my-1"
                    :active-text="$t('general.Enable')"
                    :inactive-text="$t('general.Disable')"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-switch
                    v-if="key === 'sonarqube.enabled'"
                    v-model="templateParamForm[idx]['sonarqube.enabled']"
                    class="my-1"
                    :active-text="$t('general.Enable')"
                    :inactive-text="$t('general.Disable')"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <el-input
                    v-if="key === 'db.name'"
                    v-model="templateParamForm[idx]['db.name']"
                    class="my-1"
                    placeholder="Please input DB Name"
                  />
                  <el-input
                    v-if="key === 'db.username'"
                    v-model="templateParamForm[idx]['db.username']"
                    class="my-1"
                    placeholder="Please input DB Username"
                  />
                  <el-input
                    v-if="key === 'db.password'"
                    v-model="templateParamForm[idx]['db.password']"
                    :label="'DB Password'"
                    class="my-1"
                    placeholder="Please input DB Password"
                    show-password
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-col> -->
      </el-row>
      <el-row v-if="hasDbInfos" :gutter="10">
        <el-col :span="8">
          <el-form-item label="DB Username">
            <el-input v-model="form.db_username" placeholder="Please input" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="DB Password">
            <el-input v-model="form.db_password" :label="'DB Password'" placeholder="Please input" show-password />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="DB Name">
            <el-input v-model="form.db_name" placeholder="Please input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
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
      </el-row>
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
  tag_name: '',
  db_username: '',
  db_password: '',
  db_name: ''
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
    versionList: [],
    focusTemplate: [],
    templateParamForm: [],
    isLoadingTemplate: false
  }),
  computed: {
    hasDbInfos() {
      const refTemplate = this.focusTemplate
      const infos = refTemplate.map(item => Object.keys(item)).flat()
      const result = infos.includes('db.name')
      return result
    }
  },
  watch: {
    'form.template_id'(id) {
      if (id !== '') {
        const idx = this.templateList.findIndex(item => item.id === id)
        this.versionList = this.templateList[idx].version
        this.form.tag_name = this.versionList[0].name || ''
        this.fetchTemplateParams()
      } else {
        this.form.tag_name = ''
        this.form.db_username = ''
        this.form.db_password = ''
        this.form.db_name = ''
        this.templateParamForm = []
        this.focusTemplate = []
        this.versionList = []
      }
    },
    hasDbInfos(val) {
      if (val) {
        this.form.db_username = ''
        this.form.db_password = ''
        this.form.db_name = ''
      } else {
        this.form.db_username = ''
        this.form.db_password = ''
        this.form.db_name = ''
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions('projects', ['addNewProject']),
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
        this.isLoading = true
        const res = await this.addNewProject(this.form)
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
    async fetchTemplateParams() {
      this.templateParamForm = []
      this.isLoadingTemplate = true
      await getTemplateParams(this.form.template_id, this.form.tag_name).then(res => {
        this.focusTemplate = res.template_param
        this.templateParamForm = JSON.parse(JSON.stringify(res.template_param))
      })
      this.isLoadingTemplate = false
    }
  }
}
</script>
