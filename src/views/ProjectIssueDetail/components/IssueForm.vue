<script>
import { getProjectAssignable, getProjectVersion, getProjectIssueList, getProjectIssueListByTree } from '@/api/projects'
import { getIssueStatus, getIssueTracker, getIssuePriority, updateIssue } from '@/api/issue'
import { fileExtension } from '@/utils/extension'
import { Message } from 'element-ui'

export default {
  name: 'IssueForm',
  props: {
    issueId: {
      type: Number,
      default: 0
    },
    projectId: {
      type: Number,
      default: 0
    },
    parentId: {
      type: Number,
      default: null
    },
    author: {
      type: String,
      default: ''
    },
    issueFormRef: {
      type: Object,
      default: () => {}
    }
  },

  data: () => ({
    issueDescription: '',
    isLoading: true,

    issueForm: {
      subject: '',
      assigned_to_id: '',
      fixed_version_id: '',
      tracker_id: '',
      status_id: '',
      priority_id: '',
      estimated_hours: '',
      done_ratio: 0,
      start_date: '',
      due_date: '',
      description: ''
    },

    issueFormRules: {
      subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
      tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
      status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
      priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
    },

    issueAssigneeList: [],
    issueTypeList: [],
    issueStatusList: [],
    issuePriorityList: [],
    issueVersionList: [],

    parentIssue: {},
    relativeIssueList: [],
    childrenIssueList: []
  }),

  computed: {
    dynamicIssueStatusList() {
      const listWithoutClosedOption = this.issueStatusList.filter(item => item.label !== 'Closed')
      return this.isChildrenAllClosed() ? this.issueStatusList : listWithoutClosedOption
    },

    isParentIssueClosed() {
      return this.parentIssue !== {} && this.parentIssue.issue_status === 'Closed'
    }
  },

  mounted() {
    this.extension = fileExtension()
    this.fetchData()
    this.issueForm = Object.assign({}, this.issueFormRef)
  },

  methods: {
    fetchData() {
      this.isLoading = true
      Promise.all([
        getProjectAssignable(this.projectId),
        getProjectVersion(this.projectId),
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority(),
        getProjectIssueList(this.projectId),
        getProjectIssueListByTree(this.projectId)
      ]).then(res => {
        const [assigneeList, versionList, typeList, statusList, priorityList, issueList, issueListByTree] = res.map(
          item => item.data
        )
        this.issueAssigneeList = assigneeList.user_list.map(item => {
          return { label: item.login, value: item.id }
        })
        this.issueVersionList = versionList.versions.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issueTypeList = typeList.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issueStatusList = statusList.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issuePriorityList = priorityList.map(item => {
          return { label: item.name, value: item.id }
        })
        this.parentIssue = issueList.find(item => item.id === this.parentId) || {}
        this.relativeIssueList = this.createRelativeList(issueListByTree)
        this.updateChildrenList()
        this.isLoading = false
      })
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
          this.issueLoading = true
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
                this.issueLoading = false
                Message({
                  message: 'update successful',
                  type: 'success',
                  duration: 1 * 1000
                })
              })
          } else {
            await updateIssue(this.issueId, form)
            this.issueLoading = false
            Message({
              message: 'update successful',
              type: 'success',
              duration: 1 * 1000
            })
          }
          this.$emit('updated')
        } else {
          return false
        }
      })
    },

    isChildrenAllClosed() {
      return !this.childrenIssueList.length || this.childrenIssueList.every(item => item.issue_status === 'Closed')
    },

    createRelativeList(list) {
      const result = []
      function flatList(parent) {
        for (let i = 0; i < parent.length; i++) {
          result.push(parent[i])
          const children = parent[i].children
          if (parent[i].children.length) flatList(children)
        }
      }
      flatList(list)
      return result
    },

    updateChildrenList() {
      const idx = this.relativeIssueList.findIndex(item => item.id === this.issueId)
      this.childrenIssueList = this.relativeIssueList[idx].children
    }
  }
}
</script>

<template>
  <div>
    <div slot="header" class="clearfix">
      <span style="font-size: 25px; padding-bottom: 10px">{{ $t('Issue.Issue') }} #{{ issueId }}</span>
      <el-button
        class="filter-item"
        size="small"
        type="success"
        style="float: right"
        :disabled="isLoading"
        @click="handleSaveDetail"
      >
        {{ $t('Issue.Save') }}
      </el-button>
      <div style="font-size: 16px;padding-top: 10px;">{{ $t('Issue.AddBy', { user: author }) }}</div>
      <div>{{ issueDescription }}</div>
    </div>

    <el-form ref="issueForm" v-loading="isLoading" :model="issueForm" :rules="issueFormRules" :label-position="'left'">
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('general.Name')" prop="subject">
            <el-input v-model="issueForm.subject" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.Assignee')" prop="assigned_to_id">
            <el-select v-model="issueForm.assigned_to_id" style="width: 100%" clearable>
              <el-option v-for="item in issueAssigneeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Version.Version')" prop="fixed_version_id">
            <el-select v-model="issueForm.fixed_version_id" style="width: 100%" clearable>
              <el-option v-for="item in issueVersionList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('general.Type')" prop="tracker_id">
            <el-select v-model="issueForm.tracker_id" style="width: 100%">
              <el-option v-for="item in issueTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('general.Status')" prop="status_id">
            <el-select v-model="issueForm.status_id" style="width: 100%" :disabled="isParentIssueClosed">
              <el-option
                v-for="item in dynamicIssueStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
            <el-select v-model="issueForm.priority_id" style="width: 100%" :disabled="childrenIssueList.length > 0">
              <el-option v-for="item in issuePriorityList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.Estimate')" prop="estimated_hours">
            <!--<el-input v-model="issueForm.estimated_hours" placeholder="please input hours"/>-->
            <el-input-number v-model="issueForm.estimated_hours" :min="0" :max="100" style="width: 100%" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.DoneRatio')" prop="done_ratio">
            <el-input-number v-model="issueForm.done_ratio" :min="0" :max="100" style="width: 100%" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.StartDate')" prop="start_date">
            <el-date-picker
              v-model="issueForm.start_date"
              type="date"
              placeholder="Select Date"
              style="width: 100%"
              value-format="yyyy-MM-dd"
              :clearable="false"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('Issue.EndDate')" prop="due_date">
            <el-date-picker
              v-model="issueForm.due_date"
              type="date"
              placeholder="Select Date"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item :label="$t('general.Description')" prop="description">
            <el-input v-model="issueForm.description" type="textarea" rows="4" placeholder="please input description" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item :label="$t('File.Upload')" prop="upload">
            <el-upload ref="upload" class="upload-file2" drag action="" :auto-upload="false" :on-change="handleChange">
              <div class="uploadBtn el-button--primary">{{ $t('File.uploadBtn') }}</div>
              <div class="el-upload__text">{{ $t('File.DropFileHereOrClickUpload') }}</div>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
