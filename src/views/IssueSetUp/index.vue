<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import DemandDialog from './components/DemandDialog'
import ParamDialog from './components/ParamDialog'
import TestDialog from './components/TestDialog'
import TestItemDialog from './components/TestItemDialog'
import TestValueDialog from './components/TestValueDialog'
import WangEditor from "@/components/Wangeditor";
import { getIssue } from '@/api/issue'
import { getIssueStatus, getIssueTracker, getIssuePriority, updateIssue } from '@/api/issue'
export default {
  components: { 
    DemandDialog,
    ParamDialog,
    Pagination,
    TestDialog,
    TestItemDialog,
    TestValueDialog,
    WangEditor
  },
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
      issueStartDate: '',
      issueDueDate: '',
      issueDescription: '',
      issueDevStatus: { 
        'commitMsg': 'V2.1 fix User Login Error',
        'commit': '1c715b2b',
        'commitData': '2020-07-25T07:20:11Z',
        'last_test_result': {
          'success': 10,
          'total': 15
        }
      },
      issueNeedTest: true,
      issueDemand:[{
        id: 1,
        order: 1,
        step_name: '設定帳號',
        step_type: 'GIVEN',
        step_desc: '設定帳號參數'
      }, {
        id: 2,
        order: 2,
        step_name: '設定密碼',
        step_type: 'GIVEN',
        step_desc: '設定密碼參數'
      }, {
        id: 3,
        order: 3,
        step_name: '登入',
        step_type: 'WHEN',
        step_desc: '點擊登入按鈕，讓使用者登入平台'
      }, {
        id: 4,
        order: 4,
        step_name: '登入頁面',
        step_type: 'THEN',
        step_desc: '登入回傳成功, 導入平台首頁'
      }],
      issueParam:[{
        id: 1,
        order: 1,
        param_name: '帳號',
        param_type: '文字',
        param_desc: '使用者帳號',
        param_limit: '09[0-9]',
        param_length: 10
      }, {
        id: 2,
        order: 2,
        param_name: '密碼',
        param_type: '文字',
        param_desc: '使用者登入密碼',
        param_limit: '',
        param_length: ''
      }, {
        id: 3,
        order: 3,
        param_name: '姓名',
        param_type: '文字',
        param_desc: '使用者姓名',
        param_limit: '',
        param_length: ''
      }, {
        id: 4,
        order: 4,
        param_name: '身份證字號',
        param_type: '文字',
        param_desc: '本國人身分證字號',
        param_limit: '[A-Z]{1}[0-9]{9}',
        param_length: 10
      }],
      issueTest:[{
        id: 1,
        api_name: '帳號登入',
        api_method: '輸入帳號密碼取得Token',
        api_url: '/user/login',
        api_desc: 'GET'
      }],
      issueComment:[{
        comment: 'Subject changed from iServCloud 修改backend scheduler, 定期去檢查FT VM 到何運算節點，並把資訊到 nova DB to iServCloud 修改backend scheduler, 定期去檢查FT VM 到何運算節點，並把資訊更新到 nova DB',
        comment_author: '王聰明',
        comment_at: '2020-07-03 11:11:09'
      }, {
        comment: '使用Git 觸發 Jenkins進行自動包版，自動安裝，自動測試。',
        comment_author: '張婉婷',
        comment_at: '2020-07-04 08:11:09'
      }],
      issueTestItem:[{
        id: 1,
        order: 1,
        item_name: '成功登入',
        item_is_success: true
      },{
        id: 2,
        order: 2,
        item_name: '成功登入',
        item_is_success: true
      },{
        id: 3,
        order: 3,
        item_name: '登入失敗',
        item_is_success: false
      },{
        id: 3,
        order: 3,
        item_name: '登入失敗',
        item_is_success: false
      }],
      issueTestValue:[{
        id: 1,
        value_type: 'Request',
        value_key: 'Content-Type',
        value: 'application/json',
        value_location: 'header'
      },{
        id: 2,
        value_type: 'Response',
        value_key: 'active',
        value: 'true',
        value_location: 'body'
      }],
      issueComment:[{
        comment: 'Subject changed from iServCloud 修改backend scheduler, 定期去檢查FT VM 到何運算節點，並把資訊到 nova DB to iServCloud 修改backend scheduler, 定期去檢查FT VM 到何運算節點，並把資訊更新到 nova DB',
        comment_author: '王聰明',
        comment_at: '2020-07-03 11:11:09'
      }, {
        comment: '使用Git 觸發 Jenkins進行自動包版，自動安裝，自動測試。',
        comment_author: '張婉婷',
        comment_at: '2020-07-04 08:11:09'
      }],
      activeName: 'comment',
      commentDialogVisible: false,
      demandDialogVisible: false,
      paramDialogVisible: false,
      testDialogVisible: false,
      testItemDialogVisible: false,
      testValueDialogVisible: false,
      editDemandId: 0,
      editParamId: 0,
      editTestId: 0,
      editTestItemId: 0,
      editTestValueId: 0,
      dialogTitle: '',
      issueId: 0,
      issue_detail: {}
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
    console.log('xxxxxx')
    this.issueId = parseInt(this.$route.params.issue_num)
    console.log('issueId', this.issueId)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Promise.all([
        getIssueStatus(), 
        getIssueTracker(), 
        getIssuePriority(),
        getIssue(this.issueId)
      ]).then(res => {
        this.issueStatusList = res[0].data.map(item => {
          return {'label': item.name, 'value': item.id}
        })
        this.issueTypeList = res[1].data.map(item => {
          return {'label': item.name, 'value': item.id}
        })
        this.issuePriorityList = res[2].data.map(item => {
          return {'label': item.name, 'value': item.id}
        })
        this.issueDetail = res[3].data
        this.issueDetail.issueStatus = this.issueDetail.status.id
        this.issueDetail.issueAssignee = this.issueDetail.tracker.id
        this.issueDetail.issuePriority = this.issueDetail.priority.id
        this.issueDetail.issueDoneRatio = this.issueDetail.done_ratio
        this.issueDetail.issueType = this.issueDetail.tracker.id
        this.issueStartDate = this.issueDetail.start_date
        this.issueDueDate = this.issueDetail.due_date
        
        this.issueDescription = this.issueDetail.description
        console.log(this.issueStartDate)
        this.listLoading = false
      });
      // getIssue(this.issueId).then(response => {
      //   this.issue_detail = response.data
      //   this.listLoading = false
      // })
      // TODO: get issue setup
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
    showDemandDialog(demand, title) {
      this.editDemandId = demand == '' ? 0 : demand.id
      this.dialogTitle = title
      this.demandDialogVisible = true
    },
    showParamDialog(param, title) {
      this.editParamId = param == '' ? 0 : param.id
      this.dialogTitle = title
      this.paramDialogVisible = true
    },
    showTestDialog(test, title) {
      this.editTestId = test == '' ? 0 : test.id
      this.dialogTitle = title
      this.testDialogVisible = true
    },
    showTestItemDialog(testItem, title) {
      this.editTestItemId = testItem == '' ? 0 : testItem.id
      this.dialogTitle = title
      this.testItemDialogVisible = true
    },
    showTestValueDialog(testValue, title) {
      this.editTestValueId = testValue == '' ? 0 : testValue.id
      this.dialogTitle = title
      this.testValueDialogVisible = true
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    },
    handleUpdate() {
      
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-card class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px;padding-bottom: 10px;">Issue #{{ issueId }}</span>
        <el-button class="filter-item" size="small" type="success" style="float: right">
          Save
        </el-button>
        <div>{{ issueDescription }}</div>
      </div>
      <el-form ref="form" label-width="20%" :label-position="'right'">
        <el-row>
          <el-col :span="6">
            <el-form-item label="Priority" label-width="100px">
              <el-select v-model="issueDetail.issuePriority" style="width:100%">
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
              <el-select v-model="issueDetail.issueStatus" style="width:100%">
                <el-option
                  v-for="item in issueStatusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Assignee" label-width="100px">
              <el-select v-model="issueDetail.issueAssignee" style="width:100%">
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
              <el-select v-model="issueDetail.issueType" style="width:100%">
                <el-option
                  v-for="item in issueTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="Done Ratio" label-width="100px">
              <el-input-number 
                v-model="issueDetail.issueDoneRatio" 
                :min="0" 
                :max="10"
                style="width:100%"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Start Date" label-width="100px">
                {{ issueStartDate }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Due Date" label-width="100px">
                {{ issueDueDate }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <el-tabs
      v-model="activeName"
      type="border-card"
      style="margin-top: 10px"
    >
      <el-tab-pane label="Comment" name="comment">
        <el-button type="primary" @click="commentDialogVisible = true">Add Comment</el-button>
        <el-table
          :data="issueComment"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
          style="margin-top: 10px"
        >
          <el-table-column label="Comment">
            <template slot-scope="scope">
              {{ scope.row.comment }}
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
      <el-tab-pane label="Demand" name="demand">
        <el-button type="primary" @click="showDemandDialog('', 'Add Demand')">Add Demand</el-button>
        <el-table
          :data="issueDemand"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
          style="margin-top: 10px"
        >
          <el-table-column label="Order">
            <template slot-scope="scope">
              {{ scope.row.order }}
            </template>
          </el-table-column>
          <el-table-column label="Step Name">
            <template slot-scope="scope">
              <span
                @click="showDemandDialog(scope.row, 'Edit Demand')"
                style="color: #409EFF;cursor: pointer;"
              >
              {{ scope.row.step_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Step Type">
            <template slot-scope="scope">
              {{ scope.row.step_type }}
            </template>
          </el-table-column>
          <el-table-column label="Desc.">
            <template slot-scope="scope">
              {{ scope.row.step_desc }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Parameter" name="parameter">
        <el-button type="primary" @click="showParamDialog('', 'Add Parameter')">Add Parameter</el-button>
        <el-table
          :data="issueParam"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
          style="margin-top: 10px"
        >
          <el-table-column label="Order">
            <template slot-scope="scope">
              {{ scope.row.order }}
            </template>
          </el-table-column>
          <el-table-column label="Name">
            <template slot-scope="scope">
              <span
                @click="showParamDialog(scope.row, 'Edit Parameter')"
                style="color: #409EFF;cursor: pointer;"
              >
              {{ scope.row.param_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Type">
            <template slot-scope="scope">
              {{ scope.row.param_type }}
            </template>
          </el-table-column>
          <el-table-column label="Desc.">
            <template slot-scope="scope">
              {{ scope.row.param_desc }}
            </template>
          </el-table-column>
          <el-table-column label="Limit">
            <template slot-scope="scope">
              {{ scope.row.param_limit }}
            </template>
          </el-table-column>
          <el-table-column label="Length">
            <template slot-scope="scope">
              {{ scope.row.param_length }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test" name="test">
        <el-button type="primary" @click="showTestDialog('', 'Add Test')">Add Test</el-button>
        <el-table
          :data="issueTest"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
          style="margin-top: 10px"
        >
          <el-table-column label="API Name">
            <template slot-scope="scope">
              <span
                @click="showTestDialog(scope.row, 'Edit API')"
                style="color: #409EFF;cursor: pointer;"
              >
              {{ scope.row.api_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="API Method">
            <template slot-scope="scope">
              {{ scope.row.api_method }}
            </template>
          </el-table-column>
          <el-table-column label="API URL">
            <template slot-scope="scope">
              {{ scope.row.api_url }}
            </template>
          </el-table-column>
          <el-table-column label="Desc.">
            <template slot-scope="scope">
              {{ scope.row.api_desc }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test Item" name="testItem">
        <el-button type="primary" @click="showTestItemDialog('', 'Add Test Item')">Add Test Item</el-button>
        <el-table
          :data="issueTestItem"
          element-loading-text="Loading"
          border
          fit
          style="margin-top: 10px"
        >
          <el-table-column label="Order">
            <template slot-scope="scope">
              <span
                @click="showTestItemDialog(scope.row, 'Edit Test Item')"
                style="color: #409EFF;cursor: pointer;"
              >
              {{ scope.row.order }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Item">
            <template slot-scope="scope">
              {{ scope.row.item_name }}
            </template>
          </el-table-column>
          <el-table-column label="Is Success?">
            <template slot-scope="scope">
              {{ scope.row.item_is_success }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test Value" name="testValue">
        <el-button 
          type="primary" 
          @click="showTestValueDialog('', 'Add Test Value')"
        >
          Add Test Value
        </el-button>
        <el-table
          :data="issueTestValue"
          element-loading-text="Loading"
          border
          fit
          style="margin-top: 10px"
        >
          <el-table-column label="Type">
            <template slot-scope="scope">
              <span
                @click="showTestValueDialog(scope.row, 'Edit Test Value')"
                style="color: #409EFF;cursor: pointer;"
              >
              {{ scope.row.value_type }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Key">
            <template slot-scope="scope">
              {{ scope.row.value_key }}
            </template>
          </el-table-column>
          <el-table-column label="Value">
            <template slot-scope="scope">
              {{ scope.row.value }}
            </template>
          </el-table-column>
          <el-table-column label="Location">
            <template slot-scope="scope">
              {{ scope.row.value_location }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="Add Comment"
      :visible="commentDialogVisible"
      width="70%"
      @close="commentDialogVisible = false"
    >
      <WangEditor>
      </WangEditor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="commentDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdate">Confirm</el-button>
      </span>
    </el-dialog>
    <demand-dialog
      :dialog-title="dialogTitle"
      :demand-id="editDemandId"
      :dialog-visible="demandDialogVisible"
      @demand-dialog-visible="demandDialogVisible = false"
    />
    <param-dialog
      :dialog-title="dialogTitle"
      :param-id="editParamId"
      :dialog-visible="paramDialogVisible"
      @param-dialog-visible="paramDialogVisible = false"
    />
    <test-dialog
      :dialog-title="dialogTitle"
      :test-id="editTestId"
      :dialog-visible="testDialogVisible"
      @test-dialog-visible="testDialogVisible = false"
    />
    <test-item-dialog
      :dialog-title="dialogTitle"
      :test-item-id="editTestItemId"
      :dialog-visible="testItemDialogVisible"
      @testItem-dialog-visible="testItemDialogVisible = false"
    />
    <test-value-dialog
      :dialog-title="dialogTitle"
      :test-value-id="editTestValueId"
      :dialog-visible="testValueDialogVisible"
      @testValue-dialog-visible="testValueDialogVisible = false"
    />
  </div>
</template>
<style lang="scss">
  .filter-container {
    margin-bottom: 5px;
  }
</style>