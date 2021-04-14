<template>
  <el-card v-loading="isLoading" :element-loading-text="$t('Loading')">
    <div slot="header" class="d-flex justify-space-between align-center">
      <div>
        <el-row type="flex" align="middle">
          <span class="text-h5 mr-3">{{ $t('Issue.Issue') }} #{{ issueId }}</span>
          <el-link :href="issue_link" target="_blank" type="primary" :underline="false">
            <i class="el-icon-link" /> Redmine
          </el-link>
        </el-row>
        <div class="text-body-1">
          {{ $t('Issue.AddBy', { user: author }) }}
        </div>
      </div>
      <div>
        <el-button size="medium" type="danger" plain @click="handleDelete">{{ $t('general.Delete') }}</el-button>
        <el-button size="medium" type="info" plain @click="handleCancel">{{ $t('general.Cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="handleSave">{{ $t('general.Save') }}</el-button>
      </div>
    </div>
    <el-row :gutter="20">
      <el-col :span="24" :md="12">
        <issue-form ref="IssueForm" :issue-id="issueId" :form.sync="form" @isLoading="showLoading" />
      </el-col>
      <el-col :span="24" :md="12">
        <el-row :gutter="10">
          <el-col :span="24" class="mb-2">
            <issue-notes ref="IssueNotes" />
          </el-col>
          <el-col :span="24">
            <issue-file-uploader ref="IssueFileUploader" />
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssue, updateIssue, deleteIssue } from '@/api/issue'
import { IssueForm, IssueNotes, IssueFileUploader } from './components'

const getFormTemplate = () => ({
  project_id: 0,
  assigned_to_id: -1,
  subject: '',
  fixed_version_id: '',
  tracker_id: -1,
  status_id: 7,
  priority_id: 3,
  estimated_hours: 0,
  done_ratio: 0,
  start_date: '',
  due_date: '',
  description: ''
})

export default {
  name: 'ProjectIssueDetail',
  components: {
    IssueForm,
    IssueNotes,
    IssueFileUploader
  },
  data() {
    return {
      isLoading: false,
      issue_link: '',
      issueId: 0,
      author: '',
      form: getFormTemplate()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  mounted() {
    this.issueId = parseInt(this.$route.params.issueId)
    this.fetchIssue()
  },
  methods: {
    fetchIssue() {
      this.isLoading = true
      getIssue(this.issueId)
        .then(res => {
          this.initIssueDetails(res.data)
        })
        .catch(() => {
          this.$router.push({ name: 'issue-list' })
          this.$message({
            message: '議題已被刪除或找不到該議題',
            type: 'warning'
          })
        })
        .then(() => {
          this.isLoading = false
        })
    },
    initIssueDetails(data) {
      const {
        assigned_to,
        fixed_version,
        subject,
        tracker,
        status,
        priority,
        estimated_hours,
        done_ratio,
        start_date,
        due_date,
        description,
        issue_link,
        author
      } = data
      this.issue_link = issue_link
      this.author = author.name

      this.form.project_id = this.selectedProjectId
      this.form.assigned_to_id = assigned_to ? assigned_to.id : ''
      this.form.subject = subject
      this.form.fixed_version_id = fixed_version ? fixed_version.id : ''
      this.form.tracker_id = tracker.id
      this.form.status_id = status.id
      this.form.priority_id = priority.id
      this.form.estimated_hours = estimated_hours
      this.form.done_ratio = done_ratio
      this.form.start_date = start_date === null ? '' : start_date
      this.form.due_date = due_date === null ? '' : due_date
      this.form.description = description === null ? '' : description
    },
    handleDelete() {
      this.$confirm(this.$t('Issue.DeleteIssue', { issueName: this.form.subject }), this.$t('general.Delete'), {
        confirmButtonText: this.$t('general.Delete'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }).then(async () => {
        this.isLoading = true
        await deleteIssue(this.issueId)
          .then(() => {
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Deleted'),
              type: 'success'
            })
            this.$router.push({ name: 'issue-list' })
          })
          .catch(err => {
            this.$message({
              title: this.$t('general.Error'),
              message: err,
              type: 'error'
            })
          })
        this.isLoading = false
      })
    },
    handleCancel() {
      this.fetchIssue()
      this.$refs.IssueNotes.$refs.mdEditor.invoke('reset')
      this.$refs.IssueFileUploader.$refs.fileUploader.clearFiles()
      this.$refs.IssueFileUploader.uploadFileList = []
    },
    showLoading(status) {
      this.isLoading = status
    },
    handleSave() {
      this.$refs.IssueForm.$refs.form.validate(valid => {
        if (valid) this.editIssue()
      })
    },
    editIssue() {
      const sendData = Object.assign({}, this.form)
      const notes = this.$refs.IssueNotes.$refs.mdEditor.invoke('getMarkdown')
      if (notes !== '') sendData['notes'] = notes
      // Object.keys(sendData).map(item => {
      //   if (sendData[item] === '' || !sendData[item]) delete sendData[item]
      // })
      const sendForm = new FormData()
      Object.keys(sendData).forEach(objKey => {
        sendForm.append(objKey, sendData[objKey])
      })
      const uploadFileList = this.$refs.IssueFileUploader.uploadFileList
      uploadFileList.length > 0 ? this.uploadFiles(sendForm, uploadFileList) : this.updateIssueForm(sendForm)
    },
    uploadFiles(sendForm, fileList) {
      this.isLoading = true
      // use one by one edit issue to upload file
      const { issueId } = this
      fileList
        .reduce(function(prev, curr) {
          return prev.then(() => {
            sendForm.delete('upload_file')
            sendForm.append('upload_file', curr.raw, curr.raw.name)
            return updateIssue(issueId, sendForm)
          })
        }, Promise.resolve([]))
        .then(() => {
          this.handleCancel()
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
        })
        .catch(err => console.error(err))
        .then(() => {
          this.isLoading = false
        })
    },
    updateIssueForm(sendForm) {
      this.isLoading = true
      const { issueId } = this
      updateIssue(issueId, sendForm)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.handleCancel()
        })
        .catch(err => console.error(err))
        .then(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
