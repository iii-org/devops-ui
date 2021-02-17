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
        <el-col :span="24">
          <el-form-item v-if="dialogStatus === 1" :label="$t('Project.Template')">
            <el-select v-model="form.template" placeholder="Please select template" style="width:100%" clearable>
              <el-option v-for="item in templateList" :key="item.name" :label="item.name" :value="item.name">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item v-if="dialogStatus === 1" :label="$t('Project.Version')">
            <el-select v-model="form.version" placeholder="Please select version" style="width:100%">
              <el-option v-for="item in versionList" :key="item.name" :label="item.name" :value="item.name">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item :label="$t('general.Active')" prop="disabled">
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
import { getTemplate } from '@/api/template'
import { Message } from 'element-ui'

const formTemplate = () => ({
  name: '',
  display: '',
  disabled: false,
  description: '',
  template: '',
  version: ''
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
    focusTemplate: ''
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
    'form.template'(val) {
      if (val !== '') {
        this.form.version = ''
        const idx = this.templateList.findIndex(item => item.name === val)
        this.versionList = this.templateList[idx].version
        this.form.version = this.templateList[idx].version[0].name || ''
      } else {
        this.form.version = ''
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
      await getTemplate().then(res => {
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
    }
  }
}
</script>
