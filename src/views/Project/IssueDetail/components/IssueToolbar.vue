<template>
  <div class="mb-1">
    <div class="flex justify-between items-center">
      <div>
        <template v-if="issueId">
          <el-link
            class="linkTextColor"
            :underline="false"
            :disabled="isButtonDisabled"
            @click="uploadDialogVisible = true"
          >
            <em class="el-icon-upload" />
            {{ $t('Issue.UploadFiles') }}
          </el-link>
          <el-link
            slot="reference"
            class="linkTextColor ml-3"
            :underline="false"
            :disabled="isButtonDisabled"
            @click="$emit('add-sub-issue')"
          >
            <em class="el-icon-plus" />
            {{ $t('Issue.AddSubIssue') }}
          </el-link>
        </template>
        <el-link
          v-if="isExcalidrawEnable"
          class="linkTextColor ml-3"
          :underline="false"
          :disabled="isButtonDisabled"
          @click="toggleExcalidrawDialog"
        >
          <em class="el-icon-data-board" />
          {{ $t('Excalidraw.CreateBoard') }}
        </el-link>
        <el-link
          v-if="issueTracker==='Test Plan'"
          class="linkTextColor ml-3"
          :underline="false"
          :disabled="isButtonDisabled"
          @click="handleCollectionDialog"
        >
          <em class="el-icon-upload" />
          管理測試檔案
        </el-link>
      </div>
      <div class="text-right">
        <el-link
          v-if="issueId"
          :href="issueLink"
          target="_blank"
          class="linkTextColor"
          :underline="false"
        >
          <em class="el-icon-link" />
          Redmine
        </el-link>
        <el-tooltip
          v-if="!isFromBoard"
          :content="$t('Issue.IssueSetting')"
          placement="bottom"
          class="ml-3 is-panel"
        >
          <div
            class="handle-button p-3"
            :style="{
              'background-color':'#85c1e9',
              'display': 'inline',
            }"
            @click="$emit('changeIssueFormOpened')"
          >
            <em :class="isIssueFormOpened ? 'el-icon-d-arrow-right' : 'el-icon-setting'" />
          </div>
        </el-tooltip>
      </div>
    </div>

    <el-dialog
      :visible.sync="uploadDialogVisible"
      :title="$t('Issue.UploadFiles')"
      top="3vh"
      append-to-body
    >
      <IssueFileUploader
        ref="IssueFileUploader"
        :issue-id="issueId"
      />
      <div class="flex justify-between mt-2">
        <div
          class="text-xs"
          style="line-height: 40px;"
        >
          *{{ $t('File.UploadWarning') }}: {{ specialSymbols }}
        </div>
        <div>
          <el-button
            class="buttonPrimary"
            @click="handleUploadClose"
          >{{ $t('general.Save') }}</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="excalidrawDialogVisible"
      :title="$t('Excalidraw.CreateBoard')"
      top="3vh"
      width="30%"
      destroy-on-close
      append-to-body
    >
      <el-input
        v-model="excalidrawName"
        v-loading="isLoading"
        :placeholder="`${$t('RuleMsg.PleaseInput')} ${$t('Excalidraw.Name')}`"
      />
      <span slot="footer" class="dialog-footer">
        <el-button
          class="buttonSecondaryReverse"
          :loading="isLoading"
          @click="toggleExcalidrawDialog"
        >
          {{ $t('general.Close') }}
        </el-button>
        <el-button
          type="primary"
          :loading="isLoading"
          :disabled="!excalidrawName"
          @click="handleCreateExcalidraw"
        >
          {{ $t('general.Add') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateIssue } from '@/api/issue'
import { createExcalidraw } from '@/api_v2/excalidraw'
import IssueFileUploader from './IssueFileUploader'

export default {
  name: 'IssueToolbar',
  components: { IssueFileUploader },
  props: {
    issueLink: {
      type: String,
      default: null
    },
    issueId: {
      type: [String, Number],
      default: null
    },
    // issueName: {
    //   type: [String, Number],
    //   default: null
    // },
    issueTracker: {
      type: String,
      default: null
    },
    // row: {
    //   type: Object,
    //   default: () => ({})
    // },
    isButtonDisabled: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      default: null
    },
    isFromBoard: {
      type: Boolean,
      default: false
    },
    isIssueFormOpened: {
      type: Boolean,
      default: false
    }
    // isAddSubIssue: {
    //   type: Boolean,
    //   default: false
    // }
  },
  data() {
    return {
      isLoading: false,
      uploadDialogVisible: false,
      excalidrawDialogVisible: false,
      excalidrawName: '',
      specialSymbols: '\ / : * ? " < > | # { } % ~ &',
      form: {}
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'isExcalidrawEnable'])
  },
  methods: {
    async handleUploadClose() {
      const sendForm = new FormData()
      const uploadFileList = this.$refs.IssueFileUploader.uploadFileList
      if (uploadFileList.length > 0) {
        await this.uploadFiles(sendForm, uploadFileList)
      }
      this.$refs.IssueFileUploader.$refs.fileUploader.clearFiles()
      this.$refs.IssueFileUploader.uploadFileList = []
      this.uploadDialogVisible = false
    },
    async uploadFiles(sendForm, fileList) {
      // use one by one edit issue to upload file
      const { issueId } = this
      try {
        fileList.forEach((item) => {
          sendForm.append('upload_files', item.raw)
        })
        await updateIssue(issueId, sendForm)
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
    handleCollectionDialog() {
      this.$emit('related-collection', 'relatedCollection')
    },
    toggleExcalidrawDialog() {
      this.excalidrawDialogVisible = !this.excalidrawDialogVisible
      this.excalidrawName = ''
    },
    async handleCreateExcalidraw() {
      this.isLoading = true
      try {
        const sendData = new FormData()
        sendData.append('project_id', this.projectId)
        sendData.append('issue_ids', this.issueId)
        sendData.append('name', this.excalidrawName.trim())
        await createExcalidraw(sendData)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Added'),
          type: 'success'
        })
        this.$emit('updateWhiteBoard', this.excalidrawName.trim())
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoading = false
        this.toggleExcalidrawDialog()
      }
    },
    loadingUpdate(value, upload) {
      this.isLoading = value
      this.$emit('is-loading', { status: value, upload: upload })
    }
  }
}
</script>

<style lang="scss" scoped>
.handle-button {
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 50px;
  i {
  font-size: 24px;
  line-height: 50px;
  }
}
</style>
