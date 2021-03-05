<template>
  <el-dialog
    :title="$t('Project.EditProject')"
    :visible.sync="showDialog"
    width="50%"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <el-form ref="editProjectForm" :model="form" :rules="rules" label-position="top">
      <el-row :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('Project.Info') }}</el-divider>
          <el-form-item :label="$t('Project.Identifier')">
            <el-input v-model="form.name" disabled />
          </el-form-item>
          <el-form-item :label="$t('Project.Name')" prop="display">
            <el-input v-model="form.display" />
          </el-form-item>
          <el-form-item :label="$t('general.Description')" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="Please input description" />
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

const formTemplate = () => ({
  id: '',
  name: '',
  display: '',
  description: '',
  disabled: false
})

export default {
  name: '',
  props: {
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
    }
  }),
  watch: {
    editProjectObj() {
      this.form.id = this.editProjectObj.id
      this.form.name = this.editProjectObj.name
      this.form.display = this.editProjectObj.display
      this.form.description = this.editProjectObj.description
      this.form.disabled = this.editProjectObj.disabled
    }
  },
  methods: {
    ...mapActions('projects', ['editProject']),
    onDialogClosed() {
      this.showDialog = false
      this.$nextTick(() => {
        this.$refs.editProjectForm.resetFields()
        this.form = formTemplate()
      })
    },
    async handleConfirm() {
      this.$refs.editProjectForm.validate(async valid => {
        if (!valid) return
        this.handleConfirmEdit()
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
      this.$notify({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.showDialog = false
      this.$emit('update')
    }
  }
}
</script>
