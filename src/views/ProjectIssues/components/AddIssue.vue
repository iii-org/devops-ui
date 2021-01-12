<template>
  <el-dialog
    :title="$t('Issue.AddIssue')"
    :visible="dialogVisible"
    width="50%"
    top="5px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="issueForm" :model="issueForm" :rules="issueFormRules" class="custom-list">
      <el-row>
        <el-row v-if="parentId != 0">
          <el-col :span="12">
            <el-form-item>
              <div style="font-weight: bold">Parent issue : {{ parentName }}</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-col :span="12">
          <el-form-item :label="$t('general.Name')" prop="subject">
            <el-input id="input-name" v-model="issueForm.subject" :placeholder="$t('general.PleaseInput')" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.Assignee')" prop="assigned_to_id">
            <el-select id="input-assignee" v-model="issueForm.assigned_to_id" style="width: 100%" filterable clearable>
              <el-option v-for="item in issueAssigneeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('Version.Version')" prop="fixed_version_id">
            <el-select id="input-version" v-model="issueForm.fixed_version_id" style="width: 100%" filterable clearable>
              <el-option
                v-for="item in issueVersionList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.status !== 'open'"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('general.Type')" prop="tracker_id">
            <el-select id="input-type" v-model="issueForm.tracker_id" style="width: 100%">
              <el-option v-for="item in issueTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('general.Status')" prop="status_id">
            <el-select id="input-status" v-model="issueForm.status_id" style="width: 100%">
              <el-option v-for="item in issueStatusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
            <el-select id="input-priority" v-model="issueForm.priority_id" style="width: 100%">
              <el-option v-for="item in issuePriorityList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('Issue.Estimate')" prop="estimated_hours">
            <el-input-number
              id="input-estimate"
              v-model="issueForm.estimated_hours"
              label="please input hours"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.DoneRatio')" prop="done_ratio">
            <el-input-number
              id="input-done-ratio"
              v-model="issueForm.done_ratio"
              label="please input numbers"
              :min="0"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('Issue.StartDate')" prop="start_date">
            <el-date-picker
              id="input-start-date"
              v-model="issueForm.start_date"
              type="date"
              :placeholder="$t('Issue.SelectDate')"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.EndDate')" prop="due_date">
            <el-date-picker
              id="input-end-date"
              v-model="issueForm.due_date"
              type="date"
              :placeholder="$t('Issue.SelectDate')"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('File.Upload')" prop="upload">
            <el-upload
              id="input-upload"
              ref="upload"
              class="upload-file2"
              drag
              action=""
              :auto-upload="false"
              :limit="1"
              :on-exceed="handleExceed"
              :on-change="handleChange"
            >
              <div class="uploadBtn el-button--primary">{{ $t('File.uploadBtn') }}</div>
              <div class="el-upload__text">{{ $t('File.DropFileHereOrClickUpload') }}</div>
            </el-upload>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('general.Description')" prop="description">
            <el-input
              id="input-description"
              v-model="issueForm.description"
              type="textarea"
              :placeholder="$t('general.PleaseInput')"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button id="dialog-btn-cancel" @click="handleClose">{{ $t('general.Cancel') }}</el-button>
      <el-button id="dialog-btn-confirm" :loading="LoadingConfirm" type="primary" @click="handleSave">{{ $t('general.Confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIssueStatus, getIssueTracker, getIssuePriority } from '@/api/issue'
import { getProjectUserList, getProjectVersion } from '@/api/projects'
import { fileExtension } from '../../../utils/extension.js'
export default {
  name: 'AddIssue',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      default: 0
    },
    parentName: {
      type: String,
      default: ''
    },
    parentId: {
      type: Number,
      default: 0
    },
    saveData: Function
  },

  data() {
    return {
      issueStatusList: [],
      issueTypeList: [],
      issuePriorityList: [],
      issueAssigneeList: [],
      issueVersionList: [],
      issueForm: {
        subject: '',
        description: '',
        priority_id: '',
        tracker_id: '',
        status_id: '',
        fixed_version_id: '',
        assigned_to_id: '',
        start_date: '',
        due_date: '',
        done_ratio: '',
        estimated_hours: '',
        parent_id: ''
      },
      issueFormRules: {
        subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
      },
      LoadingConfirm: false,
      uploadFileList: [],
      extension: {}
    }
  },

  watch: {
    projectId() {
      this.fetchData()
    },
    dialogVisible() {
      this.LoadingConfirm = false
      if (this.dialogVisible === true) {
        this.uploadFileList = []
        this.$nextTick(() => {
          this.$refs['upload'].clearFiles()
          this.$refs['issueForm'].resetFields()
        })
      }
    }
  },

  mounted() {
    this.fetchData()
    this.extension = fileExtension()
  },

  methods: {
    fetchData() {
      Promise.all([
        getIssueStatus(),
        getIssueTracker(),
        getIssuePriority(),
        getProjectUserList(this.projectId),
        getProjectVersion(this.projectId)
      ]).then(res => {
        this.issueStatusList = res[0].data.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issueTypeList = res[1].data.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issuePriorityList = res[2].data.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issueAssigneeList = res[3].data.user_list.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issueVersionList = res[4].data.versions.map(item => {
          return { label: item.name, value: item.id, status: item.status }
        })
      })
    },
    handleClose() {
      this.$emit('add-topic-visible', false)
    },
    handleSave() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          // deep copy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.issueForm))
          Object.keys(data).map(item => {
            if (data[item] === '') delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.projectId)
          if (this.parentId) form.append('parent_id', this.parentId)
          Object.keys(data).forEach(objKey => {
            form.append(objKey, data[objKey])
          })
          if (this.uploadFileList.length > 0) {
            form.append('upload_file', this.uploadFileList[0].raw, this.uploadFileList[0].raw.name)
          }
          this.LoadingConfirm = true
          await this.saveData(form)
          this.LoadingConfirm = false
        } else {
          return false
        }
      })
    },
    handleExceed(files, fileList) {
      this.$message.warning(`Only one file can be added at a time, please delete the existing file first`)
    },
    async handleChange(file, fileList) {
      if (this.extension[file.raw.type] === undefined) {
        this.$message.warning(`Unable to upload a file: This file type is not supported`)
        this.$refs['upload'].clearFiles()
      } else if (file.size / 1024 > 20480) {
        this.$message.warning(`This file cannot be uploaded because it exceeds the maximum allowed file size (20 MB)`)
        this.$refs['upload'].clearFiles()
      } else {
        this.uploadFileList = fileList
      }
    }
  }
}
</script>

<style lang="scss">
.el-upload-dragger {
  height: 50px;
}
.el-upload__text {
  margin-top: 18px;
}
</style>
