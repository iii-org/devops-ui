<script>
import { mapGetters, mapActions } from 'vuex'
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
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      }
    }
  },
  computed: {
    ...mapGetters(['projectList', 'projectListTotal']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.projectList.slice(start, end)
    }
  },
  async created() {
    await this['projects/getProjectList']()
    this.listLoading = false
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    returnTagType(row) {
      const { last_test_passed, last_test_total } = row
      return last_test_passed === last_test_total ? 'success' : 'danger'
    },
    testResults(row) {
      const { last_test_passed, last_test_total } = row
      return last_test_passed + ' / ' + last_test_total
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link
            :to="{
              name: 'fileList',
              params: {
                bId: scope.row.id,
                projectName: scope.row.project_name,
                branchName: scope.row.branch_name
              }
            }"
            style="color: #409EFF"
          >
            <span>{{ scope.row.project_name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Workload">
        <template slot-scope="scope">
          {{ scope.row.items }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Upcomming Deadline">
        <template slot-scope="scope">
          {{ scope.row.deadline }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Branches">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'branches', params: { pId: scope.row.id, projectName: scope.row.project_name } }"
            style="color: #409EFF"
          >
            <span>{{ scope.row.brancheNum }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last Test">
        <template slot-scope="scope">
          {{ scope.row.last_test_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last Test Result">
        <template slot-scope="scope">
          <el-tag :type="returnTagType(scope.row)" size="large">
            <i v-if="scope.row.last_test_result" class="el-icon-success" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last Tag">
        <template slot-scope="scope">
          <router-link
            :to="{
              name: 'fileList',
              params: {
                bId: scope.row.id,
                projectName: scope.row.project_name,
                branchName: scope.row.branch_name
              }
            }"
            style="color: #409EFF"
          >
            {{ scope.row.latest_tag }}
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="projectListTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>
