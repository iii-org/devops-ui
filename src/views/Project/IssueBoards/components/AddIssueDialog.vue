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
      <el-form-item :label="$t('Issue.Assignee')" prop="assigned_to_id">
        <el-select v-model="issueForm.assigned_to_id" style="width: 100%" clearable filterable>
          <el-option v-for="item in assigned_to" :key="item.login" :class="item.class" :label="item.name+' ('+item.login+')'" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
        <el-select v-model="issueForm.priority_id" style="width: 100%">
          <el-option v-for="item in issuePriorityList" :key="item.value" :label="$t('Issue.'+item.label)" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('general.Type')" prop="tracker_id">
        <el-select
          id="input-type"
          v-model="issueForm.tracker_id"
          style="width: 100%"
          :disabled="isDisabledField('tracker')"
        >
          <el-option v-for="item in tracker" :key="item.id" :label="$t('Issue.'+item.name)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('general.Status')" prop="status_id">
        <el-select v-model="issueForm.status_id" style="width: 100%" :disabled="isDisabledField('status')">
          <el-option v-for="item in status" :key="item.id" :label="$t('Issue.'+item.name)" :value="item.id" />
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

<script>
import { mapGetters } from 'vuex'
import { getIssueStatus, getIssueTracker, getIssuePriority } from '@/api/issue'
import { getProjectAssignable } from '@/api/projects'
import { addIssue } from '@/api/issue'

export default {
  props: {
    dimension: {
      type: String,
      default: null
    },
    dialogVisible: {
      type: Boolean,
      default: false
    },
    focusValue: {
      type: [Object, String],
      default: null
    },
    focusVersion: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      issueForm: {
        subject: '',
        priority_id: '',
        tracker_id: '',
        status_id: '',
        assigned_to_id: '',
        description: '',
        fixed_version_id: ''
      },
      issueFormRules: {
        subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        assigned_to_id: [{ required: this.focusValue.name === 'Assigned', message: 'Please select assignee', trigger: 'blur' }]
      },
      issuePriorityList: [],
      tracker: [],
      status: [],
      assigned_to: [],
      isLoading: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userId'])
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    },
    focusValue: {
      deep: true,
      handler(value) {
        if (this.dimension) {
          this.issueForm[this.dimension + '_id'] = value.id
        }
      }
    }
  },
  mounted() {
    this.fetchData()
    if (this.dimension) {
      this.issueForm[this.dimension + '_id'] = this.focusValue.id
    }
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
        this.tracker = res[1].data
        this.status = res[2].data
        this.assigned_to = [
          {
            name: this.$t('Issue.me'),
            login: 'me',
            id: this.userId,
            class: 'bg-yellow-100'
          },
          ...res[3].data.user_list]
      })
    },
    isDisabledField(value) {
      return value === this.dimension
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
          sendData.fixed_version_id = this.focusVersion
          for (const key in sendData) {
            if (sendData[key] === '') delete sendData[key]
          }
          sendData.project_id = this.selectedProjectId
          await addIssue(sendData)
            .then(() => {
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Added'),
                type: 'success'
              })
              this.$emit('update', sendData)
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
