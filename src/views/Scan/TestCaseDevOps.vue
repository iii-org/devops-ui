<template>
  <el-row class="app-container">
    <el-col>
      <div class="d-flex">
        <el-input
          v-model="keyword"
          :placeholder="$t('TestCase.SearchNameOrPathOrTestResult')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </div>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        border
        fit
        highlight-current-row
        :data="pagedData"
        height="100%"
      >
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
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
    </el-col>
  </el-row>
</template>

<script>
import { getPostmanReport } from '@/api/postman'
import MixinBasicTable from '@/mixins/MixinBasicTable'

export default {
  name: 'TestCaseDevOps',
  mixins: [MixinBasicTable],
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    filteredData() {
      return this.listData.filter(data => {
        this.searchData === '' ||
          data.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
          data.path.toLowerCase().includes(this.searchData.toLowerCase()) ||
          JSON.stringify(data.assertions)
            .toLowerCase()
            .includes(this.searchData.toLowerCase())
      })
    }
  },
  methods: {
    async fetchData() {
      const response = await getPostmanReport(this.$route.params.id)
      const { data } = response
      if (!data) {
        return []
      }
      return data.report.in_db.executions
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
    }
  }
}
</script>
