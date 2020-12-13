<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import { getPostmanReport } from '@/api/postmanReport'
import ProjectListSelector from '../../components/ProjectListSelector'

export default {
  components: { ProjectListSelector, Pagination },
  data() {
    return {
      reportList: [],
      dialogVisible: false,
      listLoading: true,
      listQuery: {
        page: 1, // 目前第幾頁
        limit: 10 // 一頁幾筆
      },
      listTotal: 0, // 總筆數
      searchData: ''
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId', 'userRole']),
    pagedData() {
      const listData = this.reportList.filter(data => {
        console.log(data.assertions.toString())
        if (
          this.searchData == '' ||
          data.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
          JSON.stringify(data.assertions)
            .toLowerCase()
            .includes(this.searchData.toLowerCase())
        ) {
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
    projectSelectedId() {
      this.fetchData()
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        this.listLoading = true
        const response = await getPostmanReport(this.projectSelectedId)
        const { data } = response
        this.reportList = data.json_file.executions
      } catch (e) {
        console.log(e)
      } finally {
        this.listLoading = false
      }
    },
    testResults(row) {
      const { assertions } = row
      let msg = ''
      assertions.forEach(item => {
        if ('error_message' in item) {
          msg = `${msg} <div> ['Failed'] ${item.assertion}, ${item.error_message} </div>`
        } else {
          msg = `${msg} <div> ['Passed'] ${item.assertion} </div>`
        }
      })
      return msg
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
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
        :placeholder="$t('TestCase.SearchNameOrTestResult')"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"
      /></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row :data="pagedData">
      <el-table-column align="center" :label="$t('general.Name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('TestCase.Method')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('TestCase.Path')" width="120px">
        <template slot-scope="scope">
          {{ scope.row.path }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('TestCase.TestResult')">
        <template slot-scope="scope">
          <span v-html="testResults(scope.row)" />
        </template>
      </el-table-column>
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
<style lang="scss" scoped>
.clearfix {
  clear: both;
  .newBtn {
    float: right;
    padding-right: 6px;
  }
}
</style>
