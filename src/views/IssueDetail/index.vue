<template>
  <div class="app-container">
    <el-card class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px;padding-bottom: 10px;">Issue #{{ issueId }}</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="editIssueDialogVisible = true">
          Edit
        </el-button>
        <div>{{ issue_detail.description }}</div>
      </div>
      <div>
        <el-row :gutter="20" class="mb-5">
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Priority</el-col>
              <el-col :span="18">
                <el-tag v-if="issue_detail.priority.name === '特急'" type="danger" size="medium">{{
                  issue_detail.priority.name
                }}</el-tag>
                <el-tag v-else-if="issue_detail.priority.name === '急'" type="warning" size="medium">{{
                  issue_detail.priority.name
                }}</el-tag>
                <el-tag v-else-if="issue_detail.priority.name === '一般'" size="medium">{{
                  issue_detail.priority.name
                }}</el-tag>
                <el-tag v-else type="success" size="medium">{{ issue_detail.priority.name }}</el-tag>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Start Date</el-col>
              <el-col :span="18">{{ issue_detail.start_date }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Process</el-col>
              <el-col :span="18">
                <el-progress :text-inside="true" :stroke-width="26" :percentage="issue_detail.done_ratio" />
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Status</el-col>
              <el-col :span="18">{{ issue_detail.status.name }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Due Date</el-col>
              <el-col :span="18">{{ issue_detail.due_date }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Type</el-col>
              <el-col :span="18">{{ issue_detail.tracker.name }}</el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-tabs v-model="activeName" type="border-card" class="mt-2" @tab-click="handleClick">
      <el-tab-pane label="Content" name="content">
        <el-button type="primary" @click="addContentDialogVisible = true">Add Content</el-button>
        <el-table
          v-loading="listLoading"
          :data="issue_detail.journals"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
          class="mt-2"
        >
          <el-table-column label="Description">
            <template slot-scope="scope">
              {{ scope.row.notes }}
            </template>
          </el-table-column>
          <el-table-column label="Create User" width="180">
            <template slot-scope="scope">
              {{ scope.row.user.name }}
            </template>
          </el-table-column>
          <el-table-column label="Create Time" width="180">
            <template slot-scope="scope">
              {{ scope.row.created_on }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- <el-tab-pane label="Feature" name="feature">
        <el-button type="primary">Add API</el-button>
        <el-button type="primary">API Test Plan</el-button>
        <el-table
          v-loading="listLoading"
          :data="issue_detail.features"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
          class="mt-2"
        >
          <el-table-column label="API Name" width="160">
            <template slot-scope="scope">
              <span style="color: #409EFF">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="API URL" width="160">
            <template slot-scope="scope">
              {{ scope.row.url }}
            </template>
          </el-table-column>
          <el-table-column label="Description">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column label="Last Update Time" width="160">
            <template slot-scope="scope">
              {{ scope.row.last_update_at }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane> -->
    </el-tabs>
    <add-content :dialog-visible.sync="addContentDialogVisible" @issue-dialog-visible="emitAddContentDialogVisible" />
    <edit-issue
      :dialog-visible.sync="editIssueDialogVisible"
      :issue-done-ratio-val="issue_detail.done_ratio"
      :issue-status-val="issue_detail.status.id"
      :issue-tracker-val="issue_detail.tracker.id"
      :issue-priority-val="issue_detail.priority.id"
      :issue-start-date-val="issue_detail.start_date"
      :issue-due-date-val="issue_detail.due_date"
      :issue-description-val="issue_detail.description"
      :issue-id-val="issueId"
      @issue-dialog-visible="emitEditIssueDialogVisible"
      @update-issue="emitUpdateIssue"
    />
  </div>
</template>

<script>
import { getIssue, updateIssue } from '@/api/issue'
import EditIssue from './components/EditIssue'
import AddContent from './components/AddContent'
// import Pagination from '@/components/Pagination'

export default {
  components: {
    EditIssue,
    AddContent
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      activeName: 'content',
      issue_detail: {
        priority: { name: '' },
        status: { name: '' },
        tracker: { name: '' }
      },
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      editIssueDialogVisible: false,
      addContentDialogVisible: false,
      issueId: 0
    }
  },
  mounted() {
    this.issueId = parseInt(this.$route.params.issue_num)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getIssue(this.issueId).then(response => {
        this.issue_detail = response.data
        this.listLoading = false
      })
    },
    handleClick() {},
    emitEditIssueDialogVisible(visible) {
      this.editIssueDialogVisible = visible
    },
    emitAddContentDialogVisible(visible) {
      this.addContentDialogVisible = visible
    },
    async emitUpdateIssue(data) {
      await updateIssue(this.issueId, data)
      this.editIssueDialogVisible = false
      this.fetchData()
    }
  }
}
</script>
