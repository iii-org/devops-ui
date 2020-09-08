<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { formatTime } from '../../utils/index.js'

export default {
  components: {
    Pagination,
    ProjectListSelector
  },
  data() {
    return {
      branchList: [],
      search: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        totalPage: 1
      }
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId', 'projectSelectedObject', 'branchesByProject']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.branchList.slice(start, end)
    }
  },
  watch: {
    branchesByProject(ary) {
      this.branchList = ary
    },
    projectSelectedObject(obj) {
      this.fetchBranchData()
    }
  },
  async created() {
    this.fetchBranchData()
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    ...mapActions('branches', ['getBranchesByProject']),
    fetchBranchData() {
      this.listLoading = true
      if (!this.projectSelectedObject.repository_id) {
        this.branchList = []
        this.listLoading = false
        return
      }
      this.getBranchesByProject(this.projectSelectedObject.repository_id)
      this.listLoading = false
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
    myFormatTime(time) {
      return formatTime(new Date(time))
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div>
      <project-list-selector />
    </div>
    <el-divider />
    <!-- <div class="filter-container">
      <el-input v-model="search" placeholder="Filter Name" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search">
        Search
      </el-button>
    </div> -->
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="Name">
        <template slot-scope="scope">
          <router-link :to="'dev-branch/' + scope.row.name + '/test'" style="color: #409EFF">
            <span>{{ scope.row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Description">
        <template slot-scope="scope">
          {{ scope.row.last_commit_message }}
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Status">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column> -->
      <el-table-column align="center" label="Commit">
        <template slot-scope="scope">
          {{ scope.row.short_id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last update time">
        <template slot-scope="scope">
          {{ myFormatTime(scope.row.last_commit_time) }}
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Test Completion">
        <template slot-scope="scope">
          {{ scope.row.test_completion.done }} / {{ scope.row.test_completion.total }}
        </template>
      </el-table-column> -->
    </el-table>
    <pagination
      :total="listQuery.totalPage"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>
<style lang="scss">
.filter-container {
  margin-bottom: 5px;
}
</style>
