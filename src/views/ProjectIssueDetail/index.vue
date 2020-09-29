<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import FlowDialog from './components/FlowDialog'
import ParamDialog from './components/ParamDialog'
import WangEditor from '@/components/Wangeditor'
import { getIssue } from '@/api/issue'
import { getIssueStatus, getIssueTracker, getIssuePriority, updateIssue } from '@/api/issue'
import { getProjectAssignable, getProjectVersion } from '@/api/projects'
import { getFlowByIssue, addFlowByIssue, deleteFlow, getFlowType } from '@/api/issueFlow'
import { getParameterByIssue, addParameterByIssue, deleteParameter } from '@/api/issueParameter'
import { Message } from 'element-ui'
export default {
  components: {
    FlowDialog,
    ParamDialog,
    Pagination,
    WangEditor
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
        subject: [
          { required: true, message: 'Please input name', trigger: 'blur' }
        ]
      },
      issueName: '',
      issueStartDate: '',
      issueDueDate: '',
      issueDescription: '',
      issueNote: '',
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
      choose_testItem: ''
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
    this.issueId = parseInt(this.$route.params.issueId)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Promise.all([
        getIssueStatus(),
        getIssueTracker(),
        getIssuePriority(),
        getIssue(this.issueId),
        getFlowByIssue(this.issueId),
        getFlowType(),
        getParameterByIssue(this.issueId)
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
        const projectId = issueDetail.project.id
        getProjectAssignable(projectId).then((assignable) => {
          this.issueAssigneeList = assignable.data.user_list.map(item => {
            return { label: item.login, value: item.id }
          })
        })
        getProjectVersion(projectId).then((versions) => {
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

        this.issueParameter = res[6].data
        this.issueForm.subject = issueDetail.subject
        this.issueForm.start_date = issueDetail.start_date
        this.issueForm.due_date = issueDetail.due_date
        this.issueForm.estimated_hours = issueDetail.estimated_hours
        this.issueForm.status_id = issueDetail.status.id
        this.issueForm.assigned_to_id = issueDetail.assigned_to.id
        this.issueForm.priority_id = issueDetail.priority.id
        this.issueForm.done_ratio = issueDetail.done_ratio
        this.issueForm.tracker_id = issueDetail.tracker.id
        this.issueForm.description = issueDetail.description
        this.projectId = issueDetail.project.id
        if (issueDetail.fixed_version) this.issueForm.fixed_version_id = issueDetail.fixed_version.id
        this.issueComment = issueDetail.journals.map(item => {
          return {
            comment: item.notes,
            comment_author: item.user.name,
            comment_at: item.created_on
          }
        })
        this.listLoading = false
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
      this.$refs['issueForm'].validate(async(valid) => {
        if (valid) {
          const data = this.issueForm
          if (data.fixed_version_id === '') {
            delete data.fixed_version_id
          }
          await updateIssue(this.issueId, data)
          Message({
            message: 'update successful',
            type: 'success',
            duration: 1 * 1000
          })
        } else {
          return false
        }
      })
    },
    emitGetEditorData(value) {
      this.issueNote = value
    },
    async handleAddComment() {
      await updateIssue(this.issueId, { 'notes': this.issueNote })
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
    async deleteParameter(row) {
      await deleteParameter(row.id)
      Message({
        message: 'delete successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-card class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px;padding-bottom: 10px;">Issue #{{ issueId }}</span>
        <el-button class="filter-item" size="small" type="success" style="float: right" @click="handleSaveDetail">
          Save
        </el-button>
        <div>{{ issueDescription }}</div>
      </div>
      <el-form
        ref="issueForm"
        :model="issueForm"
        :rules="issueFormRules"
        label-width="20%"
        :label-position="'right'"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item label="Name" label-width="100px" prop="subject">
              <el-input v-model="issueForm.subject" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Version" label-width="100px" prop="fixed_version_id">
              <el-select v-model="issueForm.fixed_version_id" style="width:100%">
                <el-option
                  v-for="item in issueVersionList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Priority" label-width="100px" prop="priority_id">
              <el-select v-model="issueForm.priority_id" style="width:100%">
                <el-option
                  v-for="item in issuePriorityList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Status" label-width="100px" prop="status_id">
              <el-select v-model="issueForm.status_id" style="width:100%">
                <el-option v-for="item in issueStatusList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="Assignee" label-width="100px" prop="assigned_to_id">
              <el-select v-model="issueForm.assigned_to_id" style="width:100%">
                <el-option
                  v-for="item in issueAssigneeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Type" label-width="100px" prop="tracker_id">
              <el-select v-model="issueForm.tracker_id" style="width:100%">
                <el-option v-for="item in issueTypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Done Ratio" label-width="100px" prop="done_ratio">
              <el-input-number
                v-model="issueForm.done_ratio"
                :min="0"
                :max="100"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Estimate" label-width="100px" prop="estimated_hours">
              <!--<el-input v-model="issueForm.estimated_hours" placeholder="please input hours"/>-->
              <el-input-number
                v-model="issueForm.estimated_hours"
                :min="0"
                :max="100"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Start" label-width="100px" prop="start_date">
              <el-date-picker
                v-model="issueForm.start_date"
                type="date"
                placeholder="Select Date"
                style="width: 100%;"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="End" label-width="100px" prop="due_date">
              <el-date-picker
                v-model="issueForm.due_date"
                type="date"
                placeholder="Select Date"
                style="width: 100%;"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Desc." label-width="100px" prop="description">
              <el-input v-model="issueForm.description" type="textarea" placeholder="please input description" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-tabs v-model="activeName" type="border-card" style="margin-top: 10px">
      <el-tab-pane label="Comment" name="comment">
        <el-button type="primary" @click="showAddComment">Add Comment</el-button>
        <el-table
          :data="issueComment"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          style="margin-top: 10px"
        >
          <el-table-column label="Comment">
            <template slot-scope="scope">
              <div v-html="scope.row.comment" />
            </template>
          </el-table-column>
          <el-table-column label="Author" width="180">
            <template slot-scope="scope">
              {{ scope.row.comment_author }}
            </template>
          </el-table-column>
          <el-table-column label="Comment Time" width="180">
            <template slot-scope="scope">
              {{ scope.row.comment_at }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Flow" name="Flow">
        <el-button type="primary" @click="showFlowDialog('', 'Add Flow')">Add Flow</el-button>
        <el-table
          :data="issueFlow"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          style="margin-top: 10px"
        >
          <el-table-column label="Order">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column label="Step Name">
            <template slot-scope="scope">
              <!--<span style="color: #409EFF;cursor: pointer;" @click="showFlowDialog(scope.row, 'Edit Flow')">
                {{ scope.row.name }}
              </span>-->
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="Step Type">
            <template slot-scope="scope">
              {{ scope.row.type_name }}
            </template>
          </el-table-column>
          <el-table-column label="Desc.">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column label="Action">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteFlow(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Parameter" name="parameter">
        <el-button type="primary" @click="showParamDialog('', 'Add Parameter')">Add Parameter</el-button>
        <el-table
          :data="issueParameter"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          style="margin-top: 10px"
        >
          <el-table-column label="Name">
            <template slot-scope="scope">
              {{ scope.row.name }}
              <!--<span style="color: #409EFF;cursor: pointer;" @click="showParamDialog(scope.row, 'Edit Parameter')">
                {{ scope.row.name }}
              </span>-->
            </template>
          </el-table-column>
          <el-table-column label="Type">
            <template slot-scope="scope">
              {{ scope.row.parameter_type }}
            </template>
          </el-table-column>
          <el-table-column label="Desc.">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column label="Limit">
            <template slot-scope="scope">
              {{ scope.row.limitation }}
            </template>
          </el-table-column>
          <el-table-column label="Length">
            <template slot-scope="scope">
              {{ scope.row.length }}
            </template>
          </el-table-column>
          <el-table-column label="Action">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteParameter(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="Add Comment" :visible="commentDialogVisible" width="70%" @close="commentDialogVisible = false">
      <WangEditor :content="issueNote" @get-editor-data="emitGetEditorData" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="commentDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleAddComment">Confirm</el-button>
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
</style>
