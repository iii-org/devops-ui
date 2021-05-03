<template>
  <el-tabs v-model="focusTab" v-loading="isLoading" :element-loading-text="$t('Loading')" type="border-card">
    <div class="d-flex justify-space-between mb-2">
      <div class="d-flex align-end">
        <span class="text-h5 mr-3">{{ $t('Issue.Issue') }} #{{ issueId }}<template v-if="mode==='view'"> - {{ issueSubject }}</template></span>
        <div class="text-body-1 mr-3">
          {{ $t('Issue.AddBy', { user: author, created_date: formatTime(created_date) }) }}
        </div>
        <el-link :href="issue_link" target="_blank" type="primary" :underline="false">
          <i class="el-icon-link" /> Redmine
        </el-link>
      </div>
      <div v-show="focusTab === 'editIssue'">
        <el-button size="medium" type="danger" plain @click="handleDelete">{{ $t('general.Delete') }}</el-button>
        <template v-if="mode==='edit'">
          <el-button size="medium" @click="handleCancel">{{ $t('general.Cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="handleSave">{{ $t('general.Save') }}</el-button>
        </template>
        <template v-else>
          <el-button size="medium" type="primary" @click="mode='edit'">{{ $t('general.Edit') }}</el-button>
        </template>
      </div>
    </div>
    <el-divider />
    <el-tab-pane :label="$t('Issue.EditIssue')" name="editIssue">
      <el-row :gutter="20">
        <el-col v-if="mode==='edit'" :span="24" :md="12">
          <issue-form ref="IssueForm" :issue-id="issueId" :form.sync="form" @isLoading="showLoading" />
        </el-col>
        <el-col v-else :span="24" :md="24">
          <issue-view-tag ref="IssueView" :issue-id="issueId" :form.sync="view" @isLoading="showLoading" />
        </el-col>
        <el-col :span="24" :md="12">
          <el-row :gutter="10" type="flex">
            <el-col :span="editorCheckMode" class="mb-3">
              <issue-notes-editor ref="IssueNotesEditor" :height="editorHeight" @change="onEditorChange" />
            </el-col>
            <el-col v-if="mode==='view'" :span="2">
              <el-button size="medium" type="primary" style="width:100%; height:100%;" @click="handleSaveComment">
                {{ $t('general.Save') }}
              </el-button>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <issue-file-uploader ref="IssueFileUploader" />
            </el-col>
            <el-col v-if="mode==='view'" :span="24" class="mb-3">
              <issue-notes-dialog :height="dialogHeight" :data="journals" />
            </el-col>
          </el-row>
        </el-col>
        <el-col v-if="mode==='view'" :span="24" :md="12">
          <issue-view ref="IssueView" :issue-id="issueId" :form.sync="view" @isLoading="showLoading" />
          <h2>Attachment</h2>
          <el-divider />
          <issue-files :issue-file.sync="files" />
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane :label="$t('Issue.Notes')" name="issueNotes">
      <issue-notes :issue-notes="journals" />
    </el-tab-pane>
    <el-tab-pane :label="$t('Issue.Files')" name="issueFiles">
      <issue-files :issue-file.sync="files" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssue, updateIssue, deleteIssue } from '@/api/issue'
import {
  IssueNotes,
  IssueFiles,
  IssueForm,
  IssueView,
  IssueViewTag,
  IssueNotesDialog,
  IssueNotesEditor,
  IssueFileUploader
} from './components'
import dayjs from 'dayjs'

export default {
  name: 'ProjectIssueDetail',
  components: {
    IssueNotes,
    IssueFiles,
    IssueForm,
    IssueView,
    IssueViewTag,
    IssueNotesDialog,
    IssueNotesEditor,
    IssueFileUploader
  },
  data() {
    return {
      mode: 'view',
      originForm: {},
      isLoading: false,
      issue_link: '',
      issueId: 0,
      issueSubject: '',
      author: '',
      created_date: '',
      view: {},
      form: {
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
      },
      focusTab: 'editIssue',
      files: [],
      journals: [],
      formObj: {},
      dialogHeight: '100%',
      editorHeight: '100px'
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.formObj = from
    })
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges()) {
      this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      })
        .then(() => {
          next()
        })
        .catch(() => {
          this.focusTab = 'editIssue'
          next(false)
        })
    } else {
      next()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    editorCheckMode() {
      return (this.mode === 'edit') ? 24 : 22
    },
    editorCheckModeHeight() {
      return (this.mode === 'edit') ? '350px' : '150px'
    }
  },
  watch: {
    mode(value) {
      if (value === 'view') {
        this.editorHeight = '100px'
      } else {
        this.editorHeight = '390px'
      }
    }
  },
  async mounted() {
    this.issueId = parseInt(this.$route.params.issueId)
    await this.fetchIssue()
    this.isLoading = false
  },
  methods: {
    async fetchIssue() {
      this.isLoading = true
      return getIssue(this.issueId)
        .then(res => {
          this.initIssueDetails(res.data)
        })
        .catch(() => {
          this.$router.push(this.formObj)
          this.$message({
            message: this.$t('Issue.RemovedIssue'),
            type: 'warning'
          })
          this.isLoading = false
        })
    },
    initIssueDetails(data) {
      const { issue_link, author, attachments, created_date, journals, subject } = data
      this.issue_link = issue_link
      this.issueSubject = subject
      this.author = author.name
      this.files = attachments
      this.created_date = created_date
      this.journals = journals.reverse()
      this.setFormData(data)
      this.view = data
    },
    setFormData(data) {
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
        description
      } = data
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
      this.originForm = Object.assign({}, this.form)
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
            this.$router.push(this.formObj)
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
    async handleUpdated() {
      await this.fetchIssue()
      this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('reset')
      this.$refs.IssueFileUploader.$refs.fileUploader.clearFiles()
      this.$refs.IssueFileUploader.uploadFileList = []
      this.isLoading = false
      this.$router.push(this.formObj)
    },
    handleCancel() {
      this.mode = 'view'
      this.$router.push(this.formObj)
    },
    showLoading(status) {
      this.isLoading = status
    },
    handleSave() {
      this.$refs.IssueForm.$refs.form.validate(valid => {
        if (valid) this.editIssue()
      })
    },
    handleSaveComment() {
      const sendData = Object.assign({}, this.form)
      console.log(this.form)
      const notes = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown')
      if (notes !== '') sendData['notes'] = notes
      const sendForm = new FormData()
      Object.keys(sendData).forEach(objKey => {
        sendForm.append(objKey, sendData[objKey])
      })
      const uploadFileList = this.$refs.IssueFileUploader.uploadFileList
      uploadFileList.length > 0 ? this.uploadFiles(sendForm, uploadFileList) : this.updateIssueForm(sendForm)
    },
    editIssue() {
      const sendData = Object.assign({}, this.form)
      const notes = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown')
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
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.handleUpdated()
        })
        .catch(err => {
          console.error(err)
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
          this.handleUpdated()
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
        })
    },
    hasUnsavedChanges() {
      const isNotesChanged = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown') !== ''
      const isFilesChanged = this.$refs.IssueFileUploader.uploadFileList.length > 0
      return this.isFormDataChanged() || isNotesChanged || isFilesChanged
    },
    isFormDataChanged() {
      let isChanged
      if (Object.keys(this.originForm).length === 0) return false
      for (const key in this.form) {
        if (this.originForm[key] !== this.form[key]) {
          isChanged = true
          break
        } else {
          isChanged = false
        }
      }
      return isChanged
    },
    onEditorChange() {
      if (this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown')) {
        this.editorHeight = this.editorCheckModeHeight
        // this.dialogHeight = '200px'
      } else {
        if (this.mode === 'view') {
          this.editorHeight = '100px'
        } else {
          this.editorHeight = '350px'
        }
      }
    },
    formatTime(value) {
      return dayjs(value).fromNow()
    }
  }
}
</script>
