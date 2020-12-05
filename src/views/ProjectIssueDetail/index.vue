<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import FlowDialog from './components/FlowDialog'
import ParamDialog from './components/ParamDialog'
import WangEditor from '@/components/Wangeditor'
import EditorMD from '@/components/Editormd'
import { getIssue } from '@/api/issue'
import { getIssueStatus, getIssueTracker, getIssuePriority, updateIssue, deleteIssueFile } from '@/api/issue'
import { getProjectAssignable, getProjectVersion, downloadProjectFile } from '@/api/projects'
import { getFlowByIssue, addFlowByIssue, deleteFlow, getFlowType } from '@/api/issueFlow'
import { getParameterByIssue, addParameterByIssue, deleteParameter } from '@/api/issueParameter'
import { getTestCaseByIssue } from '@/api/issueTestCase'
import { getTestItemByCase } from '@/api/issueTestItem'
import { getTestValueByItem, getTestValueType, getTestValueLocation } from '@/api/issueTestValue'
import { Message } from 'element-ui'
import { fileextension } from '../../utils/extension.js'
export default {
  components: {
    FlowDialog,
    ParamDialog,
    Pagination,
    EditorMD
    // WangEditor
  },
  data() {
    return {
      issueAssigneeList: [],
      issueTypeList: [],
      issueStatusList: [],
      issuePriorityList: [],
      issueVersionList: [],
      issueForm: {
        subject: '',
        fixed_version_id: '',
        priority_id: '',
        status_id: '',
        assigned_to_id: '',
        tracker_id: '',
        done_ratio: 0,
        estimated_hours: '',
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
      issueName: '',
      issueStartDate: '',
      issueDueDate: '',
      issueDescription: '',
      issueNote: '',
      issueNotenew: '',
      issueDevStatus: {
        commitMsg: 'V2.1 fix User Login Error',
        commit: '1c715b2b',
        commitData: '2020-07-25T07:20:11Z',
        last_test_result: {
          success: 10,
          total: 15
        }
      },
      issueNeedTest: true,
      issueFlow: [],
      issueParameter: [],
      issueTestCase: [],
      issueTestItem: [],
      issueTestValue: [],
      issueComment: [],
      issueFile: [],
      activeName: 'comment',
      commentDialogVisible: false,
      flowDialogVisible: false,
      paramDialogVisible: false,
      editFlowId: 0,
      editParamId: 0,
      editTestId: 0,
      editTestItemId: 0,
      editTestValueId: 0,
      dialogTitle: '',
      issueId: 0,
      projectId: 0,
      issue_detail: {},
      choose_testCase: '',
      choose_testItem: '',
      author: '',
      issueLoading: false
    }
  },
  computed: {
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.issueList.slice(start, end)
    }
  },
  mounted() {
    this.extension = fileextension()
    this.issueId = parseInt(this.$route.params.issueId)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.issueLoading = true
      Promise.all([
        getIssueStatus(),
        getIssueTracker(),
        getIssuePriority(),
        getIssue(this.issueId),
        getFlowByIssue(this.issueId),
        getFlowType(),
        getParameterByIssue(this.issueId),
        getTestCaseByIssue(this.issueId)
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
        const issueDetail = res[3].data
        this.projectId = issueDetail.project.id
        getProjectAssignable(this.projectId).then(assignable => {
          this.issueAssigneeList = assignable.data.user_list.map(item => {
            return { label: item.login, value: item.id }
          })
        })
        getProjectVersion(this.projectId).then(versions => {
          this.issueVersionList = versions.data.versions.map(item => {
            return { label: item.name, value: item.id }
          })
        })
        const issueFlowType = res[5].data
        this.issueFlow = []
        if (Array.isArray(res[4].data) && res[4].data.length > 0) {
          this.issueFlow = res[4].data[0].flow_data.map(item => {
            const issueType = issueFlowType.find(type => {
              return type.flow_type_id === item.type_id
            })
            item['type_name'] = issueType ? issueType['name'] : ''
            return item
          })
        }

        this.issueFile = issueDetail.attachments
        this.issueParameter = res[6].data
        this.author = issueDetail.author.name
        this.issueForm.subject = issueDetail.subject
        this.issueForm.start_date = issueDetail.start_date && issueDetail.start_date
        this.issueForm.due_date = issueDetail.due_date && issueDetail.due_date
        this.issueForm.estimated_hours = issueDetail.estimated_hours && issueDetail.estimated_hours
        this.issueForm.status_id = issueDetail.status && issueDetail.status.id
        this.issueForm.assigned_to_id = issueDetail.assigned_to && issueDetail.assigned_to.id
        this.issueForm.priority_id = issueDetail.priority && issueDetail.priority.id
        this.issueForm.done_ratio = issueDetail.done_ratio && issueDetail.done_ratio
        this.issueForm.tracker_id = issueDetail.tracker && issueDetail.tracker.id
        this.issueForm.description = issueDetail.description && issueDetail.description
        this.projectId = issueDetail.project.id
        if (issueDetail.fixed_version) this.issueForm.fixed_version_id = issueDetail.fixed_version.id
        this.issueComment = issueDetail.journals.map(item => {
          return {
            comment: item.notes,
            comment_author: item.user.name,
            comment_at: item.created_on
          }
        })
        this.issueLoading = false
        this.issueTestCase = res[7].data
      })
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      return success + ' / ' + total
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    showFlowDialog(flow, title) {
      this.editFlowId = flow === '' ? 0 : flow.id
      this.dialogTitle = title
      this.flowDialogVisible = true
    },
    showParamDialog(param, title) {
      this.editParamId = param === '' ? 0 : param.id
      this.dialogTitle = title
      this.paramDialogVisible = true
    },
    async handleSaveDetail() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          // deepcopy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.issueForm))
          Object.keys(data).map(item => {
            if (data[item] === '' || !data[item]) delete data[item]
          })

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
        } else {
          return false
        }
      })
    },
    emitGetEditorData(value) {
      this.issueNote = value
    },
    async handleAddComment() {
      await updateIssue(this.issueId, { notes: this.issueNote })
      this.commentDialogVisible = false
      Message({
        message: 'update successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    },
    showAddComment() {
      this.issueNote = ''
      this.commentDialogVisible = true
    },
    async saveFlow(data) {
      if (this.projectId > 0) {
        data['project_id'] = this.projectId
      }
      await addFlowByIssue(this.issueId, data)
      this.flowDialogVisible = false
      Message({
        message: 'add successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    },
    async deleteFlow(row) {
      await deleteFlow(row.id)
      Message({
        message: 'delete successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    },
    async getTestItem(case_id) {
      this.choose_testItem = ''
      this.issueTestValue = []
      const testItemList = await getTestItemByCase(case_id)
      if (testItemList.data.length > 0) {
        this.issueTestItem = testItemList.data
      } else {
        this.issueTestItem = []
      }
    },
    async saveParameter(data) {
      if (this.projectId > 0) {
        data['project_id'] = this.projectId
      }
      await addParameterByIssue(this.issueId, data)
      this.paramDialogVisible = false
      Message({
        message: 'add successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    },
    async getTestValue(item_id) {
      const testValueList = await getTestValueByItem(item_id)
      const testValueTypeRes = await getTestValueType()
      const testValueTypeList = testValueTypeRes.data
      const testValueLocationRes = await getTestValueLocation()
      const testValueLocationList = testValueLocationRes.data

      if (testValueList.data.length > 0) {
        this.issueTestValue = testValueList.data.map(item => {
          const valueType = testValueTypeList.find(type => {
            return item.type_id === type.type_id
          })
          item.type = valueType.type_name
          const valueLocation = testValueLocationList.find(location => {
            return item.location_id === location.location_id
          })
          item.location = valueLocation.type_name
          return item
        })
      } else {
        this.issueTestValue = []
      }
    },
    async deleteParameter(row) {
      await deleteParameter(row.id)
      Message({
        message: 'delete successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    },
    async deleteIssueFile(row) {
      await deleteIssueFile(row.id)
      Message({
        message: 'delete successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    },
    async handleDownload(row) {
      const res = await downloadProjectFile({ id: row.id, filename: row.filename })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', row.filename) // or any other extension
      document.body.appendChild(link)
      link.click()
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
<template>
  <div class="app-container d-flex">
    <el-card v-loading="issueLoading" class="box-card el-col-10 column custom-list" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px; padding-bottom: 10px">{{ $t('Issue.Issue') }} #{{ issueId }}</span>
        <el-button class="filter-item" size="small" type="success" style="float: right" @click="handleSaveDetail">
          {{ $t('Issue.Save') }}
        </el-button>
        <div style="font-size: 16px;padding-top: 10px;">{{ $t('Issue.Addby', { user: author }) }}</div>
        <div>{{ issueDescription }}</div>
      </div>
      <el-form ref="issueForm" :model="issueForm" :rules="issueFormRules" :label-position="'left'">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('general.Name')" prop="subject">
              <el-input v-model="issueForm.subject" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('Issue.Assignee')" prop="assigned_to_id">
              <el-select v-model="issueForm.assigned_to_id" style="width: 100%">
                <el-option
                  v-for="item in issueAssigneeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('Version.Version')" prop="fixed_version_id">
              <el-select v-model="issueForm.fixed_version_id" style="width: 100%">
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
              <el-select v-model="issueForm.status_id" style="width: 100%">
                <el-option v-for="item in issueStatusList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
              <el-select v-model="issueForm.priority_id" style="width: 100%">
                <el-option
                  v-for="item in issuePriorityList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
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
              <el-input
                v-model="issueForm.description"
                type="textarea"
                rows="4"
                placeholder="please input description"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('File.Upload')" prop="upload">
              <el-upload
                ref="upload"
                class="upload-file2"
                drag
                action=""
                :auto-upload="false"
                :on-change="handleChange"
              >
                <div class="uploadBtn el-button--primary">{{ $t('File.uploadBtn') }}</div>
                <div class="el-upload__text">{{ $t('File.DrapFileHereOrClickUpload') }}</div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-tabs v-model="activeName" type="border-card" class="el-col-14 column">
      <el-tab-pane :label="$t('Issue.Comment')" name="comment">
        <el-button type="primary" @click="showAddComment">{{ $t('Issue.AddComment') }}</el-button>
        <el-table
          :data="issueComment"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          style="margin-top: 10px"
        >
          <el-table-column :label="$t('Issue.Comment')">
            <template slot-scope="scope">
              <!-- <div v-html="scope.row.comment" /> -->
              <VueShowdown :markdown="scope.row.comment" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('Issue.Author')" width="180" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.comment_author">
                {{ scope.row.comment_author }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.CreateTime')" width="200" align="center">
            <template slot-scope="scope">
              {{ new Date(scope.row.comment_at).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('Issue.Flow')" name="Flow">
        <el-button type="primary" @click="showFlowDialog('', 'AddFlow')">{{ $t('Issue.AddFlow') }}</el-button>
        <el-table
          :data="issueFlow"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          style="margin-top: 10px"
        >
          <el-table-column :label="$t('Issue.FlowId')">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Name')">
            <template slot-scope="scope">
              <!--<span style="color: #409EFF;cursor: pointer;" @click="showFlowDialog(scope.row, 'Edit Flow')">
                {{ scope.row.name }}
              </span>-->
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Type')">
            <template slot-scope="scope">
              {{ scope.row.type_name }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Description')">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Actions')" width="120" align="center">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteFlow(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('Issue.Parameter')" name="parameter">
        <el-button type="primary" @click="showParamDialog('', 'AddParameter')">{{
          $t('Issue.AddParameter')
        }}</el-button>
        <el-table
          :data="issueParameter"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          style="margin-top: 10px"
        >
          <el-table-column :label="$t('general.Name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
              <!--<span style="color: #409EFF;cursor: pointer;" @click="showParamDialog(scope.row, 'Edit Parameter')">
                {{ scope.row.name }}
              </span>-->
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Type')">
            <template slot-scope="scope">
              {{ scope.row.parameter_type }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Description')">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Issue.Limit')">
            <template slot-scope="scope">
              {{ scope.row.limitation }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Issue.Length')">
            <template slot-scope="scope">
              {{ scope.row.length }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Actions')" width="120" align="center">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteParameter(scope.row)">{{
                $t('general.Delete')
              }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('File.File')" name="file">
        <el-table
          :data="issueFile"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          style="margin-top: 10px"
        >
          <el-table-column :label="$t('general.Name')" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.filename">
                {{ scope.row.filename }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.CreateTime')" align="center">
            <template slot-scope="scope">
              {{ new Date(scope.row.created_on).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Actions')" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleDownload(scope.row)">
                <i class="el-icon-download" />
                {{ $t('File.Download') }}
              </el-button>
              <el-button type="danger" size="mini" @click="deleteIssueFile(scope.row)">{{
                $t('general.Delete')
              }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :title="$t('Issue.AddComment')"
      :visible="commentDialogVisible"
      width="70%"
      :close-on-click-modal="false"
      @close="commentDialogVisible = false"
    >
      <!-- <WangEditor :content="issueNote" @get-editor-data="emitGetEditorData" /> -->
      <template>
        <EditorMD
          v-if="commentDialogVisible"
          id="editormd"
          :content="issueNotenew"
          @get-editor-data="emitGetEditorData"
        />
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="commentDialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" @click="handleAddComment">{{ $t('general.Confirm') }}</el-button>
      </span>
    </el-dialog>
    <flow-dialog
      :dialog-title="dialogTitle"
      :flow-id="editFlowId"
      :dialog-visible="flowDialogVisible"
      :save-data="saveFlow"
      @flow-dialog-visible="flowDialogVisible = false"
    />
    <param-dialog
      :dialog-title="dialogTitle"
      :param-id="editParamId"
      :dialog-visible="paramDialogVisible"
      :save-data="saveParameter"
      @param-dialog-visible="paramDialogVisible = false"
    />
  </div>
</template>
<style lang="scss">
.filter-container {
  margin-bottom: 5px;
}

.el-upload__text {
  margin-top: 18px;
}
</style>
