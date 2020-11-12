<template>
  <el-dialog
    title="Add Issue"
    :visible="dialogVisible"
    width="50%"
    top="5px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="issueForm" :model="issueForm" :rules="issueFormRules" class="custom-list">
      <el-row>
        <el-row v-if="parentid != 0">
          <el-col :span="12">
            <el-form-item>
              <div style="font-weight: bold">Parent issue : {{ parentname }}</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="12">
          <el-form-item label="Name" prop="subject">
            <el-input v-model="issueForm.subject" placeholder="please input name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Assignee" prop="assigned_to_id">
            <el-select v-model="issueForm.assigned_to_id" style="width: 100%" filterable>
              <el-option v-for="item in issueAssigneeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Version" prop="fixed_version_id">
            <el-select v-model="issueForm.fixed_version_id" style="width: 100%" filterable>
              <el-option v-for="item in issueVersionList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Type" prop="tracker_id">
            <el-select v-model="issueForm.tracker_id" style="width: 100%">
              <el-option v-for="item in issueTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Status" prop="status_id">
            <el-select v-model="issueForm.status_id" style="width: 100%">
              <el-option v-for="item in issueStatusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Priority" prop="priority_id">
            <el-select v-model="issueForm.priority_id" style="width: 100%">
              <el-option v-for="item in issuePriorityList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Estimate" prop="estimated_hours">
            <el-input-number v-model="issueForm.estimated_hours" label="please input hours" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Done Ratio" prop="done_ratio">
            <el-input-number
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
          <el-form-item label="Start" prop="start_date">
            <el-date-picker
              v-model="issueForm.start_date"
              type="date"
              placeholder="Select Date"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="End" prop="due_date">
            <el-date-picker
              v-model="issueForm.due_date"
              type="date"
              placeholder="Select Date"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Upload" prop="upload">
            <el-upload
              ref="upload"
              class="upload-file"
              drag
              action=""
              :auto-upload="false"
              :limit="1"
              :on-exceed="handleExceed"
              :on-change="handleChange"
            >
              <div class="el-upload__text">drap file here or <em>click upload</em></div>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Desc." prop="description">
            <el-input v-model="issueForm.description" type="textarea" placeholder="please input description" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button :loading="LoadingConfirm" type="primary" @click="handleSave">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getIssueStatus, getIssueTracker, getIssuePriority } from '@/api/issue'
import { getProjectUserList, getProjectVersion } from '@/api/projects'
import { fileextension } from '../../../utils/extension.js'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      default: false
    },
    parentname: {
      type: String,
      default: ''
    },
    parentid: {
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
        assigned_to_id: [{ required: true, message: 'Please select assigned', trigger: 'blur' }],
        start_date: [{ required: true, message: 'Please select start date', trigger: 'blur' }],
        due_date: [{ required: true, message: 'Please select due date', trigger: 'blur' }],
        done_ratio: [{ required: true, message: 'Please input done ratio', trigger: 'blur' }],
        estimated_hours: [{ required: true, message: 'Please input estimated hours', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }],
        fixed_version_id: [{ required: false }],
        description: [{ required: false }]
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
    this.extension = fileextension()
  },
  methods: {
    fetchData() {
      Promise.all([
        getIssueStatus(),
        getIssueTracker(),
        getIssuePriority(),
        getProjectUserList(this.projectId),
        getProjectVersion(this.projectId)
      ]).then((res) => {
        this.issueStatusList = res[0].data.map((item) => {
          return { label: item.name, value: item.id }
        })
        this.issueTypeList = res[1].data.map((item) => {
          return { label: item.name, value: item.id }
        })
        this.issuePriorityList = res[2].data.map((item) => {
          return { label: item.name, value: item.id }
        })
        this.issueAssigneeList = res[3].data.user_list.map((item) => {
          return { label: item.name, value: item.id }
        })
        this.issueVersionList = res[4].data.versions.map((item) => {
          return { label: item.name, value: item.id }
        })
      })
    },
    handleClose() {
      this.$emit('add-topic-visible', false)
    },
    handleSave() {
      this.$refs['issueForm'].validate(async(valid) => {
        if (valid) {
          const data = this.issueForm
          // const filetype = this.extension[this.uploadFileList[0].raw.type]
          const form = new FormData()
          form.append('project_id', this.projectId)
          data['parent_id'] = this.parentid
          Object.keys(data).forEach((objKey) => {
            if (objKey === 'fixed_version_id' && data['fixed_version_id'] === '') return false
            if (objKey === 'parent_id' && (data['parent_id'] === '' || data['parent_id'] === 0)) return false
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
      } else if (file.size / 1024 / 1024 > 5) {
        this.$message.warning(`This file cannot be uploaded because it exceeds the maximum allowed file size (5 MB)`)
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
