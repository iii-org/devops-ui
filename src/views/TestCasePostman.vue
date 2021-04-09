<script>
import { mapGetters } from 'vuex'
import { getPostmanReport } from '@/api/postman'
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'TestCasePostman',
  mixins: [MixinElTable],
  data: () => ({
    testCaseInfos: {},
    checkedItems: ['Pass', 'Fail']
  }),
  computed: {
    ...mapGetters(['selectedProject']),
    countPassNum() {
      return this.filteredData.filter(item => item.testResult === 'Pass').length
    },
    countFailNum() {
      return this.filteredData.filter(item => item.testResult === 'Fail').length
    },
    checkedData() {
      return this.filteredData.filter(
        item => item.testResult.includes(this.checkedItems[0]) || item.testResult.includes(this.checkedItems[1])
      )
    },
    pagedDataByChecked() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return this.checkedData.slice(start, end)
    }
  },
  watch: {
    checkedItems() {
      this.listQuery.page = 1
    }
  },
  methods: {
    async fetchData() {
      const res = await getPostmanReport(this.$route.params.id)
      const { branch, commit_id, commit_url, start_time } = res.data
      this.testCaseInfos = { branch, commit_id, commit_url, start_time }
      const testCases = this.formatData(res.data.report.json_file.executions)
      return testCases.length ? testCases : []
    },
    formatData(testCases) {
      return testCases.map((testCase, idx) => {
        const result = testCase
        result['index'] = idx + 1
        result.assertions.forEach(assertion => {
          if ('error_message' in assertion) {
            result['testResult'] = 'Fail'
            assertion['testResult'] = 'Ｘ'
          } else {
            result['testResult'] = 'Pass'
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
    }
  }
}
</script>

<template>
  <div class="table-container">
    <div class="d-flex justify-space-between align-center mb-3">
      <router-link :to="{ name: 'postman-result' }">
        <svg-icon icon-class="system-uicons-exit-left" class="mr-2" />{{ $t('general.Exit') }}
      </router-link>
      <span>{{ $t('general.ScanAt') }}：{{ testCaseInfos.start_time | UTCtoLocalTime }}</span>
    </div>
    <div class="d-flex justify-space-between align-center">
      <div>
        <span>{{ selectedProject.display }} >> {{ testCaseInfos.branch }}</span>
        <el-link
          type="primary"
          target="_blank"
          style="font-size: 16px"
          :underline="false"
          :href="testCaseInfos.commit_url"
        >
          #{{ testCaseInfos.commit_id }}
        </el-link>
      </div>
      <div class="d-flex align-end text-h6">
        <label style="color: #3ecbbc">
          <input v-model="checkedItems" type="checkbox" value="Pass">
          {{ `Pass(${countPassNum})` }}
        </label>
        <label class="ml-3" style="color: #e85656">
          <input v-model="checkedItems" type="checkbox" value="Fail">
          {{ `Fail(${countFailNum})` }}
        </label>
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
      :data="pagedDataByChecked"
      height="100%"
    >
      <el-table-column align="center" :label="$t('TestCase.Index')" prop="index" width="80" />
      <el-table-column
        align="center"
        :label="$t('general.Name')"
        :show-overflow-tooltip="true"
        min-width="100"
        prop="name"
      />
      <el-table-column align="center" :label="$t('TestCase.TestResult')" prop="testResult" min-width="70">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.testResult" class="el-tag--circle" :type="getTagType(scope.row.testResult)" size="medium" effect="dark">
            {{ scope.row.testResult }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('TestCase.Method')"
        :show-overflow-tooltip="true"
        min-width="50"
        prop="method"
      />
      <el-table-column align="center" :label="$t('TestCase.Path')" prop="path" min-width="120" />
      <el-table-column header-align="center" :label="$t('TestCase.TestMessage')" min-width="150" prop="assertions">
        <template slot-scope="scope">
          <div v-for="(assertion, idx) in scope.row.assertions" :key="idx" class="d-flex">
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
      :total="checkedData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>
