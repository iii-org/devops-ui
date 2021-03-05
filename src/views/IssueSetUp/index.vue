<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import FlowDialog from './components/FlowDialog'
import ParamDialog from './components/ParamDialog'
import TestDialog from './components/TestDialog'
import TestItemDialog from './components/TestItemDialog'
import TestValueDialog from './components/TestValueDialog'
import { getIssue } from '@/api/issue'
import { getIssueStatus, getIssueTracker, getIssuePriority, updateIssue } from '@/api/issue'
import { getProjectAssignable } from '@/api/projects'
import { getFlowByIssue, addFlowByIssue, deleteFlow, getFlowType } from '@/api/issueFlow'
import { getParameterByIssue, addParameterByIssue, deleteParameter } from '@/api/issueParameter'
import { getTestCaseByIssue, addTestCaseByIssue, deleteTestCase } from '@/api/issueTestCase'
import { getTestItemByCase, addTestItemByCase, updateTestItemByCase, deleteTestItem } from '@/api/issueTestItem'
import {
  getTestValueByItem,
  getTestValueType,
  getTestValueLocation,
  deleteTestValue,
  addTestValueByItem
} from '@/api/issueTestValue'
import EditorMD from '@/components/Editormd'
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'IssueSetUp',
  components: {
    FlowDialog,
    ParamDialog,
    Pagination,
    TestDialog,
    TestItemDialog,
    TestValueDialog,
    EditorMD
  },
  mixins: [MixinElTable],
  data() {
    return {
      issueAssigneeList: [],
      issueTypeList: [],
      issueStatusList: [],
      issuePriorityList: [],
      issueDetail: {
        issuePriority: '',
        issueDoneRatio: 0,
        issueAssignee: '',
        issueStatus: '',
        issueType: ''
      },
      issueName: '',
      issueVersion: '',
      issueEstimatedHours: '',
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
      testDialogVisible: false,
      testItemDialogVisible: false,
      testValueDialogVisible: false,
      editFlowId: 0,
      editParamId: 0,
      editTestId: 0,
      editTestItemId: 0,
      editTestItem: {},
      editTestValueId: 0,
      dialogTitle: '',
      issueId: 0,
      projectId: 0,
      issue_detail: {},
      choose_testCase: '',
      choose_testItem: '',
      listLoading: true
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.issueList.slice(start, end)
    }
  },
  mounted() {
    this.issueId = parseInt(this.$route.params.issue_num)
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
        const projectId = issueDetail.project.id
        getProjectAssignable(projectId).then(assignable => {
          this.issueAssigneeList = assignable.data.user_list.map(item => {
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
        this.issueTestCase = res[7].data
        this.issueDetail.issueStatus = issueDetail.status.id
        this.issueDetail.issueAssignee = issueDetail.assigned_to.id
        this.issueDetail.issuePriority = issueDetail.priority.id
        this.issueDetail.issueDoneRatio = issueDetail.done_ratio
        this.issueDetail.issueType = issueDetail.tracker.id
        this.issueStartDate = issueDetail.start_date
        this.issueDueDate = issueDetail.due_date
        this.issueDescription = issueDetail.description
        this.projectId = issueDetail.project.id
        this.issueName = issueDetail.subject
        if (issueDetail.hasOwnProperty('fixed_version') === true) {
          this.issueVersion = issueDetail.fixed_version.name
        }
        this.issueEstimatedHours = issueDetail.estimated_hours
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
    handleChange(value) {
      // console.log(value)
    },
    // returnTagType(row) {
    //   const { success, total } = row.last_test_result
    //   return success === total ? 'success' : 'danger'
    // },
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
    showTestDialog(test, title) {
      this.editTestId = test === '' ? 0 : test.id
      this.dialogTitle = title
      this.testDialogVisible = true
    },
    showTestItemDialog(testItem, title) {
      this.editTestItemId = testItem === '' ? 0 : testItem.id
      if (testItem === '') {
        this.editTestItem = {}
      } else {
        this.editTestItem = testItem
      }
      this.dialogTitle = title
      this.testItemDialogVisible = true
    },
    showTestValueDialog(testValue, title) {
      this.editTestValueId = testValue === '' ? 0 : testValue.id
      this.dialogTitle = title
      this.testValueDialogVisible = true
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    },
    async handleSaveDetail() {
      const data = {
        tracker_id: this.issueDetail.issueType,
        status_id: this.issueDetail.issueStatus,
        priority_id: this.issueDetail.issuePriority,
        assigned_to_id: this.issueDetail.issueAssignee,
        done_ratio: this.issueDetail.issueDoneRatio
      }
      await updateIssue(this.issueId, data)
      this.fetchData()
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
    },
    emitGetEditorData(value) {
      this.issueNote = value
    },
    async handleAddComment() {
      await updateIssue(this.issueId, { notes: this.issueNote })
      this.commentDialogVisible = false
      this.issueNote = ''
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.fetchData()
    },
    showAddComment() {
      this.issueNote = ''
      this.commentDialogVisible = true
    },
    async saveFlow(data) {
      data['project_id'] = this.projectSelectedId
      await addFlowByIssue(this.issueId, data)
      this.flowDialogVisible = false
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })
      this.fetchData()
    },
    async deleteFlow(row) {
      await deleteFlow(row.id)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
      })
      this.fetchData()
    },
    async saveParameter(data) {
      data['project_id'] = this.projectSelectedId
      await addParameterByIssue(this.issueId, data)
      this.paramDialogVisible = false
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })
      this.fetchData()
    },
    async deleteParameter(row) {
      await deleteParameter(row.id)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
      })
      this.fetchData()
    },
    async saveTestCase(data) {
      if (this.projectId > 0) {
        data['project_id'] = this.projectId
      }
      await addTestCaseByIssue(this.issueId, data)
      this.testDialogVisible = false
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })
      this.fetchData()
    },
    async deleteTestCase(row) {
      await deleteTestCase(row.id)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
      })
      this.fetchData()
    },
    async getTestItem(case_id) {
      const testItemList = await getTestItemByCase(case_id)
      if (testItemList.data.length > 0) {
        this.issueTestItem = testItemList.data
      } else {
        this.issueTestItem = []
      }
    },
    async saveTestItem(data) {
      if (this.choose_testCase === '') {
        this.$message({
          title: this.$t('general.Warning'),
          message: 'please select test case',
          type: 'warning'
        })
        return
      }
      if (this.projectId > 0) {
        data['project_id'] = this.projectId
      }
      if (this.issueId > 0) {
        data['issue_id'] = this.issueId
      }
      if (data.id === '') {
        await addTestItemByCase(this.choose_testCase, data)
      } else {
        await updateTestItemByCase(data.id, data)
      }
      // await addTestItemByCase(this.choose_testCase, data)
      this.testItemDialogVisible = false
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })
      this.getTestItem(this.choose_testCase)
    },
    async deleteTestItem(row) {
      await deleteTestItem(row.id)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
      })
      this.getTestItem(this.choose_testCase)
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
    async deleteTestValue(row) {
      await deleteTestValue(row.id)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
      })
      this.getTestValue(this.choose_testItem)
    },
    async saveTestValue(data) {
      if (this.choose_testItem === '' || this.choose_testCase === '') {
        this.$message({
          title: this.$t('general.Warning'),
          message: 'please select test item',
          type: 'warning'
        })
        return
      }
      if (this.projectId > 0) {
        data['project_id'] = this.projectId
      }
      if (this.issueId > 0) {
        data['issue_id'] = this.issueId
      }
      data['testCase_id'] = this.choose_testCase

      await addTestValueByItem(this.choose_testItem, data)
      this.testValueDialogVisible = false
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })
      this.getTestValue(this.choose_testItem)
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-card v-loading="listLoading" class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px; padding-bottom: 10px">Issue #{{ issueId }}</span>
        <el-button class="filter-item" size="small" type="success" style="float: right" @click="handleSaveDetail">
          Save
        </el-button>
        <!-- <div>{{ issueDescription }}</div> -->
      </div>
      <el-form ref="form" label-width="20%" :label-position="'right'">
        <el-row>
          <el-col :span="6">
            <el-form-item :label="$t('general.Name')" label-width="100px">
              <div class="setup">
                {{ issueName }}
                <div />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="$t('Version.Version')" label-width="100px">
              <div class="setup">{{ issueVersion }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="$t('Issue.Priority')" label-width="100px">
              <el-select v-model="issueDetail.issuePriority" style="width: 100%">
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
            <el-form-item label="Status" label-width="100px">
              <el-select v-model="issueDetail.issueStatus" style="width: 100%">
                <el-option v-for="item in issueStatusList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Assignee" label-width="100px">
              <el-select v-model="issueDetail.issueAssignee" style="width: 100%">
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
            <el-form-item label="Type" label-width="100px">
              <el-select v-model="issueDetail.issueType" style="width: 100%">
                <el-option v-for="item in issueTypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Done Ratio" label-width="100px">
              <el-input-number
                v-model="issueDetail.issueDoneRatio"
                :min="0"
                :max="100"
                style="width: 100%"
                @change="handleChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Estimate" label-width="100px">
              <div class="setup">{{ issueEstimatedHours }}</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <!-- <el-col :span="6">
            <el-form-item label="Done Ratio" label-width="100px">
              <el-input-number
                v-model="issueDetail.issueDoneRatio"
                :min="0"
                :max="100"
                style="width:100%"
                @change="handleChange"
              />
            </el-form-item>
          </el-col> -->
          <el-col :span="6">
            <el-form-item label="Start Date" label-width="100px">
              <div class="setup">{{ issueStartDate }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Due Date" label-width="100px">
              <div class="setup">{{ issueDueDate }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Desc." label-width="100px" prop="description">
              <el-input v-model="issueDescription" type="textarea" placeholder="please input description" disabled />
              <!-- {{ issueDescription }} -->
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-tabs v-model="activeName" type="border-card" class="mt-2">
      <el-tab-pane label="Comment" name="comment">
        <el-button type="primary" @click="showAddComment">Add Comment</el-button>
        <el-table
          :data="issueComment"
          :element-loading-text="$t('Loading')"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
          height="100%"
        >
          <el-table-column label="Comment">
            <template slot-scope="scope">
              <VueShowdown :markdown="scope.row.comment" />
            </template>
          </el-table-column>
          <el-table-column label="Author" width="180">
            <template slot-scope="scope">
              {{ scope.row.comment_author }}
            </template>
          </el-table-column>
          <el-table-column label="Comment Time" width="180">
            <template slot-scope="scope">
              {{ scope.row.comment_at | relativeTime }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Flow" name="Flow">
        <!-- <el-button type="primary" @click="showFlowDialog('', 'Add Flow')">Add Flow</el-button> -->
        <el-table
          :data="issueFlow"
          :element-loading-text="$t('Loading')"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
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
          <!-- <el-table-column label="Action">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteFlow(scope.row)">Delete</el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Parameter" name="parameter">
        <!-- <el-button type="primary" @click="showParamDialog('', 'Add Parameter')">Add Parameter</el-button> -->
        <el-table
          :data="issueParameter"
          :element-loading-text="$t('Loading')"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
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
          <!-- <el-table-column label="Action">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteParameter(scope.row)">Delete</el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test Case" name="test">
        <el-button type="primary" @click="showTestDialog('', 'Add Test')">Add Test Case</el-button>
        <el-table
          :data="issueTestCase"
          :element-loading-text="$t('Loading')"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
        >
          <el-table-column label="ID">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column label="API Name">
            <template slot-scope="scope">
              <!--<span style="color: #409EFF;cursor: pointer;" @click="showTestDialog(scope.row, 'Edit API')">
                {{ scope.row.name }}
              </span>-->
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="API Method">
            <template slot-scope="scope">
              {{ scope.row.data.method }}
            </template>
          </el-table-column>
          <el-table-column label="API URL">
            <template slot-scope="scope">
              {{ scope.row.data.url }}
            </template>
          </el-table-column>
          <el-table-column label="Desc.">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column label="Action">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteTestCase(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test Item" name="testItem">
        <div class="demo-input-size">
          Test Case:
          <el-select v-model="choose_testCase" @change="getTestItem">
            <el-option
              v-for="item in issueTestCase"
              :key="item.id"
              :label="`${item.name}(${item.id})`"
              :value="item.id"
            />
          </el-select>
          <el-button type="primary" @click="showTestItemDialog('', 'Add Test Item')">Add Test Item</el-button>
        </div>
        <el-table :data="issueTestItem" :element-loading-text="$t('Loading')" border fit class="mt-2">
          <el-table-column label="ID">
            <template slot-scope="scope">
              <span style="color: #409eff; cursor: pointer" @click="showTestItemDialog(scope.row, 'Edit Test Item')">
                {{ scope.row.id }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Item">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="Is Pass?">
            <template slot-scope="scope">
              {{ scope.row.is_passed }}
            </template>
          </el-table-column>
          <el-table-column label="Action">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteTestItem(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test Value" name="testValue">
        <div class="demo-input-size">
          Test Item:
          <el-select v-model="choose_testItem" @change="getTestValue">
            <el-option
              v-for="item in issueTestItem"
              :key="item.id"
              :label="`${item.name}(${item.id})`"
              :value="item.id"
            />
          </el-select>
          <el-button type="primary" @click="showTestValueDialog('', 'Add Test Value')">Add Test Value</el-button>
        </div>
        <el-table :data="issueTestValue" :element-loading-text="$t('Loading')" border fit class="mt-2">
          <el-table-column label="Type">
            <template slot-scope="scope">
              {{ scope.row.type }}
              <!--<span style="color: #409EFF;cursor: pointer;" @click="showTestValueDialog(scope.row, 'Edit Test Value')">
                {{ scope.row.type }}
              </span>-->
            </template>
          </el-table-column>
          <el-table-column label="Key">
            <template slot-scope="scope">
              {{ scope.row.key }}
            </template>
          </el-table-column>
          <el-table-column label="Value">
            <template slot-scope="scope">
              {{ scope.row.value }}
            </template>
          </el-table-column>
          <el-table-column label="Location">
            <template slot-scope="scope">
              {{ scope.row.location }}
            </template>
          </el-table-column>
          <el-table-column label="Action">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteTestValue(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="Add Comment" :visible="commentDialogVisible" width="70%" @close="commentDialogVisible = false">
      <EditorMD :content="''" @get-editor-data="emitGetEditorData" />
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
    <test-dialog
      :dialog-title="dialogTitle"
      :test-id="editTestId"
      :dialog-visible="testDialogVisible"
      :save-data="saveTestCase"
      @test-dialog-visible="testDialogVisible = false"
    />
    <test-item-dialog
      :dialog-title="dialogTitle"
      :test-item-id="editTestItemId"
      :test-item="editTestItem"
      :dialog-visible="testItemDialogVisible"
      :save-data="saveTestItem"
      @testItem-dialog-visible="testItemDialogVisible = false"
    />
    <test-value-dialog
      :dialog-title="dialogTitle"
      :test-value-id="editTestValueId"
      :dialog-visible="testValueDialogVisible"
      :save-data="saveTestValue"
      @testValue-dialog-visible="testValueDialogVisible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.setup {
  margin-top: 13px;
  font-weight: 700;
}
</style>
