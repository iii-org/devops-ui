<template>
  <div class="app-container" style="padding-top: 0px">
    <div class="flex justify-between fix-header">
      <div>
        <el-button
          type="text"
          size="medium"
          icon="el-icon-arrow-left"
          class="previous linkTextColor"
          @click="handleBackPage"
        >
          {{ $t('general.Back') }}
        </el-button>
        <span class="ml-2 text-l">
          <span>{{ $t('Docker.Title') }}</span>
        </span>
      </div>
    </div>
    <div ref="pdfPage">
      <el-card shadow="never">
        <div class="logo-container">
          <img src="@/assets/logo.png" class="logo" alt="logo">
          <h1 class="title">{{ title }} </h1>
        </div>
        <div
          class="text-center font-bold clearfix"
          style="
            line-height: 7px;
            color: #429470;
            font-size: 32px;
            text-shadow: #b3b1b1 0.05em 0.05em 0.1em;
          "
        >{{ $t('Docker.Title') }}</div>
        <div style="padding: 40px;">
          <ul class="text-base mb-10 font-semibold">
            <li>{{ $t('general.project_name') }}: {{ projectName }}</li>
            <li>{{ $t('TestReport.TestTime') }}: {{ timeNow }}</li>
            <li>
              {{ $t('general.Branch') }} / {{ $t('TestReport.Commit') }}:
              {{ branch }} /<svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
              {{ commitId }}
            </li>
            <li>{{ $t('Sbom.PackageCount') }}: {{ packageCount }}</li>
          </ul>
          <!-- white box test -->
          <div
            class="text-center font-bold"
            style="
              width: 40%;
              font-size: 20px;
              margin: 0 auto;
              padding-bottom: 10px;
              border-bottom: 1px solid
            "
          >
            {{ $t('Docker.Overview') }}
          </div>
          <el-row
            :gutter="12"
            class="mt-3"
            style="width: 80%; margin: 0 auto;"
          >
            <el-col
              v-for="item in summaryData"
              :key="item.severity"
              :span="4"
            >
              <el-card
                class="text-center font-bold mb-10 "
                style="box-shadow: 12px 12px 12px 0 rgb(0 0 0 / 10%)"
                :body-style="{
                  padding: 0,
                  color:severityColor(item.severity)
                }"
              >
                <p>{{ $t(`Docker.${item.severity}`) }}</p>
                <p style="fontSize: 40px; margin: 10px;">
                  {{ item.value || 0 }}
                </p>
              </el-card>
            </el-col>
          </el-row>
          <div
            class="text-center font-bold"
            style="
              padding: 10px;
              background: #606260;
              color: #fff;
            "
          >
            {{ $t('Docker.AlertDetail') }}
          </div>
          <el-table
            v-loading="listLoading"
            :row-class-name="getRowClass"
            :element-loading-text="$t('Loading')"
            :data="listData"
            size="small"
            fit
          >
            <el-table-column type="expand">
              <template slot-scope="{row}">
                <p class="ml-3">
                  {{ row.description }}
                </p>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('Docker.Package')"
              prop="name"
              align="center"
            />
            <el-table-column
              :label="$t('Docker.Vulnerability')"
              prop="id"
              align="center"
            >
              <template slot-scope="{row}">
                <el-link
                  type="primary"
                  target="_blank"
                  :href="row.dataSource"
                >
                  {{ row.id }}
                </el-link>
              </template>
            </el-table-column>
            <ElTableColumnTag
              :label="$t('Docker.Severity')"
              prop="severity"
              size="small"
              location="docker"
              min-width="50"
              i18n-key="Docker"
            />
            <el-table-column
              :label="$t('Docker.Licenses')"
              prop="licenses"
              align="center"
              min-width="100"
            >
              <template slot-scope="{row}">
                <el-tooltip
                  v-if="row.licenses"
                  effect="dark"
                  placement="right"
                  :disabled="row.licenses.length < 4"
                >
                  <ul
                    slot="content"
                    class="text-left"
                    style="margin: 0; padding-left: 1rem;"
                  >
                    <li
                      v-for="(item, index) in row.licenses"
                      :key="index"
                    >
                      {{ item }}
                    </li>
                  </ul>
                  <ul
                    class="text-left"
                    style="margin: 0; padding-left: 1rem;"
                  >
                    <li
                      v-for="(item, index) in row.licenses.slice(0,row.licenses.length === 3 ? 3 : 2)"
                      :key="index"
                    >
                      {{ item }}
                      <div
                        v-if="row.licenses.length > 3 && index === 1"
                        class="font-bold"
                      >
                        more . . .
                      </div>
                    </li>
                  </ul>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('Docker.Type')"
              prop="type"
              align="center"
            />
            <el-table-column
              :label="$t('Docker.CurrentVersion')"
              prop="version"
              align="center"
            />
            <el-table-column
              :label="$t('Docker.FixedVersion')"
              prop="versions"
              align="center"
              min-width="100"
            >
              <template slot-scope="{row}">
                <el-tooltip
                  v-if="row.versions"
                  effect="dark"
                  placement="left"
                  :disabled="row.versions.length < 4"
                >
                  <ul
                    slot="content"
                    class="text-left"
                    style="margin: 0; padding-left: 1rem;"
                  >
                    <li
                      v-for="(item, index) in row.versions"
                      :key="index"
                    >
                      {{ item }}
                    </li>
                  </ul>
                  <ul
                    class="text-left"
                    style="margin: 0; padding-left: 1rem;"
                  >
                    <li
                      v-for="(item, index) in row.versions.slice(0,row.licenses.length === 3 ? 3 : 2)"
                      :key="index"
                    >
                      {{ item }}
                      <div
                        v-if="row.licenses.length > 3 && index === 1"
                        class="font-bold"
                      >
                        more . . .
                      </div>
                    </li>
                  </ul>
                </el-tooltip>
              </template>
            </el-table-column>
            <template slot="empty">
              <el-empty :description="$t('general.NoData')" />
            </template>
          </el-table>
          <Pagination
            :total="listQuery.total"
            :page="listQuery.current"
            :limit="listQuery.per_page"
            :page-sizes="[50, 100, 200, 300, listQuery.total]"
            :layout="'total, sizes, prev, pager, next'"
            @pagination="onPagination"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectInfos } from '@/api/projects'
