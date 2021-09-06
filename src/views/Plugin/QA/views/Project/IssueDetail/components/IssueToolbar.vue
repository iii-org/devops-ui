<template>
  <div class="mb-5">
    <div class="flex justify-between items-center">
      <div>
        <template v-if="issueId">
          <el-button size="small" icon="el-icon-upload" :type="isButtonDisabled ? 'info' : 'success'" :disabled="isButtonDisabled" @click="uploadDialogVisible = true">{{ $t('Issue.UploadFiles') }}</el-button>
          <el-button size="small" icon="el-icon-plus" :type="isButtonDisabled ? 'info' : 'warning'" :disabled="isButtonDisabled" @click="addTopicDialogVisible = true">{{ $t('Issue.AddSubIssue') }}</el-button>
        </template>
        <el-button v-if="issueTracker==='Test Plan'" size="small" type="primary" icon="el-icon-upload" :disabled="isButtonDisabled" @click="handleCollectionDialog">管理測試檔案</el-button>
      </div>
      <div class="text-right">
        <el-link v-if="issueId" :href="issueLink" target="_blank" type="primary" :underline="false">
          <i class="el-icon-link" /> Redmine
        </el-link>
      </div>
    </div>

    <el-dialog
      :visible.sync="uploadDialogVisible"
      :title="$t('Issue.UploadFiles')"
      top="3vh"
      append-to-body
    >
      <issue-file-uploader ref="IssueFileUploader" :issue-id="issueId" />
      <div class="flex justify-between mt-2">
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
        @loading="loadingUpdate($event.value, false)"
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
  </div>
</template>

<script>
import IssueFileUploader from './IssueFileUploader'
import { addIssue, updateIssue } from '@/api/issue'
import AddIssue from '@/components/Issue/AddIssue'
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
    async uploadFiles(sendForm, fileList) {
      this.loadingUpdate(true, true)
      // use one by one edit issue to upload file
      const { issueId } = this
      // use one by one edit issue to upload file
      try {
        const uploadApi = fileList.map(function(item) {
          const sendForm = new FormData()
          sendForm.delete('upload_file')
          sendForm.delete('upload_content_type')
          sendForm.append('upload_content_type', item.raw.type)
          sendForm.append('upload_file', item.raw, item.raw.name)
          return updateIssue(issueId, sendForm)
        })
        await Promise.all(uploadApi)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      } catch (err) {
        console.error(err)
        this.$message({
          title: this.$t('general.Error'),
          message: err.message,
          type: 'error'
        })
      }
      this.loadingUpdate(false, true)
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
    loadingUpdate(value, upload) {
      this.isLoading = value
      this.$emit('is-loading', { status: value, upload: upload })
    }
  }
}
</script>
