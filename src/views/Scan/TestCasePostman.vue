<template>
  <div
    id="postman-report-header"
    v-loading="listLoading"
    :element-loading-text="$t('Loading')"
    class="app-container"
  >
    <el-backtop target="#postman-report-header" />
    <div class="flex justify-between items-center mb-5">
      <div class="flex justify-start items-center">
        <el-button
          type="text"
          size="medium"
          icon="el-icon-arrow-left"
          class="text-title linkTextColor"
          @click="handleBack"
        >
          {{ $t('general.Back') }}
        </el-button>
        <div class="mx-5">
          <div class="text-title mb-2">
            {{ selectedProject.display }}
          </div>
          <div>
            <el-tag
              size="mini"
              type="primary"
              class="mr-2"
            >
              <em class="ri-git-branch-line mr-1" />
              {{ testCaseInfos.branch }}
            </el-tag>
            <el-link
              class="mr-3 linkTextColor"
              target="_blank"
              :underline="false"
              :href="testCaseInfos.commit_url"
            >
              <svg-icon
                class="mr-1"
                icon-class="ion-git-commit-outline"
              />
              {{ testCaseInfos.commit_id }}
            </el-link>
          </div>
        </div>
        <div class="mx-5">
          <el-tag
            class="mb-2"
            size="small"
            type="warning"
          >
            {{ $t('general.ScanAt') + '：' + UTCtoLocalTime(testCaseInfos.start_time) }}
          </el-tag>
          <div>
            <el-tag
              size="small"
              type="primary"
            >
              {{ $t('Postman.TestTotal') }}
              <span class="font-semibold ml-2">
                {{ countPassedTotal + countFailedTotal }}
              </span>
            </el-tag>
            <el-tag
              size="small"
              type="success"
            >
              {{ $t('TestCase.Pass') }}
              <span class="font-semibold ml-2">
                {{ countPassedTotal }}
              </span>
            </el-tag>
            <el-tag
              size="small"
              type="danger"
            >
              {{ $t('TestCase.Fail') }}
              <span class="font-semibold ml-2">
                {{ countFailedTotal }}
              </span>
            </el-tag>
          </div>
        </div>
      </div>
      <el-input
        v-model="keyword"
        :placeholder="$t('TestCase.SearchKey')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-tabs
      v-model="activeCollection"
      type="border-card"
    >
      <el-empty v-if="!filteredData || filteredData.length === 0" />
      <el-tab-pane
        v-for="collection in filteredData"
        :key="collection.name"
        :label="collection.name"
        :name="collection.name"
      >
        <el-tabs v-model="activeStatus">
          <el-tab-pane
            label="All Tests"
            name="All"
          >
            <el-empty v-if="collection.all.length === 0" />
            <div
              v-for="(execution, idx) in collection.all"
              :key="execution.name + idx"
            >
              <el-row
                type="flex"
                align="middle"
              >
                <el-col
                  class="flex justify-center items-center"
                  :span="3"
                >
                  <div
                    class="font-medium mx-5"
                    :class="mapMethodType(execution.method)"
                  >{{ execution.method }}</div>
                </el-col>
                <el-col :span="21">
                  <div class="my-3">
                    <span class="font-medium">{{ execution.name }}</span>
                    <span class="text-info">{{ decodeURI(execution.path) }}</span>
                  </div>
                  <div
                    v-for="(item, itemIdx) in execution.assertions"
                    :key="itemIdx"
                    class="my-1"
                  >
                    <el-tag
                      size="small"
                      :type="mapTagType(getTestResult(item))"
                    >
                      {{ $t(`TestCase.${getTestResult(item)}`) }}
                    </el-tag>
                    <span class="ml-2">
                      {{ item.assertion }}
                      <template v-if="item.error_message">
                        | {{ item.error_message }}
                      </template>
                    </span>
                  </div>
                </el-col>
              </el-row>
              <el-divider />
            </div>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('TestCase.Pass') + ' (' + countRequest(collection.assertions, 'pass') + ')'"
            name="Pass"
          >
            <el-empty v-if="collection.pass.length === 0" />
            <div
              v-for="(execution, idx) in collection.pass"
              :key="execution.name + idx"
            >
              <el-row
                type="flex"
                align="middle"
              >
                <el-col
                  class="flex justify-center items-center"
                  :span="3"
                >
                  <div
                    class="font-medium mx-5"
                    :class="mapMethodType(execution.method)"
                  >
                    {{ execution.method }}
                  </div>
                </el-col>
                <el-col :span="21">
                  <div class="my-3">
                    <span class="font-medium">{{ execution.name }}</span>
                    <span class="text-info">{{ decodeURI(execution.path) }}</span>
                  </div>
                  <div
                    v-for="(item, itemIdx) in execution.assertions"
                    :key="itemIdx"
                    class="my-1"
                  >
                    <el-tag
                      size="small"
                      :type="mapTagType(getTestResult(item))"
                    >
                      {{ $t(`TestCase.${getTestResult(item)}`) }}
                    </el-tag>
                    <span class="ml-2">
                      {{ item.assertion }}
                      <template v-if="item.error_message">
                        | {{ item.error_message }}
                      </template>
                    </span>
                  </div>
                </el-col>
              </el-row>
              <el-divider />
            </div>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('TestCase.Fail') + ' (' + countRequest(collection.assertions, 'fail') + ')'"
            name="Fail"
          >
            <el-empty v-if="collection.fail.length === 0" />
            <div
              v-for="(execution, idx) in collection.fail"
              :key="execution.name + idx"
            >
              <el-row
                type="flex"
                align="middle"
              >
                <el-col
                  class="flex justify-center items-center"
                  :span="3"
                >
                  <div
                    class="font-medium mx-5"
                    :class="mapMethodType(execution.method)"
                  >{{ execution.method }}</div>
                </el-col>
                <el-col :span="21">
                  <div class="my-3">
                    <span class="font-medium">{{ execution.name }}</span>
                    <span class="text-info">{{ decodeURI(execution.path) }}</span>
                  </div>
                  <div
                    v-for="(item, itemIdx) in execution.assertions"
                    :key="itemIdx"
                    class="my-1"
                  >
                    <el-tag
                      size="small"
                      :type="mapTagType(getTestResult(item))"
                    >
                      {{ $t(`TestCase.${getTestResult(item)}`) }}
                    </el-tag>
                    <span class="ml-2">
                      {{ item.assertion }}
                      <template v-if="item.error_message">
                        | {{ item.error_message }}
                      </template>
                    </span>
                  </div>
                </el-col>
              </el-row>
              <el-divider />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPostmanReport } from '@/api/postman'
