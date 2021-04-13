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
        <el-button size="medium" type="primary" disabled @click="handleSave">{{ $t('general.Save') }}</el-button>
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
            <file-uploader ref="FileUploader" />
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { getIssue, updateIssue, deleteIssue } from '@/api/issue'
import { IssueForm, IssueNotes, FileUploader } from './components'

const getFormTemplate = () => ({
  project_id: -1,
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
    FileUploader
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
      this.$confirm(`Are you sure to Delete Issue?`, this.$t('general.Delete'), {
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
      this.$refs.FileUploader.$refs.fileUploader.clearFiles()
    },
    handleSave() {
      const notes = this.$refs.IssueNotes.$refs.mdEditor.invoke('getMarkdown')
      const files = this.$refs.FileUploader.uploadFileList
      this.isLoading = true
      const sendData = Object.assign({}, this.form)
      sendData['notes'] = notes
      // updateIssue(this.issueId, { notes })
      //   .then(() => this.fetchIssue())
      //   .catch(err => {
      //     this.$message({
      //       title: this.$t('general.Error'),
      //       message: err,
      //       type: 'error'
      //     })
      //   })
      setTimeout(() => {
        this.isLoading = false
      }, 5000)
    },
    showLoading(status) {
      this.isLoading = status
    },
    async handleSaveDetail() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          const data = JSON.parse(JSON.stringify(this.issueForm))
          // Object.keys(data).map(item => {
          //   if (data[item] === '' || !data[item]) delete data[item]
          // })
          const form = new FormData()
          Object.keys(data).forEach(objKey => {
            form.append(objKey, data[objKey])
          })
          const issueId = this.issueId
          if (this.uploadFileList && this.uploadFileList.length > 0) {
            // use one by one edit issue to upload file
            this.uploadFileList
              .reduce(function(prev, curr) {
                return prev.then(() => {
                  form.delete('upload_file')
                  form.append('upload_file', curr.raw, curr.raw.name)
                  return updateIssue(issueId, form)
                })
              }, Promise.resolve([]))
              .then(() => {
                this.$refs['upload'].clearFiles()
                this.$message({
                  title: this.$t('general.Success'),
                  message: this.$t('Notify.Updated'),
                  type: 'success'
                })
                this.$emit('updated')
              })
          } else {
            updateIssue(this.issueId, form).then(() => {
              this.$emit('updated')
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Updated'),
                type: 'success'
              })
            })
          }
        }
      })
    }
  }
}
</script>
