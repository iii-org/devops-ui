<script>
import { IssueForm, CommentTab, FlowTab, ParameterTab, FileTab } from './components'
import { getIssue } from '@/api/issue'
import { getFlowByIssue, getFlowType } from '@/api/issueFlow'
import { getParameterByIssue } from '@/api/issueParameter'
// import { getTestCaseByIssue } from '@/api/issueTestCase'
// import { getTestItemByCase } from '@/api/issueTestItem'
// import { getTestValueByItem, getTestValueType, getTestValueLocation } from '@/api/issueTestValue'

export default {
  name: 'ProjectIssueDetail',
  components: {
    IssueForm,
    CommentTab,
    FlowTab,
    ParameterTab,
    FileTab
  },

  data() {
    return {
      // issueName: '',
      // issueStartDate: '',
      // issueDueDate: '',
      issueDescription: '',
      activeName: 'comment',
      issueId: 0,
      projectId: 0,
      author: '',
      issueLoading: false,

      // CommentTab
      issueComment: [],
      // FlowTab
      issueFlow: [],
      // ParameterTab
      issueParameter: [],
      // FileTab
      issueFile: [],

      formData: {}

      // issueDevStatus: {
      //   commitMsg: 'V2.1 fix User Login Error',
      //   commit: '1c715b2b',
      //   commitData: '2020-07-25T07:20:11Z',
      //   last_test_result: {
      //     success: 10,
      //     total: 15
      //   }
      // },
      // issueNeedTest: true,
      // issueTestCase: [],
      // issueTestItem: [],
      // issueTestValue: [],
      // editTestId: 0,
      // editTestItemId: 0,
      // editTestValueId: 0,
      // issue_detail: {},
      // choose_testCase: '',
      // choose_testItem: '',
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
      this.issueLoading = true
      Promise.all([
        getIssue(this.issueId),
        getFlowByIssue(this.issueId),
        getFlowType(),
        getParameterByIssue(this.issueId)
        // getTestCaseByIssue(this.issueId)
      ]).then(res => {
        const issueDetail = res[0].data
        this.projectId = issueDetail.project.id
        this.author = issueDetail.author.name
        // fetch issue flow type
        const issueFlowType = res[2].data
        // fetch comment
        this.issueComment = issueDetail.journals.map(item => {
          return {
            comment: item.notes,
            comment_author: item.user.name,
            comment_at: item.created_on
          }
        })

        // fetch flow
        this.issueFlow = []
        if (Array.isArray(res[1].data) && res[1].data.length > 0) {
          this.issueFlow = res[1].data[0].flow_data.map(item => {
            const issueType = issueFlowType.find(type => {
              return type.flow_type_id === item.type_id
            })
            item['type_name'] = issueType ? issueType['name'] : ''
            return item
          })
        }

        // fetch parameter
        this.issueParameter = res[3].data

        // fetch file
        this.issueFile = issueDetail.attachments

        this.formData.subject = issueDetail.subject
        if (issueDetail.assigned_to) this.formData.assigned_to_id = issueDetail.assigned_to.id
        if (issueDetail.fixed_version) this.formData.fixed_version_id = issueDetail.fixed_version.id
        this.formData.tracker_id = issueDetail.tracker && issueDetail.tracker.id
        this.formData.status_id = issueDetail.status && issueDetail.status.id
        this.formData.priority_id = issueDetail.priority && issueDetail.priority.id
        this.formData.estimated_hours = issueDetail.estimated_hours && issueDetail.estimated_hours
        this.formData.done_ratio = issueDetail.done_ratio && issueDetail.done_ratio
        this.formData.start_date = issueDetail.start_date && issueDetail.start_date
        this.formData.due_date = issueDetail.due_date && issueDetail.due_date
        this.formData.description = issueDetail.description && issueDetail.description

        this.issueLoading = false
        // this.issueTestCase = res[4].data
      })
    }

    // returnTagType(row) {
    //   const { success, total } = row.last_test_result
    //   return success === total ? 'success' : 'danger'
    // },

    // testResults(row) {
    //   const { success, total } = row.last_test_result
    //   return success + ' / ' + total
    // },

    // async getTestItem(case_id) {
    //   this.choose_testItem = ''
    //   this.issueTestValue = []
    //   const testItemList = await getTestItemByCase(case_id)
    //   if (testItemList.data.length > 0) {
    //     this.issueTestItem = testItemList.data
    //   } else {
    //     this.issueTestItem = []
    //   }
    // },

    // async getTestValue(item_id) {
    //   const testValueList = await getTestValueByItem(item_id)
    //   const testValueTypeRes = await getTestValueType()
    //   const testValueTypeList = testValueTypeRes.data
    //   const testValueLocationRes = await getTestValueLocation()
    //   const testValueLocationList = testValueLocationRes.data

    //   if (testValueList.data.length > 0) {
    //     this.issueTestValue = testValueList.data.map(item => {
    //       const valueType = testValueTypeList.find(type => {
    //         return item.type_id === type.type_id
    //       })
    //       item.type = valueType.type_name
    //       const valueLocation = testValueLocationList.find(location => {
    //         return item.location_id === location.location_id
    //       })
    //       item.location = valueLocation.type_name
    //       return item
    //     })
    //   } else {
    //     this.issueTestValue = []
    //   }
    // }

    // handleExceed(files, fileList) {
    //   this.$message.warning(`Only one file can be added at a time, please delete the existing file first`)
    // }
  }
}
</script>

<template>
  <div class="app-container d-flex">
    <el-card v-loading="issueLoading" class="box-card el-col-10 column custom-list" shadow="never">
      <IssueForm v-if="projectId !== 0" :issue-id="issueId" :project-id="projectId" :author="author" :issue-form-ref="formData" @updated="fetchData" />
    </el-card>

    <el-tabs v-model="activeName" type="border-card" class="el-col-14 column">
      <el-tab-pane :label="$t('Issue.Comment')" name="comment">
        <CommentTab :issue-id="issueId" :issue-comment="issueComment" @updated="fetchData" />
      </el-tab-pane>

      <el-tab-pane :label="$t('Issue.Flow')" name="flow">
        <FlowTab :issue-id="issueId" :issue-flow="issueFlow" @updated="fetchData" />
      </el-tab-pane>

      <el-tab-pane :label="$t('Issue.Parameter')" name="parameter">
        <ParameterTab :issue-id="issueId" :issue-parameter="issueParameter" @updated="fetchData" />
      </el-tab-pane>

      <el-tab-pane :label="$t('File.File')" name="file">
        <FileTab :issue-id="issueId" :issue-file="issueFile" @updated="fetchData" />
      </el-tab-pane>
    </el-tabs>
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
