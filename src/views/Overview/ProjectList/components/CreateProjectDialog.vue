<template>
  <el-dialog
    :title="$t('Project.AddProject')"
    :visible.sync="showDialog"
    width="70%"
    top="3vh"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <el-form
      ref="createProjectForm"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-row :gutter="10">
        <el-col :span="24">
          <el-divider content-position="left">{{ $t('Project.Info') }}</el-divider>
          <el-col
            :span="24"
            :sm="12"
            :xl="9"
          >
            <el-form-item
              :label="$t('Project.Name')"
              prop="display"
            >
              <el-input v-model="form.display" />
            </el-form-item>
          </el-col>
          <el-col
            :span="24"
            :sm="12"
            :xl="9"
          >
            <el-form-item
              :label="$t('Project.Identifier')"
              prop="name"
            >
              <el-input
                v-model="form.name"
                :maxlength="30"
                show-word-limit
              />
            </el-form-item>
            <span class="font-sm">
              {{ $t('Project.IdRule') }}
            </span>
          </el-col>
          <el-col
            :span="24"
            :sm="12"
            :xl="3"
          >
            <el-form-item
              :label="$t('Project.StartDate')"
              prop="start_date"
            >
              <el-date-picker
                v-model="form.start_date"
                type="date"
                value-format="yyyy-MM-dd"
                style="width: 100%"
                @change="checkDueDate"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="24"
            :sm="12"
            :xl="3"
          >
            <el-form-item
              :label="$t('general.DueDate')"
              prop="due_date"
            >
              <el-date-picker
                v-model="form.due_date"
                type="date"
                value-format="yyyy-MM-dd"
                style="width: 100%"
                :picker-options="pickerOptions(form.start_date)"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="checkOwnerRequired"
            :span="24"
          >
            <el-form-item
              :label="$t('Project.Owner')"
              :prop="checkOwnerRequired ? 'owner_id' : ''"
            >
              <el-select
                v-model="form.owner_id"
                filterable
                style="width:100%"
              >
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
            <el-form-item
              :label="$t('general.Description')"
              prop="description"
            >
              <el-input
                v-model="form.description"
                type="textarea"
                :placeholder="$t('general.PleaseInput') + $t('general.Description')"
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
                <ProjectList :form="form" />
              </el-col>
              <el-col
                :xl="6"
                :md="6"
                :sm="10"
                :xs="24"
              >
                <el-switch
                  v-model="form.is_inheritance_member"
                  :disabled="!form.parent_id"
                  :active-text="$t('Project.InheritParentProjectMember')"
                />
              </el-col>
            </el-form-item>
          </el-col>
        </el-col>
      </el-row>
      <TemplateList
        v-if="showDialog"
        :is-create="showDialog"
        :form="form"
        @clearTemplate="clearTemplate"
      />
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :loading="isLoading"
        class="buttonSecondaryReverse"
        @click="onDialogClosed"
      >{{ $t('general.Cancel') }}</el-button>
      <el-button
        class="buttonPrimary"
        :loading="isLoading"
        @click="handleConfirm"
      >{{ $t('general.Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getLocalTime } from '@/utils/handleTime'
import { mapActions, mapGetters } from 'vuex'
import { refreshRancherCatalogs } from '@/api/rancher'
import { getUserListByFilter } from '@/api/user'
import ProjectList from './ProjectList'
import TemplateList from './TemplateList'

const formTemplate = () => ({
  name: '',
  description: '',
  display: '',
  disabled: false,
  template_id: '',
  start_date: getLocalTime(Date.now(), 'YYYY-MM-DD'),
  due_date: '',
  tag_name: '',
  argumentsForm: [],
  parent_id: '',
  is_inheritance_member: false
})

export default {
  name: 'CreateDialog',
  components: {
    ProjectList,
    TemplateList
  },
  data() {
    return {
      showDialog: false,
      isLoading: false,
      form: formTemplate(),
      rules: {
        name: [
          { required: true, message: this.$t('general.PleaseInput') + this.$t('Project.Identifier'), trigger: 'blur' },
          {
            required: true,
            pattern: /^[a-z][a-z0-9-]{0,28}[a-z0-9]$/,
            message: this.$t('Project.IdInvalid'),
            trigger: 'blur'
          }
        ],
        display: [
          { required: true, message: this.$t('general.PleaseInput') + this.$t('Project.Name'), trigger: 'blur' },
          {
            required: true,
            pattern: /^[^<&]+$/,
            message: this.$t('Project.DisplayRule'),
            trigger: 'blur'
          }
        ],
        start_date: [
          { required: true, message: this.$t('general.PleaseInput') + this.$t('Project.StartDate'), trigger: 'blur' }
        ],
        due_date: [
          { required: true, message: this.$t('general.PleaseInput') + this.$t('general.DueDate'), trigger: 'blur' }
        ],
        owner_id: [
          { required: true, message: this.$t('general.PleaseInput') + this.$t('general.owner_name'), trigger: 'blur' }
        ],
        description: [
          {
            pattern: /^[^<&]+$/,
            message: this.$t('Project.DescriptionRule'),
            trigger: 'blur'
          }
        ]
      },
      userList: [],
      pickerOptions(startDate) {
        return {
          disabledDate(time) {
            return time.getTime() < new Date(startDate).getTime()
          }
        }
      },
      loadingText: ['createRedmine', 'createGitLab', 'createHarbor', 'integrationProject'],
      loadingInstance: {},
      timer: ''
    }
  },
  computed: {
    ...mapGetters(['userRole']),
    checkOwnerRequired() {
      return this.userRole === 'QA' || this.userRole === 'Administrator'
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
        this.loadingText.forEach((text, index) => {
          this.timer = setTimeout(() => this.openFullLoading(text), 3000 * index)
        })
      } else {
        this.$nextTick(() => {
          clearTimeout(this.timer)
          this.loadingInstance.close()
          this.$emit('update')
        })
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions('projects', ['addNewProject']),
    async init() {
      if (this.checkOwnerRequired) {
        const userList = await getUserListByFilter({ role_ids: 3 }) // pm
        this.userList = userList.data.user_list
      }
    },
    onDialogClosed() {
      this.showDialog = false
      this.$nextTick(() => {
        this.$refs.createProjectForm.resetFields()
        this.form = formTemplate()
        this.clearTemplate()
      })
    },
    async handleConfirm() {
      this.$refs.createProjectForm.validate(async (valid) => {
        if (!valid) return
        this.isLoading = true
        const sendData = this.handleSendData()
        this.addNewProject(sendData)
          .then(() => {
            this.$message({
              message: this.$t('Notify.Created'),
              type: 'success'
            })
          })
          .catch((err) => {
            this.$message({
              message: err,
              type: 'error'
            })
          })
          .finally(() => {
            this.showDialog = false
            this.isLoading = false
          })
      })
    },
    openFullLoading(loadingText) {
      // handle i18n log warning when loadingText is undefined
      const text = loadingText ? this.$t(`LoadingText.${loadingText}`) : this.$t('LoadingText.integrationProject')
      // set loading text every 3 second
      this.loadingInstance.setText(text)
    },
    handleSendData() {
      const result = Object.assign({}, this.form)
      if (result.argumentsForm.length > 0) {
        result.arguments = result.argumentsForm.reduce((arr, cur) => Object.assign(arr, { [cur.key]: cur.value }), {})
      }
      if (result.description === '') delete result.description
      if (result.template_id === '') delete result.template_id
      if (result.tag_name === '') delete result.tag_name
      if (result.parent_id === '') {
        delete result.parent_id
        delete result.is_inheritance_member
      }
      delete result.argumentsForm
      return result
    },
    clearTemplate() {
      this.form.template_id = ''
      this.form.tag_name = ''
      this.form.argumentsForm = []
    },
    async refreshTemplate() {
      await refreshRancherCatalogs()
        .then(() => {
          // console.log(res)
        })
        .catch((err) => {
          console.error(err)
        })
    },
    checkDueDate(startDate) {
      if (new Date(startDate).getTime() >= new Date(this.form.due_date)) this.form.due_date = ''
    }
  }
}
</script>
