<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import FlowDialog from './components/FlowDialog'
import ParamDialog from './components/ParamDialog'
import WangEditor from '@/components/Wangeditor'
import { getIssueStatus, getIssueTracker, getIssuePriority, updateIssue } from '@/api/issue'
import { getProjectAssignable } from '@/api/projects'
import { getFlowByIssue, addFlowByIssue, deleteFlow, getFlowType } from '@/api/issueFlow'
import { getParameterByIssue, addParameterByIssue } from '@/api/issueParameter'
export default {
  components: {
    FlowDialog,
    ParamDialog,
    Pagination,
    WangEditor
  },
  data() {
    return {
      topicAssigneeList: [
        {
          value: '王曉明',
          label: '王曉明'
        },
        {
          value: '陳聰明',
          label: '陳聰明'
        }
      ],
      topicTypeList: [
        {
          value: '任務',
          label: '任務'
        },
        {
          value: '問題',
          label: '問題'
        }
      ],
      topicVersionList: [
        {
          value: '1.0',
          label: '1.0'
        },
        {
          value: '1.1',
          label: '1.1'
        }
      ],
      topicStatusList: [
        {
          value: '新建立',
          label: '新建立'
        },
        {
          value: '已完結',
          label: '已完結'
        },
        {
          value: '測試中',
          label: '測試中'
        },
        {
          value: '已完成',
          label: '已完成'
        },
        {
          value: '開發中',
          label: '開發中'
        }
      ],
      topicPriorityList: [
        {
          value: '高',
          label: '高'
        },
        {
          value: '中',
          label: '中'
        }
      ],
      topicBranchList: [
        {
          value: 'master',
          label: 'master'
        },
        {
          value: 'develop',
          label: 'develop'
        }
      ],
      topicName: '登入頁面',
      topicEstimate: '30H',
      topicPriority: '高',
      topicType: '任務',
      topicVersion: '1.0',
      topicAssignee: '王曉明',
      topicStatus: '新建立',
      topicProcess: '30%',
      topicBranch: 'master',
      topicStart: '2020-08-15',
      topicEnd: '2020-08-20',
      topicDesc: '使用者於登入頁面需輸入帳號密碼進行登入，並有忘記密碼的選項',
      topicDevStatus: {
        commitMsg: 'V2.1 fix User Login Error',
        commit: '1c715b2b',
        commitData: '2020-07-25T07:20:11Z',
        last_test_result: {
          success: 10,
          total: 15
        }
      },
      topicNeedTest: true,
      detailFlow: [
        {
          id: 1,
          order: 1,
          step_name: '設定帳號',
          step_type: 'GIVEN',
          step_desc: '設定帳號參數'
        },
        {
          id: 2,
          order: 2,
          step_name: '設定密碼',
          step_type: 'GIVEN',
          step_desc: '設定密碼參數'
        },
        {
          id: 3,
          order: 3,
          step_name: '登入',
          step_type: 'WHEN',
          step_desc: '點擊登入按鈕，讓使用者登入平台'
        },
        {
          id: 4,
          order: 4,
          step_name: '登入頁面',
          step_type: 'THEN',
          step_desc: '登入回傳成功, 導入平台首頁'
        }
      ],
      detailParam: [
        {
          id: 1,
          param_name: '帳號',
          param_type: '文字',
          param_desc: '',
          param_limit: '09[0-9]',
          param_length: 10
        },
        {
          id: 2,
          param_name: '密碼',
          param_type: '文字',
          param_desc: '',
          param_limit: '',
          param_length: ''
        },
        {
          id: 3,
          param_name: '姓名',
          param_type: '文字',
          param_desc: '',
          param_limit: '',
          param_length: ''
        },
        {
          id: 4,
          param_name: '身份證字號',
          param_type: '文字',
          param_desc: '',
          param_limit: '[A-Z]{1}[0-9]{9}',
          param_length: 10
        }
      ],
      detailComment: [
        {
          comment:
            'Subject changed from iServCloud 修改backend scheduler, 定期去檢查FT VM 到何運算節點，並把資訊到 nova DB to iServCloud 修改backend scheduler, 定期去檢查FT VM 到何運算節點，並把資訊更新到 nova DB',
          comment_author: '王聰明',
          comment_at: '2020-07-03 11:11:09'
        },
        {
          comment: '使用Git 觸發 Jenkins進行自動包版，自動安裝，自動測試。',
          comment_author: '張婉婷',
          comment_at: '2020-07-04 08:11:09'
        }
      ],
      activeName: 'comment',
      commentDialogVisible: false,
      flowDialogVisible: false,
      paramDialogVisible: false,
      editFlowId: 0,
      editParamId: 0,
      dialogTitle: ''
    }
  },
  computed: {
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.topicList.slice(start, end)
    }
  },
  async created() {
    // TODO: get project topic list
    this.listLoading = false
  },
  mounted() {
    this.issueId = parseInt(this.$route.params.topicId)
    // console.log(this.$route.params.topicId)
    this.fetchData()
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    fetchData() {
      Promise.all([getIssueStatus(), getIssueTracker(), getIssuePriority(), getIssue(this.issueId)]).then(res => {
        this.issueStatusList = res[0].data.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issueTypeList = res[1].data.map(item => {
          return { label: item.name, value: item.id }
        })
        this.issuePriorityList = res[2].data.map(item => {
          return { label: item.name, value: item.id }
        })
        const issueDetail = res[3]
        const projectId = issueDetail.project.id
        getProjectAssignable(projectId).then(assignable => {
          this.issueAssigneeList = assignable.data.user_list.map(item => {
            return { label: item.name, value: item.id }
          })
        })

        this.issueDetail.issueStatus = issueDetail.status.id
        this.issueDetail.issueAssignee = issueDetail.tracker.id
        this.issueDetail.issuePriority = issueDetail.priority.id
        this.issueDetail.issueDoneRatio = issueDetail.done_ratio
        this.issueDetail.issueType = issueDetail.tracker.id
        this.issueStartDate = issueDetail.start_date
        this.issueDueDate = issueDetail.due_date
        this.issueDescription = issueDetail.description
        this.projectId = issueDetail.project.id
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
      this.editFlowId = flow == '' ? 0 : flow.id
      this.dialogTitle = title
      this.flowDialogVisible = true
    },
    showParamDialog(param, title) {
      this.editParamId = param == '' ? 0 : param.id
      this.dialogTitle = title
      this.paramDialogVisible = true
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-form ref="form" label-width="20%" :label-position="right">
      <el-row>
        <el-col :span="8">
          <el-form-item label="Name" label-width="100px">
            <el-input v-model="topicName" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Estimate" label-width="100px">
            <el-input v-model="topicEstimate" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Priority" label-width="100px">
            <el-select v-model="topicPriority" style="width:100%">
              <el-option v-for="item in topicPriorityList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Assignee" label-width="100px">
            <el-select v-model="topicAssignee" style="width:100%">
              <el-option v-for="item in topicAssigneeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Version" label-width="100px">
            <el-select v-model="topicVersion" style="width:100%">
              <el-option v-for="item in topicVersionList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Type" label-width="100px">
            <el-select v-model="topicType" style="width:100%">
              <el-option v-for="item in topicTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Status" label-width="100px">
            <el-select v-model="topicStatus" style="width:100%">
              <el-option v-for="item in topicStatusList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Process" label-width="100px">
            <el-input v-model="topicProcess" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Branch" label-width="100px">
            <el-select v-model="topicBranch" style="width:100%">
              <el-option v-for="item in topicBranchList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Start" label-width="100px">
            <el-date-picker type="date" v-model="topicStart" placeholder="Select Date" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="End" label-width="100px">
            <el-date-picker type="date" v-model="topicEnd" placeholder="Select Date" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Need Test?" label-width="100px">
            <el-checkbox v-model="topicNeedTest" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Dev Status" label-width="100px">
            <div>
              {{ topicDevStatus.commitMsg }}
            </div>
            <div>
              {{ topicDevStatus.commitData | relativeTime }}
              <el-tag>{{ topicDevStatus.commit }}</el-tag>
              <el-tag :type="returnTagType(topicDevStatus)" size="large">
                <i v-if="returnTagType(topicDevStatus) === 'success'" class="el-icon-success" />
                <i v-else-if="returnTagType(topicDevStatus) === 'danger'" class="el-icon-error" />
                <i v-else class="el-icon-error" />
                <span>{{ testResults(topicDevStatus) }}</span>
              </el-tag>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Desc." label-width="100px">
            <el-input type="textarea" v-model="topicDesc"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-tabs v-model="activeName" type="border-card" class="mt-2" @tab-click="handleClick">
      <el-tab-pane label="Comment" name="comment">
        <el-button type="primary" @click="commentDialogVisible = true">Add Comment</el-button>
        <el-table
          :data="detailComment"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
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
      <el-tab-pane label="Flow" name="flow">
        <el-button type="primary" @click="showFlowDialog('', 'Add Flow')">Add Flow</el-button>
        <el-table
          :data="detailFlow"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
        >
          <el-table-column label="Order">
            <template slot-scope="scope">
              {{ scope.row.order }}
            </template>
          </el-table-column>
          <el-table-column label="Step Name">
            <template slot-scope="scope">
              <span @click="showFlowDialog(scope.row, 'Edit Flow')" style="color: #409EFF;cursor: pointer;">
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
          :data="detailParam"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
        >
          <el-table-column label="Name">
            <template slot-scope="scope">
              <span @click="showParamDialog(scope.row, 'Edit Parameter')" style="color: #409EFF;cursor: pointer;">
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
    </el-tabs>
    <el-dialog title="Add Comment" :visible="commentDialogVisible" width="70%" @close="commentDialogVisible = false">
      <WangEditor :wiki-content="wikiContent" @get-editor-data="emitGetEditorData" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="commentDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdate">Confirm</el-button>
      </span>
    </el-dialog>
    <flow-dialog
      :dialog-title="dialogTitle"
      :flow-id="editFlowId"
      :dialog-visible="flowDialogVisible"
      @flow-dialog-visible="flowDialogVisible = false"
    />
    <param-dialog
      :dialog-title="dialogTitle"
      :param-id="editParamId"
      :dialog-visible="paramDialogVisible"
      @param-dialog-visible="paramDialogVisible = false"
    />
  </div>
</template>
