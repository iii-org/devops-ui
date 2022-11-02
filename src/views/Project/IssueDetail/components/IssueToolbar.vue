<template>
  <div class="mb-5">
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
          <el-popover
            class="mr-1"
            placement="bottom"
            trigger="hover"
            :open-delay="300"
            :close-delay="50"
          >
            <div class="flex justify-center">
              <el-button
                class="mr-2"
                icon="el-icon-edit"
                size="mini"
                @click="toggleRelationDialog()"
              >
                {{ $t('general.Settings', { name: $t('Issue.ChildrenIssue') }) }}
              </el-button>
              <el-button
                icon="el-icon-plus"
                size="mini"
                @click="addTopicDialogVisible = true"
              >
                {{ $t('Issue.AddSubIssue') }}
              </el-button>
            </div>
            <el-link
              slot="reference"
              class="linkTextColor ml-3"
              :underline="false"
              :disabled="isButtonDisabled"
            >
              <em class="el-icon-plus" />
              {{ $t('Issue.AddSubIssue') }}
            </el-link>
          </el-popover>
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
      :visible.sync="addTopicDialogVisible"
      width="50%"
      top="5px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <template slot="title">
        {{ $t('Issue.AddIssue') }}
        <el-button
          class="buttonPrimary float-right mr-5"
          @click="handleAdvancedImport"
        >
          {{ $t('Issue.ImportParentIssueData') }}
        </el-button>
      </template>
      <AddIssue
        ref="AddIssue"
        :save-data="saveIssue"
        :dialog-visible.sync="addTopicDialogVisible"
        :project-id="projectId || selectedProjectId"
        :parent-id="issueId"
        :parent-name="issueName"
        :prefill="form"
        @loading="loadingUpdate($event, false)"
        @add-topic-visible="emitAddTopicDialogVisible"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          id="dialog-btn-cancel"
          class="buttonSecondaryReverse"
          @click="handleAdvancedClose"
        >
          {{ $t('general.Cancel') }}
        </el-button>
        <el-button
          id="dialog-btn-confirm"
          :loading="isLoading"
          class="buttonPrimary"
          @click="handleAdvancedSave"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="relationDialogVisible"
      :close-on-click-modal="false"
      width="80%"
      :show-close="false"
      append-to-body
    >
      <div slot="title">
        <el-row slot="title" type="flex" align="middle">
          <el-col :xs="24" :md="16">
            <el-button
              type="text"
              size="medium"
              icon="el-icon-arrow-left"
              class="previous text-title linkTextColor"
              @click="toggleRelationDialog()"
            >
              {{ $t('general.Back') }}
            </el-button>
            <span class="text-title">
              {{ $t('general.Settings', { name: $t('Issue.ChildrenIssue') }) }}
            </span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button class="buttonPrimary" @click="onSaveCheckRelationIssue">
              {{ $t('general.Save') }}
            </el-button>
          </el-col>
        </el-row>
      </div>
      <SettingRelationIssue
        v-if="relationDialogVisible"
        ref="settingRelationIssue"
        :row.sync="row"
        target="Children"
      />
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
        :placeholder="$t('RuleMsg.PleaseInput') + $t('Excalidraw.Name')"
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
import IssueFileUploader from './IssueFileUploader'
import SettingRelationIssue from '@/views/Project/IssueList/components/SettingRelationIssue'
import { addIssue, updateIssue } from '@/api/issue'
import { createExcalidraw } from '@/api_v2/excalidraw'
import AddIssue from '@/components/Issue/AddIssue'
import { mapGetters } from 'vuex'

export default {
  name: 'IssueToolbar',
  components: {
    AddIssue,
    IssueFileUploader,
    SettingRelationIssue
  },
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
    row: {
      type: Object,
      default: () => ({})
    },
    isButtonDisabled: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      isLoading: false,
      uploadDialogVisible: false,
      addTopicDialogVisible: false,
      relationDialogVisible: false,
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
    async saveIssue(data) {
      await addIssue(data)
        .then((res) => {
          // this.$message({
          //   title: this.$t('general.Success'),
          //   message: this.$t('Notify.Added'),
          //   type: 'success'
          // })
          // this.addTopicDialogVisible = false
          return res
        })
        .catch((error) => {
          return error
        })
        .finally(() => {
          this.$emit('updateFamilyData')
        })
    },
    handleCollectionDialog() {
      this.$emit('related-collection', 'relatedCollection')
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
    },
    handleClose() {
      this.form = {}
      this.$emit('close-dialog', false)
    },
    handleAdvancedImport() {
      this.form = this.row
      this.$refs['AddIssue'].handleImport()
    },
    handleAdvancedClose() {
      this.$refs['AddIssue'].handleClose()
    },
    handleAdvancedSave() {
      this.$refs['AddIssue'].handleSave()
    },
    toggleRelationDialog() {
      this.relationDialogVisible = !this.relationDialogVisible
    },
    toggleExcalidrawDialog() {
      this.excalidrawDialogVisible = !this.excalidrawDialogVisible
      this.excalidrawName = ''
    },
    onSaveCheckRelationIssue() {
      this.$refs.settingRelationIssue.$refs.issueForm.validate((valid) => {
        if (valid) {
          this.onSaveRelationIssue()
        }
      })
    },
    getFormData(data) {
      const formData = new FormData()
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item])
      })
      return formData
    },
    async onSaveRelationIssue() {
      try {
        const getSettingRelationIssue = this.$refs['settingRelationIssue']
        const updateApi = []
        const appendFormData = this.getFormData({ parent_id: getSettingRelationIssue.row.id })
        const removeFormData = this.getFormData({ parent_id: '' })
        getSettingRelationIssue.children['append'].forEach((item) => {
          updateApi.push(updateIssue(item, appendFormData))
        })
        getSettingRelationIssue.children['remove'].forEach((item) => {
          updateApi.push(updateIssue(item, removeFormData))
        })
        await Promise.all(updateApi)
        this.toggleRelationDialog()
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.$emit('updateFamilyData')
      } catch (e) {
        console.error(e)
      }
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
