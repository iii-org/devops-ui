<template>
  <el-row type="flex" justify="space-between" align="middle" class="mb-5">
    <el-col>
      <el-button size="small" icon="el-icon-upload" type="success" @click="uploadDialogVisible=true">{{ $t('Issue.UploadFiles') }}</el-button>
      <el-button size="small" icon="el-icon-plus" type="warning" @click="addTopicDialogVisible=true">{{ $t('Issue.AddSubIssue') }}</el-button>
    </el-col>
    <el-col class="text-right">
      <el-link :href="issueLink" target="_blank" type="primary" :underline="false">
        <i class="el-icon-link" /> Redmine
      </el-link>
    </el-col>
    <el-dialog :visible.sync="uploadDialogVisible" :title="$t('Issue.UploadFiles')" top="3vh" @close="handleUploadClose">
      <issue-file-uploader ref="IssueFileUploader" class="mb-2" :issue-id="issueId" />
      <div class="mt-2 text-right">
        <el-button type="primary" @click="handleUploadClose">{{ $t('general.Save') }}</el-button>
      </div>
    </el-dialog>
    <add-issue
      :save-data="saveIssue"
      :dialog-visible.sync="addTopicDialogVisible"
      :project-id="selectedProjectId"
      :parent-id="issueId"
      :parent-name="issueName"
      @add-topic-visible="emitAddTopicDialogVisible"
    />
  </el-row>
</template>

<script>
import IssueFileUploader from '@/views/Project/IssueDetail/components/IssueFileUploader'
import { addIssue, updateIssue } from '@/api/issue'
import AddIssue from '@/views/Project/IssueList/components/AddIssue'
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
    }
  },
  data() {
    return {
      uploadDialogVisible: false,
      addTopicDialogVisible: false
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
          this.$emit('update-issue')
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
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
    }
  }
}
</script>

<style scoped>

</style>
