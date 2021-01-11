<script>
import { mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import TestDetail from './components/TestDetail'
export default {
  components: {
    Pagination,
    TestDetail
  },
  data() {
    return {
      testList: [
        {
          order: 1,
          branch: 'Dev',
          status: 'success',
          message: 'Use Alpine Python',
          last_update_at: '2020-07-25T07:20:11Z'
        },
        {
          order: 2,
          branch: 'Dev',
          status: 'fail',
          message: "Merge branch 'master'",
          last_update_at: '2020-07-25T07:20:11Z'
        },
        {
          order: 3,
          branch: 'master',
          status: 'success',
          message: 'Added Jenkins File',
          last_update_at: '2020-07-25T07:20:11Z'
        },
        {
          order: 4,
          branch: 'feature',
          status: 'fail',
          message: 'feature',
          last_update_at: '2020-07-25T07:20:11Z'
        }
      ],
      search: '',
      testDetailVisible: false,
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
      return this.testList.slice(start, end)
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
    },
    emitTestDetailVisible(visible) {
      this.testDetailVisible = visible
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="Index">
        <template slot-scope="scope">
          <span style="color: #409EFF;cursor: pointer;" @click="testDetailVisible = true">
            {{ scope.row.order }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Branch">
        <template slot-scope="scope">
          {{ scope.row.branch }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Message">
        <template slot-scope="scope">
          {{ scope.row.message }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last update time">
        <template slot-scope="scope">
          {{ scope.row.last_update_at | relativeTime }}
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
    <test-detail :dialog-visible.sync="testDetailVisible" @test-detail-visible="emitTestDetailVisible" />
  </div>
</template>