import { getSbomRiskOverview, getSbomRiskDetail } from '@/api_v2/sbom'
import { UTCtoLocalTime } from '@/filters'
import { Pagination, ElTableColumnTag } from '@/components'

const listQuery = () => ({
  per_page: 100,
  page: 1,
  current: 1,
  total: 0
})

export default {
  name: 'SbomReport',
  components: { Pagination, ElTableColumnTag },
  data() {
    return {
      listQuery: listQuery(),
      title: 'III DevOps',
      listLoading: false,
      listData: [],
      summaryData: [],
      severityLevel: [
        'Critical',
        'High',
        'Medium',
        'Low',
        'Negligible',
        'Unknown'
      ],
      timeNow: null,
      project: {},
      projectName: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    projectId () {
      return this.$route.params.projectId
    },
    branch() {
      return this.$route.params.commitBranch
    },
    commitId() {
      return this.$route.params.commitId
    },
    sbomId() {
      return this.$route.params.sbomId
    },
    packageCount() {
      return this.$route.params.packageCount
    }
  },
  watch: {
    project: {
      handler(val) {
        if (Object.keys(val).length > 0 && val.hasOwnProperty('name')) {
          this.fetchTestReport()
        }
      }
    }
  },
  mounted() {
    this.fetchProjectInfo()
  },
  methods: {
    async fetchProjectInfo() {
      try {
        const res = await getProjectInfos(this.projectId)
        this.project = res.data
        this.projectName = res.data.display
      } catch (error) {
        console.error(error)
      }
    },
    async fetchTestReport() {
      this.listLoading = true
      try {
        await Promise.all([
          getSbomRiskOverview(this.sbomId),
          getSbomRiskDetail(this.sbomId, this.listQuery)
        ]).then((res) => {
          const [overview, detail] = res.map((item) => item.data)
          if (Object.keys(overview).length === 0 || Object.keys(detail).length === 0) return
          this.summaryData = this.setSummaryData(overview)
          this.listData = detail.detail_list
          this.listQuery = detail.page
        })
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
        this.timeNow = sessionStorage.getItem('sbomTime') !== 'null'
          ? UTCtoLocalTime(sessionStorage.getItem('sbomTime')) : '-'
        this.$once('hook:beforeDestroy', () => {
          sessionStorage.removeItem('sbomTime')
        })
      }
    },
    async fetchData() {
      this.listLoading = true
      const res = await getSbomRiskDetail(this.sbomId, this.listQuery)
      this.listData = res.data.detail_list
      this.listQuery = res.data.page
      this.listLoading = false
    },
    async onPagination(query) {
      this.listQuery.per_page = query.limit
      this.listQuery.page = query.page
      await this.fetchData()
    },
    setSummaryData(data) {
      var summary = []
      for (const item of this.severityLevel) {
        const obj = { severity: item, value: data[item] }
        summary.push(obj)
      }
      return summary
    },
    severityColor(item) {
      switch (item) {
        case 'Critical':
          return '#f56c6c'
        case 'High':
          return '#e6a23c'
        case 'Medium':
          return '#409eff'
        case 'Low':
          return '#606260'
        case 'Negligible':
          return '#67c23a'
        case 'Unknown':
          return '#606260'
      }
    },
    getRowClass({ row }) {
      return row.description ? '' : 'row-expand-cover'
    },
    handleBackPage() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

>>> .row-expand-cover .el-table__expand-column .cell {
  display: none;
}

>>> .el-divider__text {
  font-size: 18px;
}

.logo-container {
  position: relative;
  left: 10px;
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: left;
  overflow: hidden;

  .logo {
    width: 32px;
    height: 32px;
    vertical-align: middle;
    margin-right: 12px;
  }

  .title {
    display: inline-block;
    margin: 0;
    font-weight: 600;
    line-height: 50px;
    font-size: 14px;
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    vertical-align: middle;
  }
}

.fix-header {
  top: 0px;
  z-index: 2;
  position: sticky;
  position: -webkit-sticky;
  background: $appMainBg;
  padding-top: 20px;
  // outline: solid 8px $appMainBg;
  box-shadow: -20px 0px 0px 0px $appMainBg, 20px 0px 0px 0px $appMainBg;
}

>>> .el-link--inner{
  border-bottom: 1px solid #409eff;
}
</style>
