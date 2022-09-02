<template>
  <el-dialog
    :title="$t(`Version.${dialogStatusText}Version`)"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="50%"
    top="3vh"
    append-to-body
    @closed="onDialogClosed"
  >
    <el-form ref="versionForm" :model="form" :rules="formRules" label-position="top">
      <el-form-item :label="$t('general.Name')" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item :label="$t('general.DueDate')" prop="due_date">
        <el-date-picker
          v-model="form.due_date"
          type="date"
          :placeholder="$t('Version.EndDate')"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="$t('general.Status')" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="'open'">{{ $t('Version.Open') }}</el-radio>
          <el-radio :label="'closed'">{{ $t('general.Close') }}</el-radio>
          <el-radio :label="'locked'">{{ $t('Version.Locked') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('general.Description')" prop="description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">
        {{ $t('general.Cancel') }}
      </el-button>
      <el-button class="buttonPrimary" :loading="btnConfirmLoading" @click="handleConfirm">
        {{ $t('general.Confirm') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addProjectVersion, editProjectVersion } from '@/api/projects'
import { mapGetters } from 'vuex'

const formTemplate = () => ({
  name: '',
  due_date: '',
  status: 'open',
  description: ''
})

export default {
  name: 'ModifyVersionDialog',
  data() {
    return {
      dialogVisible: false,
      dialogStatus: 1,
      form: formTemplate(),
      formRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        due_date: [{ required: true, message: 'Please input due_date', trigger: 'blur' }],
        status: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        description: [{ required: true, message: 'Please input description', trigger: 'blur' }]
      },
      btnConfirmLoading: false
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
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
  methods: {
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['versionForm'].resetFields()
        this.form = formTemplate()
      })
    },
    async handleConfirm() {
      this.$refs['versionForm'].validate(async valid => {
        if (valid) {
          const data = this.form
          this.btnConfirmLoading = true
          if (this.dialogStatus === 1) {
            await addProjectVersion(this.selectedProject.id, { version: data })
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Added'),
              type: 'success'
            })
          } else {
            await editProjectVersion(this.selectedProject.id, this.form.id, { version: data })
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
          }
          this.$emit('update')
          this.btnConfirmLoading = false
          this.dialogVisible = false
        }
      })
    }
  }
}
</script>
