<template>
  <div class="app-container">
    <div>
      <h3>
        Project:
        <span>
          <el-select v-model="value" filterable placeholder="select project">
            <el-option
              v-for="item in projectList"
              :key="item.project_name"
              :label="item.project_name"
              :value="item.project_name">
            </el-option>
          </el-select>
        </span>
      </h3>
    </div>
    <el-divider />
    <div class="block" style="margin-top:10px">
      <el-timeline>
        <el-timeline-item
          v-for="(log, index1) in logs"
          :key="index1"
          v-loading="listLoading"
          :timestamp="log.logs_date"
          placement="top"
        >
          <el-card>
            <el-row v-for="(content,index2) in log.logs" :key="index2" :gutter="20">
              <el-col :span="4">
                <span style="margin-right: 5px;font-weight: 500;">{{ content.log_at }}</span>
                <span>{{ content.user }}</span>
              </el-col>
              <el-col :span="20">
                <div>{{ content.description }}</div>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script>
import { getActivityLog, getProjectList } from '@/api/projects'

export default {
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
      logs: [],
      listLoading: true,
      projectList: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getActivityLog('aaa').then(res => {
        this.logs = res.data.logs
        this.listLoading = false
      })
      getProjectList().then(res => {
        this.projectList = res.data.items
      })
    }
  }
}
</script>
