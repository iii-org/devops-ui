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
        limit: 10
      },
      listTotal: 0, //總筆數
      searchData: ''
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId', 'projectSelectedObject', 'branchesByProject']),
    pagedData() {
      const listData = this.branchList.filter((data) => {
        if (this.searchData == '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
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
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        placeholder="Please input branch name"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"></i
      ></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="Name" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
          <!-- <router-link :to="'dev-branch/' + scope.row.name + '/test'" style="color: #409EFF">
            <span>{{ scope.row.name }}</span>
          </router-link> -->
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
      <el-table-column align="center" label="Commit" width="160">
        <template slot-scope="scope">
          {{ scope.row.short_id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last update time" width="240">
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
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
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
