<script>
import { mapGetters } from 'vuex'
import { getIssueStatus, getIssueTracker, getIssuePriority } from '@/api/issue'
import { getProjectAssignable } from '@/api/projects'
import { addIssue } from '@/api/issue'

export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    focusStatus: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    issueForm: {
      subject: '',
      priority_id: '',
      tracker_id: '',
      status_id: '',
      assigned_to_id: '',
      description: ''
    },
    issueFormRules: {
      subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
      priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }],
      tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
      status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }]
    },
    issuePriorityList: [],
    issueTypeList: [],
    issueStatusList: [],
    issueAssigneeList: [],
    isLoading: false
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    },
    issueStatusList(val) {
      if (val) {
        this.issueForm.status_id = this.issueStatusList.find(i => i.label === this.focusStatus).value
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      Promise.all([
        getIssuePriority(),
        getIssueTracker(),
        getIssueStatus(),
        getProjectAssignable(this.selectedProjectId)
      ]).then(res => {
        this.issuePriorityList = res[0].data.map(item => ({ label: item.name, value: item.id }))
        this.issueTypeList = res[1].data.map(item => ({ label: item.name, value: item.id }))
        this.issueStatusList = res[2].data.map(item => ({ label: item.name, value: item.id }))
        this.issueAssigneeList = res[3].data.user_list.map(item => ({
          label: item.login,
          value: item.id
        }))
      })
    },
    handleClose() {
      this.$emit('close')
      this.$refs.issueForm.resetFields()
    },
    async handleSave() {
      this.$refs.issueForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          const sendData = Object.assign({}, this.issueForm)
          for (const key in sendData) {
            if (sendData[key] === '') delete sendData[key]
          }
          sendData.project_id = this.projectSelectedId
          await addIssue(sendData)
            .then(_ => {
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Added'),
                type: 'success'
              })
              this.$emit('update')
            })
            .catch(err => {
              console.error(err)
            })
            .then(() => {
              this.handleClose()
              this.isLoading = false
            })
        }
      })
    }
  }
}
</script>

<template>
  <el-dialog
    :title="$t('Issue.AddIssue')"
    :visible.sync="dialogVisible"
    width="40%"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form ref="issueForm" :model="issueForm" :rules="issueFormRules" label-width="100px">
      <el-form-item :label="$t('general.Title')" prop="subject">
        <el-input id="input-name" v-model="issueForm.subject" :placeholder="$t('general.PleaseInput')" />
      </el-form-item>
      <el-form-item :label="$t('Issue.Assignee')" prop="assigned_to_id" :required="focusStatus === 'Assigned'">
        <el-select v-model="issueForm.assigned_to_id" style="width: 100%" clearable>
          <el-option v-for="item in issueAssigneeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
        <el-select v-model="issueForm.priority_id" style="width: 100%">
          <el-option v-for="item in issuePriorityList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('general.Type')" prop="tracker_id">
        <el-select id="input-type" v-model="issueForm.tracker_id" style="width: 100%">
          <el-option v-for="item in issueTypeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('general.Status')" prop="status_id">
        <el-select v-model="issueForm.status_id" style="width: 100%" disabled>
          <el-option v-for="item in issueStatusList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('general.Description')" prop="description">
        <el-input
          id="input-description"
          v-model="issueForm.description"
          type="textarea"
          :placeholder="$t('general.PleaseInput')"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button id="dialog-btn-cancel" @click="handleClose">{{ $t('general.Cancel') }}</el-button>
      <el-button id="dialog-btn-confirm" :loading="isLoading" type="primary" @click="handleSave">
        {{ $t('general.Confirm') }}
      </el-button>
    </span>
  </el-dialog>
</template>
