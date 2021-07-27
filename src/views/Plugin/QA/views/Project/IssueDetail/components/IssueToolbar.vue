<template>
  <el-row type="flex" justify="space-between" align="middle" class="mb-5">
    <el-col>
      <template v-if="issueId">
        <el-button size="small" icon="el-icon-upload" :type="isButtonDisabled ? 'info' : 'success'" :disabled="isButtonDisabled" @click="uploadDialogVisible = true">{{ $t('Issue.UploadFiles') }}</el-button>
        <el-button size="small" icon="el-icon-plus" :type="isButtonDisabled ? 'info' : 'warning'" :disabled="isButtonDisabled" @click="addTopicDialogVisible = true">{{ $t('Issue.AddSubIssue') }}</el-button>
      </template>
      <el-button v-if="issueTracker==='Test Plan'" size="small" type="primary" icon="el-icon-upload" @click="handleCollectionDialog">管理測試檔案</el-button>
    </el-col>
    <el-col v-if="issueId" class="text-right">
      <el-link :href="issueLink" target="_blank" type="primary" :underline="false">
        <i class="el-icon-link" /> Redmine
      </el-link>
    </el-col>
    <el-dialog
      :visible.sync="uploadDialogVisible"
      :title="$t('Issue.UploadFiles')"
      top="3vh"
      append-to-body
      @close="handleUploadClose"
    >
      <issue-file-uploader ref="IssueFileUploader" class="mb-2" :issue-id="issueId" />
      <div class="mt-2 flex justify-between">
        <div class="text-xs" style="line-height: 40px;">
          *{{ $t('File.UploadWarning') }}: {{ specialSymbols }}
        </div>
        <div>
          <el-button type="primary" @click="handleUploadClose">{{ $t('general.Save') }}</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('Issue.AddIssue')"
      :visible.sync="addTopicDialogVisible"
      width="50%"
      top="5px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <add-issue
        ref="AddIssue"
        :save-data="saveIssue"
        :dialog-visible.sync="addTopicDialogVisible"
        :project-id="selectedProjectId"
        :parent-id="issueId"
        :parent-name="issueName"
        @loading="loadingUpdate"
        @add-topic-visible="emitAddTopicDialogVisible"
      />
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" @click="handleAdvancedClose">{{ $t('general.Cancel') }}</el-button>
        <el-button id="dialog-btn-confirm" :loading="isLoading" type="primary"
                   @click="handleAdvancedSave"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import IssueFileUploader from './IssueFileUploader'
import { addIssue, updateIssue } from '@/api/issue'
import AddIssue from '../../IssueList/components/AddIssue'
import { mapGetters } from 'vuex'

export default {
  name: 'IssueToolbar',
  components: { AddIssue, IssueFileUploader },
  props: {
    issueLink: {
      type: String,
      default: null
    },
    issueId: {
      type: [String, Number],
      default: null
    },
    issueName: {
      type: [String, Number],
      default: null
    },
    issueTracker: {
      type: String,
      default: null
    },
    isButtonDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,
      uploadDialogVisible: false,
      addTopicDialogVisible: false,
      specialSymbols: '\ / : * ? " < > | # { } % ~ &'
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  methods: {
    handleUploadClose() {
      const sendForm = new FormData()
      const uploadFileList = this.$refs.IssueFileUploader.uploadFileList
      uploadFileList.length > 0 ? this.uploadFiles(sendForm, uploadFileList) : null
      this.$refs.IssueFileUploader.$refs.fileUploader.clearFiles()
      this.$refs.IssueFileUploader.uploadFileList = []
      this.uploadDialogVisible = false
    },
    uploadFiles(sendForm, fileList) {
      this.isLoading = true
      // use one by one edit issue to upload file
      const { issueId } = this
      fileList
        .reduce((prev, curr) => {
          return prev.then(() => {
            sendForm.delete('upload_file')
            sendForm.delete('upload_content_type')
            sendForm.append('upload_content_type', curr.raw.type)
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
          this.$emit('is-loading', this.isLoading)
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
        })
    },
    async saveIssue(data) {
      return await addIssue(data)
        .then(res => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.loadData()
          this.addTopicDialogVisible = false
          return res
        })
        .catch(error => {
          return error
        })
      // this.addTopicDialogVisible = false
    },
    handleCollectionDialog() {
      this.$emit('related-collection', 'relatedCollection')
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
    },
    handleClose() {
      this.$emit('close-dialog', false)
    },
    handleAdvancedClose() {
      this.$refs['AddIssue'].handleClose()
    },
    handleAdvancedSave() {
      this.$refs['AddIssue'].handleSave()
    },
    loadingUpdate(value) {
      this.isLoading = value
      this.$emit('is-loading', value)
    }
  }
}
</script>

<style scoped></style>
