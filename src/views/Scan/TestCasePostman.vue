<template>
  <el-row class="app-container">
    <el-col>
      <div class="flex justify-between items-center">
        <el-button type="text" size="medium" icon="el-icon-arrow-left" class="text-title" @click="handleBack">
          {{ $t('general.Back') }}
        </el-button>
        <div class="text-center">
          <div class="text-title mb-2">{{ selectedProject.display }}</div>
          <div>
            <el-tag size="medium" type="primary" class="mr-2">
              <svg-icon class="mr-1" icon-class="mdi-branch" />{{ testCaseInfos.branch }}
            </el-tag>
            <el-link type="primary" target="_blank" style="font-size: 16px" :href="testCaseInfos.commit_url">
              <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ testCaseInfos.commit_id }}
            </el-link>
          </div>
        </div>
        <el-input
          v-model="keyword"
          class="ml-3"
          :placeholder="$t('TestCase.SearchName')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </div>
      <el-divider />
      <div class="flex justify-between items-center mb-3">
        <div class="text-info">{{ $t('general.ScanAt') }}：{{ testCaseInfos.start_time | UTCtoLocalTime }}</div>
        <div class="flex items-center">
          <el-tag
            size="small"
            class="cursor-pointer mr-2"
            :type="togglePass ? 'success' : 'info'"
            :effect="togglePass ? 'dark' : 'light'"
            @click="togglePass = !togglePass"
          >
            {{ $t('TestCase.Pass') }}
          </el-tag>
          <span class="mr-4 tex-subtitle-2">{{ countRequestMsg('Pass') }}</span>
          <el-tag
            size="small"
            class="cursor-pointer mr-2"
            :type="toggleFail ? 'danger' : 'info'"
            :effect="toggleFail ? 'dark' : 'light'"
            @click="toggleFail = !toggleFail"
          >
            {{ $t('TestCase.Fail') }}
          </el-tag>
          <span class="tex-subtitle-2">{{ countRequestMsg('Fail') }}</span>
        </div>
      </div>
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="pagedDataByChecked"
        :span-method="mergeCells"
        height="50vh"
        border
        fit
      >
        <el-table-column align="center" :label="$t('TestCase.Index')" prop="index" width="110" />
        <el-table-column align="center" :label="$t('general.Name')" prop="name" min-width="100" show-overflow-tooltip />
        <el-table-column
          align="center"
          :label="$t('TestCase.Method')"
          show-overflow-tooltip
          min-width="50"
          prop="method"
        />
        <el-table-column align="center" :label="$t('TestCase.Path')" prop="path" min-width="120" />
        <el-table-column align="center" :label="$t('TestCase.TestResult')" prop="testResult" min-width="70">
          <template slot-scope="scope">
            <el-tag size="mini" :type="getTagType(scope.row.testResult)">
              <svg-icon :icon-class="scope.row.testResult === 'Pass' ? 'mdi-check' : 'mdi-close'" />
              {{ $t(`TestCase.Test${scope.row.testResult}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column header-align="center" :label="$t('TestCase.TestMessage')" min-width="150" prop="responseMsg">
          <template slot-scope="scope">
            <span class="tex-subtitle-2" :class="`text-${getTagType(scope.row.testResult)}`">
              {{ scope.row.responseMsg }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :page="listQuery.page"
        :limit="listQuery.limit"
        :total="checkedData.length"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPostmanReport } from '@/api/postman'
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'

export default {
  name: 'TestCasePostman',
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      testCaseInfos: {},
      togglePass: true,
      toggleFail: true,
      searchKeys: ['name', 'responseMsg']
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'userId']),
    checkedData() {
      const isPass = this.togglePass ? 'Pass' : null
      const isFail = this.toggleFail ? 'Fail' : null
      const result = this.filteredData.filter(
        item => item.testResult.includes(isPass) || item.testResult.includes(isFail)
      )
      return result
    },
    pagedDataByChecked() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return this.checkedData.slice(start, end)
    }
  },
  watch: {
    togglePass() {
      this.listQuery.page = 1
    },
    toggleFail() {
      this.listQuery.page = 1
    }
  },
  methods: {
    async fetchData() {
      const res = await getPostmanReport(this.$route.params.id)
      const { branch, commit_id, commit_url, start_time, report } = res.data
      this.testCaseInfos = { branch, commit_id, commit_url, start_time }
      const isSingleCollection = Object.keys(report.json_file).includes('assertions' || 'executions')
      const testCases = isSingleCollection
        ? this.formatData(report.json_file.executions)
        : this.handleMultiCollections(report.json_file)
      return testCases.length ? testCases : []
    },
    formatData(testCases) {
      return testCases.flatMap((testCase, idx) =>
        testCase.assertions.map(assertion => ({
          index: idx + 1,
          name: testCase.name,
          method: testCase.method,
          path: testCase.path,
          testResult: assertion.hasOwnProperty('error_message') ? 'Fail' : 'Pass',
          responseMsg: `${assertion.assertion}${assertion.error_message ? ', ' + assertion.error_message : ''}`
        }))
      )
    },
    handleMultiCollections(testCases) {
      const flatCollections = Object.values(testCases).flatMap(i => i.executions)
      return this.formatData(flatCollections)
    },
    countRequestMsg(result) {
      const length = this.listData.filter(item => item.testResult === result).length
      return this.$tc('TestCase.TestItem', length, { count: length })
    },
    getTagType(status) {
      const mapping = { Fail: 'danger', Pass: 'success' }
      return mapping[status]
    },
    mergeCells({ row, column, rowIndex, columnIndex }) {
      const data = this.pagedDataByChecked
      const cellVal = row[column.property]
      const noSortKeys = ['method', 'path', 'testResult', 'responseMsg']
      if (cellVal && !noSortKeys.includes(column.property)) {
        const prevRow = data[rowIndex - 1]
        let nextRow = data[rowIndex + 1]
        if (prevRow && prevRow[column.property] === cellVal) {
          return { rowspan: 0, colspan: 0 }
        } else {
          let countRowspan = 1
          while (nextRow && nextRow[column.property] === cellVal) {
            nextRow = data[++countRowspan + rowIndex]
          }
          if (countRowspan > 1) {
            return { rowspan: countRowspan, colspan: 1 }
          }
        }
      }
    },
    handleBack() {
      this.$router.push({ name: 'postman-test' })
    }
  }
}
</script>
