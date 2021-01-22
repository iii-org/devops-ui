<script>
import { IssueForm, CommentTab, FlowTab, ParameterTab, FileTab } from './components'
import { getIssue } from '@/api/issue'
import { getFlowByIssue, getFlowType } from '@/api/issueFlow'
import { getParameterByIssue } from '@/api/issueParameter'

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
      issueDescription: '',
      activeName: 'comment',
      issueId: 0,
      projectId: 0,
      author: '',

      issueComment: [],
      issueFlow: [],
      issueParameter: [],
      issueFile: [],

      formData: {
        subject: '',
        assigned_to_id: '',
        fixed_version_id: '',
        tracker_id: null,
        status_id: null,
        priority_id: null,
        estimated_hours: 0,
        done_ratio: 0,
        start_date: '',
        due_date: '',
        description: ''
      },

      parentId: null,
      issueLink: ''
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
      Promise.all([
        getIssue(this.issueId),
        getFlowType(),
        getFlowByIssue(this.issueId),
        getParameterByIssue(this.issueId)
      ]).then(res => {
        const [issueDetail, flowTypeList, flowList, parameterList] = res.map(item => item.data)

        this.projectId = issueDetail.project.id
        this.author = issueDetail.author.name
        this.parentId = issueDetail.parent_id
        this.issueLink = issueDetail.issue_link

        this.issueComment = issueDetail.journals.map(item => {
          return {
            comment: item.notes,
            comment_author: item.user.name,
            comment_at: item.created_on
          }
        })

        this.issueFlow = []
        if (Array.isArray(flowList) && flowList.length > 0) {
          this.issueFlow = flowList[0].flow_data.map(item => {
            const issueType = flowTypeList.find(type => {
              return type.flow_type_id === item.type_id
            })
            item['type_name'] = issueType ? issueType['name'] : ''
            return item
          })
        }

        this.issueParameter = parameterList
        this.issueFile = issueDetail.attachments

        this.formData.subject = issueDetail.subject
        issueDetail.assigned_to
          ? (this.formData.assigned_to_id = issueDetail.assigned_to.id)
          : (this.formData.assigned_to_id = '')
        issueDetail.fixed_version
          ? (this.formData.fixed_version_id = issueDetail.fixed_version.id)
          : (this.formData.fixed_version_id = '')
        this.formData.tracker_id = issueDetail.tracker.id
        this.formData.status_id = issueDetail.status.id
        this.formData.priority_id = issueDetail.priority.id
        this.formData.estimated_hours = issueDetail.estimated_hours
        this.formData.done_ratio = issueDetail.done_ratio
        this.formData.start_date = issueDetail.start_date
        issueDetail.due_date === null ? (this.formData.due_date = '') : (this.formData.due_date = issueDetail.due_date)
        issueDetail.description === null
          ? (this.formData.description = '')
          : (this.formData.description = issueDetail.description)
      })
    }
  }
}
</script>

<template>
  <div class="app-container d-flex">
    <el-card class="box-card el-col-10 column custom-list" shadow="never">
      <IssueForm
        v-if="projectId !== 0"
        :issue-id="issueId"
        :project-id="projectId"
        :parent-id="parentId"
        :author="author"
        :issue-form-ref="formData"
        :issue-link="issueLink"
        @updated="fetchData"
      />
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
