<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="pipelines"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
    >
      <el-table-column label="Index" align="center" width="70">
        <template slot-scope="scope">
          <router-link :to="'/cicd/pipelines/'+scope.row.index+'/stages'" style="color: #409EFF">
            <span>{{ scope.row.index }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'Failed'" type="danger" size="medium" effect="plain">
            <i class="el-icon-circle-close" /> {{ scope.row.status }}
          </el-tag>
          <el-tag v-else-if="scope.row.status === 'Running'" size="medium" effect="plain">
            <i class="el-icon-loading" /> {{ scope.row.status }}
          </el-tag>
          <el-tag v-else type="success" size="medium" effect="plain">
            <i class="el-icon-circle-check" /> {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Stages" align="center" width="70">
        <template slot-scope="scope">
          <span>{{ scope.row.current_stages }}/{{ scope.row.total_stages }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Branch" width="150">
        <template slot-scope="scope">
          {{ scope.row.branch }}
        </template>
      </el-table-column>
      <el-table-column label="Trigger" width="150">
        <template slot-scope="scope">
          {{ scope.row.trigger }}
        </template>
      </el-table-column>
      <el-table-column label="Commit">
        <template slot-scope="scope">
          <div style="color: #409EFF">{{ scope.row.commit }}</div>
          <div>{{ scope.row.commit_message }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Last Run At" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.last_run_at }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :layout="'total, prev, pager, next'"
      @pagination="fetchData"
    />
  </div>
</template>

<script>
import { getPipelines } from '@/api/cicd'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
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
      pipelines: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getPipelines(this.listQuery).then(response => {
        this.pipelines = response.data
        this.total = response.total
        this.listLoading = false
      })
    }
  }
}
</script>
