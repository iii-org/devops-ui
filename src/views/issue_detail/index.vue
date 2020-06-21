<template>
  <div class="app-container">
    <el-card class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <div style="font-size: 25px;padding-bottom: 10px;">Issue #{{ $route.params.issue_num }}</div>
        <div>{{ issue_detail.description }}</div>
      </div>
      <div>
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Priority</el-col>
              <el-col :span="18">
                <el-tag v-if="issue_detail.priority === 'Urgent'" type="danger" size="medium">{{ issue_detail.priority }}</el-tag>
                <el-tag v-else-if="issue_detail.priority === 'High'" type="warning" size="medium">{{ issue_detail.priority }}</el-tag>
                <el-tag v-else-if="issue_detail.priority === 'Normal'" size="medium">{{ issue_detail.priority }}</el-tag>
                <el-tag v-else type="success" size="medium">{{ issue_detail.priority }}</el-tag>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Start Time</el-col>
              <el-col :span="18">{{ issue_detail.start_time }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Process</el-col>
              <el-col :span="18">
                <el-progress :text-inside="true" :stroke-width="26" :percentage="issue_detail.process" />
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Status</el-col>
              <el-col :span="18">{{ issue_detail.status }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">End Time</el-col>
              <el-col :span="18">{{ issue_detail.end_time }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row :gutter="20">
              <el-col :span="6">Type</el-col>
              <el-col :span="18">{{ issue_detail.type }}</el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-tabs
      v-model="activeName"
      type="border-card"
      style="margin-top: 10px"
      @tab-click="handleClick"
    >
      <el-tab-pane label="Content" name="content">
        <el-button type="primary">Add Content</el-button>
        <el-table
          v-loading="listLoading"
          :data="issue_detail.custom_fields"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
          style="margin-top: 10px"
        >
          <el-table-column label="Description">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="Create Time" width="180">
            <template slot-scope="scope">
              {{ scope.row.create_time }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Feature" name="feature">Feature</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getIssue } from '@/api/issue'
// import Pagination from '@/components/Pagination'

export default {
  // components: { Pagination },
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
      issue_detail: {},
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getIssue(this.$route.params.issue_num).then(response => {
        this.issue_detail = response.data
        this.listLoading = false
      })
    }
  }
}
</script>
