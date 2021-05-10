<template>
  <el-row class="app-container">
    <el-col>
      <div class="d-flex justify-space-between align-center">
        <router-link :to="{ name: 'postman' }">
          <svg-icon icon-class="system-uicons-exit-left" class="mr-2" />{{ $t('general.Exit') }}
        </router-link>
        <div class="text-center">
          <div class="mb-2">
            <span class="text-body-1 font-weight-bold mb-1">{{ selectedProject.display }}</span>
            <el-tag class="mr-2" size="small" type="primary">
              <svg-icon class="mr-1" icon-class="mdi-branch" />{{ testCaseInfos.branch }}
            </el-tag>
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
        </div>
        <el-input
          v-model="searchData"
          class="ml-3"
          :placeholder="$t('TestCase.SearchName')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </div>
      <el-divider />
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="text-info">{{ $t('general.ScanAt') }}：{{ testCaseInfos.start_time | UTCtoLocalTime }}</div>
        <div class="d-flex align-center">
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
        border
        fit
        :data="pagedDataByChecked"
        height="100%"
      >
        <el-table-column align="center" :label="$t('TestCase.Index')" prop="index" width="110" />
        <el-table-column align="center" :label="$t('general.Name')" prop="name" min-width="100" show-overflow-tooltip />
        <el-table-column align="center" :label="$t('TestCase.TestResult')" prop="testResult" min-width="70">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.testResult" :type="getTagType(scope.row.testResult)" effect="dark">
              {{ $t(`TestCase.${scope.row.testResult}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('TestCase.Method')"
          show-overflow-tooltip
          min-width="50"
          prop="method"
        />
        <el-table-column align="center" :label="$t('TestCase.Path')" prop="path" min-width="120" />
        <el-table-column header-align="center" :label="$t('TestCase.TestMessage')" min-width="150" prop="assertions">
          <template slot-scope="scope">
            <div v-for="(assertion, idx) in scope.row.assertions" :key="idx" class="d-flex justify-start my-1">
              <el-tag size="mini" class="mr-2 mb-1" :type="getTagType(assertion.testResult)">
                <svg-icon v-if="assertion.testResult === 'Pass'" icon-class="mdi-check" />
                <svg-icon v-if="assertion.testResult === 'Fail'" icon-class="mdi-close" />
                {{ $t(`TestCase.Test${assertion.testResult}`) }}
              </el-tag>
              <span class="flex-wrap tex-subtitle-2" :class="`text-${getTagType(assertion.testResult)}`">
                {{ `${assertion.assertion}${assertion.error_message ? ', ' + assertion.error_message : ''}` }}
              </span>
            </div>
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
import MixinElTable from '@/mixins/MixinElTable'

export default {
  name: 'TestCasePostman',
  mixins: [MixinElTable],
  data() {
    return {
      testCaseInfos: {},
      togglePass: true,
      toggleFail: true
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
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
      const { branch, commit_id, commit_url, start_time } = res.data
      this.testCaseInfos = { branch, commit_id, commit_url, start_time }
      const testCases = this.formatData(res.data.report.json_file.executions)
      return testCases.length ? testCases : []
    },
    formatData(testCases) {
      return testCases.map((testCase, idx) => {
        const result = testCase
        result.index = idx + 1
        result.assertions.forEach(assertion => {
          if ('error_message' in assertion) {
            assertion['testResult'] = 'Fail'
          } else {
            assertion['testResult'] = 'Pass'
          }
        })
        result['testResult'] = result.assertions.every(assertion => assertion.testResult === 'Pass') ? 'Pass' : 'Fail'
        return result
      })
    },
    getTagType(status) {
      switch (status) {
        case 'Fail':
          return 'danger'
        case 'Pass':
          return 'success'
      }
    },
    countRequestMsg(testResult) {
      const filteredRequests = this.filteredData.filter(item => item.testResult === testResult)
      const assertionResults = filteredRequests.flatMap(i => i.assertions).map(i => i.testResult)
      const passCount = assertionResults.filter(i => i === 'Pass').length
      const failCount = assertionResults.filter(i => i === 'Fail').length
      const requestLength = filteredRequests.length
      const result = `${requestLength} ${this.$tc('TestCase.Request', requestLength)}（${passCount} ${this.$t(
        'TestCase.TestPass'
      )}, ${failCount} ${this.$t('TestCase.TestFail')}）`
      return result
    }
  }
}
</script>
