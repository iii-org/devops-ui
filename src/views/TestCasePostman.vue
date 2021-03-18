<script>
import { mapGetters } from 'vuex'
import { getPostmanReport } from '@/api/postman'
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'PostmanTestCase',
  mixins: [MixinElTable],
  data: () => ({
    testCaseInfos: {}
  }),
  computed: {
    ...mapGetters(['selectedProject']),
    countPassNum() {
      return this.filteredData.filter(item => item.testResult === 'Pass').length
    },
    countFailNum() {
      return this.filteredData.filter(item => item.testResult === 'Fail').length
    },
    filterByStatusData() {
      return this.isPass
    }
  },
  methods: {
    async fetchData() {
      const res = await getPostmanReport(this.$route.params.id)
      const { branch, commit_id, commit_url, start_time } = res.data
      this.testCaseInfos['branch'] = branch
      this.testCaseInfos['commit_id'] = commit_id
      this.testCaseInfos['commit_url'] = commit_url
      this.testCaseInfos['start_time'] = start_time
      const testCases = this.formatData(res.data.report.json_file.executions)
      return testCases.length ? testCases : []
    },
    formatData(testCases) {
      return testCases.map(testCase => {
        const result = testCase
        result['testResult'] = 'Fail'
        result.assertions.forEach(assertion => {
          if ('error_message' in assertion) {
            assertion['testResult'] = 'Ｘ'
          } else {
            assertion['testResult'] = 'Ｏ'
          }
        })
        return result
      })
    },
    getTagType(status) {
      switch (status) {
        case 'Fail':
          return 'danger'
        case 'Pass':
          return 'success'
        case 'Ｘ':
          return '#e85656'
        case 'Ｏ':
          return '#1f2d3d'
        default:
          return 'slow'
      }
    },
    filterHandler(value, row, column) {
      const property = column['property']
      return row[property] === value
    }
  }
}
</script>

<template>
  <div class="table-container">
    <div class="d-flex justify-space-between align-center mb-3">
      <router-link :to="{ name: 'Postman result' }">
        <svg-icon icon-class="system-uicons-exit-left" class="mr-2" />{{ $t('general.Exit') }}
      </router-link>
      <span>{{ $t('general.ScanAt') }}：{{ testCaseInfos.start_time | UTCtoLocalTime }}</span>
    </div>
    <div class="d-flex justify-space-between align-center">
      <div>
        <span>{{ selectedProject.display }} >> {{ testCaseInfos.branch }}</span> #{{ testCaseInfos.commit_id }}
      </div>
      <div>
        <span style="color: #3ecbbc">{{ `Pass（${countPassNum}）` }}</span>
        <span style="color: #e85656">{{ `Fail（${countFailNum}）` }}</span>

        <el-input
          v-model="searchData"
          class="ml-3"
          :placeholder="$t('TestCase.SearchName')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </div>
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
      <el-table-column
        align="center"
        :label="$t('general.Name')"
        :show-overflow-tooltip="true"
        min-width="100"
        prop="name"
      />
      <el-table-column
        align="center"
        :label="$t('TestCase.TestResult')"
        prop="testResult"
        min-width="60"
        :filters="[{ text: 'Pass', value: 'Pass' }, { text: 'Fail', value: 'Fail' }]"
        :filter-method="filterHandler"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.testResult" :type="getTagType(scope.row.testResult)" size="medium" effect="dark">
            {{ scope.row.testResult }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('TestCase.Method')"
        :show-overflow-tooltip="true"
        min-width="40"
        prop="method"
      />
      <el-table-column align="center" :label="$t('TestCase.Path')" prop="path" min-width="120" />
      <el-table-column header-align="center" :label="$t('TestCase.TestMessage')" min-width="150" prop="assertions">
        <template slot-scope="scope">
          <div v-for="(assertion, idx) in scope.row.assertions" :key="idx" class="mb-3 d-flex">
            <span :style="{ color: getTagType(assertion.testResult) }" size="mini" effect="dark">
              {{ assertion.testResult }}
            </span>

            <div class="ml-2">
              {{ `${assertion.assertion}, ${assertion.error_message}` }}
            </div>
          </div>
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
  </div>
</template>