import { BasicData, Pagination, SearchBar, Table } from '@/mixins'
import { UTCtoLocalTime } from '@/utils/handleTime'

export default {
  name: 'TestCasePostman',
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      searchKeys: ['name', 'responseMsg'],
      testCaseInfos: {},
      testRequestCount: null,
      activeStatus: 'All',
      activeCollection: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    filteredData() {
      if (!this.keyword) return this.listData
      const keyword = this.keyword.toLowerCase()
      return this.listData.filter((item) => item.name.toLowerCase().includes(keyword))
    },
    countPassedTotal() {
      return this.listData
        ? this.listData.map((item) => item.assertions.total - item.assertions.failed).reduce((a, b) => a + b, 0)
        : null
    },
    countFailedTotal() {
      return this.listData
        ? this.listData.map((item) => item.assertions.failed).reduce((a, b) => a + b, 0)
        : null
    }
  },
  watch: {
    listData(val) {
      if (val && val[0]) this.activeCollection = this.listData[0].name
    },
    keyword(val) {
      if (val && this.filteredData.length !== 0) this.activeCollection = this.filteredData[0].name
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name !== 'Postman') {
      sessionStorage.removeItem('postmanKeyword')
    }
    next()
  },
  methods: {
    async fetchData() {
      return getPostmanReport(this.$route.params.id)
        .then((res) => {
          const { branch, commit_id, commit_url, start_time, report } = res.data
          this.testCaseInfos = { branch, commit_id, commit_url, start_time }
          return this.formatData(report.json_file)
        })
        .catch(() => {
          this.listData = []
          // this.$router.push({ name: 'Postman' })
        })
    },
    formatData(rowData) {
      return Object.keys(rowData).map((key, idx) => ({
        name: key || 'Default',
        assertions: rowData[key].assertions,
        all: rowData[key].executions,
        pass: this.getPassExecutions(rowData[key].executions),
        fail: this.getFailExecutions(rowData[key].executions)
      }))
    },
    getPassExecutions(executions) {
      const filteredExecutions = executions.filter((execution) => execution.assertions.length > 0)
      const result = filteredExecutions.flatMap((execution) => {
        const { method, name, path, assertions } = execution
        return {
          method,
          name,
          path,
          assertions: assertions.filter((assertion) => !assertion.hasOwnProperty('error_message'))
        }
      })
      return result.filter((item) => item.assertions.length > 0)
    },
    getFailExecutions(executions) {
      const filteredExecutions = executions.filter((i) => i.assertions.length > 0)
      const result = filteredExecutions.flatMap((execution) => {
        const { method, name, path, assertions } = execution
        return {
          method,
          name,
          path,
          assertions: assertions.filter((assertion) => assertion.hasOwnProperty('error_message'))
        }
      })
      return result.filter((item) => item.assertions.length > 0)
    },
    mapTagType(status) {
      const mapping = { Fail: 'danger', Pass: 'success' }
      return mapping[status]
    },
    handleBack() {
      this.$router.push({ name: 'Postman', params: { projectName: this.selectedProject.name }})
    },
    countRequest(assertions, result) {
      if (result === 'pass') return assertions.total - assertions.failed
      if (result === 'fail') return assertions.failed
    },
    mapMethodType(method) {
      const mapping = {
        GET: 'method-tag text-green-600 border-green-600',
        POST: 'method-tag text-yellow-500 border-yellow-500',
        PUT: 'method-tag text-blue-600 border-blue-600',
        DELETE: 'method-tag text-red-600 border-red-600'
      }
      return mapping[method] || 'method-tag text-gray-500 border-gray-500'
    },
    getTestResult(result) {
      return result.hasOwnProperty('error_message') ? 'Fail' : 'Pass'
    },
    UTCtoLocalTime(time) {
      return UTCtoLocalTime(time)
    }
  }
}
</script>

<style lang="scss" scoped>
.method-tag {
  @apply border border-solid p-1 rounded;
}

</style>
