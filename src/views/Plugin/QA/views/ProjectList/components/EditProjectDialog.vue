<template>
  <el-dialog
    :title="$t('Project.EditProject')"
    :visible.sync="showDialog"
    width="70vw"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <el-form ref="editProjectForm" :model="form" :rules="rules" label-position="top" size="medium">
      <el-row :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('Project.Info') }}</el-divider>
          <el-col :span="24" :sm="12" :xl="6">
            <el-form-item :label="$t('Project.Identifier')">
              <el-input v-model="form.name" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="12" :xl="7">
            <el-form-item :label="$t('Project.Name')" prop="display">
              <el-input v-model="form.display" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="8" :xl="5">
            <el-form-item :label="$t('Project.ProjectOwner')" prop="owner_id">
              <el-select v-model="form.owner_id" style="width: 100%">
                <el-option v-for="item in assignedList" :key="item.id" :label="item.label" :value="item.id">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="8" :xl="3">
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
          <el-col :span="24" :sm="8" :xl="3">
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
          <el-col :span="24">
            <el-form-item :label="$t('general.Description')" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :placeholder="$t('RuleMsg.PleaseInput') + $t('RuleMsg.Description')"
              />
            </el-form-item>
          </el-col>
        </el-col>

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
import { getProjectAssignable } from '@/api/projects'

const formTemplate = () => ({
  id: '',
  name: '',
  display: '',
  description: '',
  start_date: '',
  due_date: '',
  owner_id: '',
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
      display: [{ required: true, message: 'Project Name is required', trigger: 'blur' }],
      start_date: [{ required: true, message: 'Start Date is required', trigger: 'blur' }],
      due_date: [{ required: true, message: 'Due Date is required', trigger: 'blur' }],
      owner_id: [{ required: true, message: 'Project Owner is required', trigger: 'blur' }]
    },
    assignableList: [],
    pickerOptions(startDate) {
      return {
        disabledDate(time) {
          return time.getTime() < new Date(startDate).getTime()
        }
      }
    }
  }),
  computed: {
    assignedList() {
      return this.assignableList.filter(item => item.role_id !== 1).map(item => ({ id: item.id, label: item.name }))
    }
  },
  watch: {
    editProjectObj() {
      const formItems = Object.keys(this.form)
      formItems.forEach(item => {
        this.form[item] = this.editProjectObj[item] === 'None' ? '' : this.editProjectObj[item]
      })
      this.fetchProjectAssignableList(this.editProjectObj.id)
      this.form.owner_id = this.editProjectObj.pm_user_id
    }
  },
  methods: {
    ...mapActions('projects', ['editProject']),
    fetchProjectAssignableList(projectId) {
      getProjectAssignable(projectId).then(res => (this.assignableList = res.data.user_list))
    },
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
          description: this.form.description,
          display: this.form.display,
          owner_id: this.form.owner_id,
          start_date: this.form.start_date,
          due_date: this.form.due_date,
          disabled: this.form.disabled
        }
      }
      const res = await this.editProject(sendData)
      this.isLoading = false
      if (res.message !== 'success') return
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.showDialog = false
      this.$emit('update')
    },
    checkDueDate(startDate) {
      if (new Date(startDate).getTime() >= new Date(this.form.due_date)) this.form.due_date = ''
    }
  }
}
</script>
