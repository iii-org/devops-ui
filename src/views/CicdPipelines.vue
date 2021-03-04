<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="pipelines"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
    >
      <el-table-column label="Index" align="center" width="70">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" align="center" width="100">
        <template slot-scope="scope">
          <i
            v-if="scope.row.status.success === scope.row.status.total"
            class="el-icon-circle-check"
            style="color: #67c23a"
          />
          <span
            v-if="scope.row.status.success === scope.row.status.total"
            style="color: #67c23a"
          >{{ scope.row.status.success }}/{{ scope.row.status.total }}</span>
          <i
            v-if="scope.row.status.success !== scope.row.status.total"
            class="el-icon-circle-check"
            style="color: #c8c8c8"
          />
          <span
            v-if="scope.row.status.success !== scope.row.status.total"
            style="color: #c8c8c8"
          >{{ scope.row.status.success }}/{{ scope.row.status.total }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Branch" width="150">
        <template slot-scope="scope">
          {{ scope.row.commit_branch }}
        </template>
      </el-table-column>
      <el-table-column label="Commit">
        <template slot-scope="scope">
          <div style="color: #409EFF">{{ scope.row.commit }}</div>
          <div>{{ scope.row.commit_message }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Last Test Time" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.last_test_time | relativeTime }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getPipelines } from '@/api/cicd'

export default {
  data() {
    return {
      pipelines: null,
      listLoading: true
    }
  },
  created() {
    if (!this.$route.params.pId) return
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getPipelines(this.$route.params.pId).then(response => {
        this.pipelines = response.data
        this.listLoading = false
      })
    }
  }
}
</script>
