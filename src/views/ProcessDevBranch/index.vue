<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
export default {
  components: { 
    Pagination 
  },
  data() {
    return {
      branchList: [
        {
          'name': 'Branch2', 
          'desc': '密碼重設信不能正確寄送', 
          'status': '50 | 0',
          'commit': '6a6d1c', 
          'last_update_at': '2020-07-25T07:20:11Z',
          'test_completion': {
            'total': 5,
            'done': 5
          }
        },
        {
          'name': 'Branch3', 
          'desc': '第一版釋出', 
          'status': '75 | 0',
          'commit': '3a6d1f', 
          'last_update_at': '2020-07-25T07:20:11Z',
          'test_completion': {
            'total': 5,
            'done': 10
          }
        }
      ],
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
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.branchList.slice(start, end)
    }
  },
  async created() {
    // TODO: get project document list
    this.listLoading = false
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
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
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="search" placeholder="Filter Name" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" >
        Search
      </el-button>
    </div>
    <el-table 
      v-loading="listLoading" 
      :data="pagedData" 
      element-loading-text="Loading" 
      border 
      fit 
      highlight-current-row
    >
      <el-table-column align="center" label="Name">
        <template slot-scope="scope">
          <router-link :to="'dev-branch/'+scope.row.name+'/test'" style="color: #409EFF">
            <span>{{ scope.row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Description">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Commit">
        <template slot-scope="scope">
          {{ scope.row.commit }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last update time">
        <template slot-scope="scope">
          {{ scope.row.last_update_at | relativeTime }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Test Completion">
        <template slot-scope="scope">
          {{ scope.row.test_completion.done }} / {{ scope.row.test_completion.total }}
        </template>
      </el-table-column>
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