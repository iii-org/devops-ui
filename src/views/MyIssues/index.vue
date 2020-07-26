<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :header-cell-style="{background:'#fafafa', color:'rgba(0,0,0,.85)'}"
    >
      <el-table-column label="Num" width="70" align="center">
        <template slot-scope="scope">
          <router-link :to="'/issues/'+scope.row.id" style="color: #409EFF">
            <span>{{ scope.row.id }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Name" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.subject }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Tracker" width="110">
        <template slot-scope="scope">
          {{ scope.row.tracker.name }}
        </template>
      </el-table-column>
      <el-table-column label="Priority" width="110" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.priority.name === '特急'" type="danger" size="medium">{{ scope.row.priority.name }}</el-tag>
          <el-tag v-else-if="scope.row.priority.name === '急'" type="warning" size="medium">{{ scope.row.priority.name }}</el-tag>
          <el-tag v-else-if="scope.row.priority.name === '一般'" size="medium">{{ scope.row.priority.name }}</el-tag>
          <el-tag v-else type="success" size="medium">{{ scope.row.priority.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Project" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.project.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Last Update Time" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.updated_date | relativeTime }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getIssuesByUser } from '@/api/issue'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getIssuesByUser(this.userId, this.listQuery).then(response => {
        this.list = response.data
        this.listLoading = false
      })
    }
  }
}
</script>
