<script>
import Pagination from '@/components/Pagination'
import { getPostmanReport } from '@/api/postman'
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'DevOpsTestCase',
  components: { Pagination },
  mixins: [MixinElTable],
  data: () => ({
    reportList: [],
    dialogVisible: false,
    listLoading: true,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: ''
  }),
  computed: {
    pagedData() {
      const listData = this.reportList.filter(data => {
        if (
          this.searchData === '' ||
          data.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
          data.path.toLowerCase().includes(this.searchData.toLowerCase()) ||
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
    searchData() {
      this.listQuery.page = 1
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        this.listLoading = true
        const response = await getPostmanReport(this.$route.params.id)
        const { data } = response
        data ? (this.reportList = data.in_db.executions) : (this.reportList = [])
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
  <div class="table-container">
    <div class="clearfix">
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('TestCase.SearchNameOrPathOrTestResult')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :element-loading-text="$t('Loading')" border fit highlight-current-row :data="pagedData" height="100%" row-class-name="el-table-row">
      <el-table-column align="center" :label="$t('general.Name')" :show-overflow-tooltip="true" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('TestCase.Method')" :show-overflow-tooltip="true" min-width="40">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('TestCase.Path')" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.path }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('TestCase.TestResult')" min-width="150">
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
}
</style>
