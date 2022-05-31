<template>
  <el-dialog
    :title="$t('Project.EditProject')"
    :visible.sync="showDialog"
    width="70vw"
    top="3vh"
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
            <el-form-item :label="$t('Project.Owner')" prop="owner_id">
              <el-select v-model="form.owner_id" style="width: 100%" :disabled="disabledEditOwner">
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
            <el-form-item :label="$t('general.DueDate')" prop="due_date">
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
                :placeholder="$t('general.PleaseInput') + $t('RuleMsg.Description')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('Project.ParentProject')">
              <el-col
                :xl="18"
                :md="18"
                :sm="14"
                :xs="24"
              >
                <el-select
                  v-model="form.parent_id"
                  :placeholder="$t('Project.SelectProject')"
                  class="mr-3"
                  style="width:100%"
                  filterable
                  clearable
                  @change="handleInheritanceMemberChange()"
                  @clear="form.is_inheritance_member=false"
                >
                  <el-option-group
                    v-for="group in categoryProjectList"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="item in group.options"
                      :key="item.id"
                      :label="item.display"
                      :value="item.id"
                    />
                  </el-option-group>
                </el-select>
              </el-col>
              <el-col
                :xl="6"
                :md="6"
                :sm="10"
                :xs="24"
              >
                <el-switch
                  v-model="form.is_inheritance_member"
                  :disabled="isInheritanceMemberChange"
                  :active-text="$t('Project.InheritParentProjectMember')"
                />
              </el-col>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.base_example && baseExampleInfo"
            :span="24"
          >
            <el-form-item :label="$t('Project.OriginalTemplate')">
              <p v-html="baseExampleInfo" />
            </el-form-item>
          </el-col>
        </el-col>

        <el-col :span="24">
          <el-divider content-position="left">{{ $t('general.Active') }}</el-divider>
          <el-form-item prop="disabled">
            <el-switch
              v-model="form.disabled"
              :disabled="disabledEditOwner"
              :active-value="false"
              :inactive-value="true"
              inactive-color="#ff4949"
              :active-text="$t('general.Enable')"
              :inactive-text="$t('general.Disable')"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="buttonSecondaryReverse" :loading="isLoading" @click="onDialogClosed">{{ $t('general.Cancel') }}</el-button>
      <el-button class="buttonPrimary" :loading="isLoading" @click="handleConfirm">{{ $t('general.Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getProjectAssignable } from '@/api/projects'
import { getTemplateList } from '@/api/template'
import i18n from '@/lang'

const formTemplate = () => ({
  id: '',
  name: '',
  display: '',
  description: '',
  start_date: '',
  due_date: '',
  owner_id: '',
  base_example: '',
  disabled: false,
  parent_id: '',
  is_inheritance_member: false
})

export default {
  name: 'EditProjectDialog',
  props: {
    editProjectObj: {
      type: Object,
      default: () => ({})
    },
    categoryProjectList: {
      type: Array,
      default: () => []
    }
  },
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
        owner_id: [{ required: true, message: 'Project Owner is required', trigger: 'blur' }],
        description: [
          {
            pattern: /^[^<&]+$/,
            message: i18n.t('Project.DescriptionRule'),
            trigger: 'blur'
          }
        ]
      },
      assignableList: [],
      baseExampleInfo: '',
      originProject: {
        parent_id: '',
        is_inheritance_member: false
      },
      pickerOptions(startDate) {
        return {
          disabledDate(time) {
            return time.getTime() < new Date(startDate).getTime()
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'userRole']),
    assignedList() {
      return this.assignableList.filter(item => item.role_id !== 1).map(item => ({ id: item.id, label: item.name }))
    },
    disabledEditOwner() {
      if (this.userRole === 'Administrator') return false
      return this.userId !== this.editProjectObj.owner_id
    },
    isInheritanceMemberChange() {
      return (this.originProject.parent_id === this.form.parent_id &&
      this.originProject.is_inheritance_member) || !this.form.parent_id
    }
  },
  watch: {
    editProjectObj() {
      const formItems = Object.keys(this.form)
      formItems.forEach(item => {
        this.form[item] = this.editProjectObj[item] === 'None' ? '' : this.editProjectObj[item]
      })
      this.fetchProjectAssignableList(this.editProjectObj.id)
      this.getExampleInfo()
      this.form.owner_id = this.editProjectObj.owner_id
    }
  },
  methods: {
    ...mapActions('projects', ['editProject']),
    fetchProjectAssignableList(projectId) {
      getProjectAssignable(projectId).then(res => (this.assignableList = res.data.user_list))
    },
    async getExampleInfo() {
      if (this.userRole !== 'Engineer') {
        this.originProject.parent_id = this.editProjectObj.parent_id
        this.originProject.is_inheritance_member = this.editProjectObj.is_inheritance_member
        await getTemplateList().then((res) => {
          res.data.forEach((item) => {
            item.options.forEach((element) => {
              if (element.path === this.form.base_example) {
                this.baseExampleInfo = element.description
              }
            })
          })
        })
      }
    },
    handleInheritanceMemberChange() {
      if (this.originProject.parent_id === this.form.parent_id) {
        this.form.is_inheritance_member = this.originProject.is_inheritance_member
      }
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
      if (!this.form.parent_id) {
        sendData.data.parent_id = ''
        sendData.data.is_inheritance_member = false
      } else if (
        (this.originProject.parent_id !== this.form.parent_id) ||
        (!this.originProject.is_inheritance_member && this.form.is_inheritance_member)
      ) {
        sendData.data.parent_id = this.form.parent_id
        sendData.data.is_inheritance_member = this.form.is_inheritance_member
      }
      this.editProject(sendData).then(res => {
        this.isLoading = false
        if (res.message === 'success') {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.showDialog = false
          this.$emit('update')
        } else {
          this.$message({
            title: this.$t('general.Warning'),
            message: res.error.message,
            type: 'warning'
          })
        }
      })
    },
    checkDueDate(startDate) {
      if (new Date(startDate).getTime() >= new Date(this.form.due_date)) this.form.due_date = ''
    }
  }
}
</script>
