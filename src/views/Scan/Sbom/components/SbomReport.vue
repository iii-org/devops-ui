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
                <p
                  style="
                    fontSize: 40px;
                    margin: 10px;
                  "
                >
                  {{ item.value }}
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
            ref="sbomTable"
            v-loading="listLoading"
            :row-class-name="getRowClass"
            :element-loading-text="$t('Loading')"
            :data="listData"
            size="small"
            border
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
              :label="$t('Docker.Vulnerability')"
              prop="id"
              align="center"
              width="180px"
            />
            <ElTableColumnTag
              :label="$t('Docker.Severity')"
              prop="severity"
              size="small"
              location="docker"
              min-width="130"
              i18n-key="Docker"
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
            />
          </el-table>
          <pagination
            :total="listQuery.total"
            :page="listQuery.page"
            :limit="listQuery.per_page"
            :layout="'total, prev, pager, next'"
            @pagination="onPagination"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UTCtoLocalTime } from '@/filters/index'
import { getProjectInfos } from '@/api/projects'
import {
  getSbomRiskOverview,
  getSbomRiskDetail
} from '@/api_v2/sbom'
import MixinElTable from '@/mixins/MixinElTable'
import ElTableColumnTag from '@/components/ElTableColumnTag'

const params = () => ({
  per_page: 10,
  page: 1
})

const listQuery = () => ({
  total: 0,
  current: 0,
  per_page: 0
})

export default {
  name: 'SbomReport',
  components: { ElTableColumnTag },
  mixins: [MixinElTable],
  data() {
    return {
      params: params(),
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
    }
  },
  watch: {
    project: {
      handler(val) {
        if (Object.keys(val).length > 0 && val.hasOwnProperty('name')) {
          this.fetchTestReport()
        }
      },
      immediate: true
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
          getSbomRiskDetail(this.sbomId, this.params)
        ]).then((res) => {
          const [overview, detail] = res.map((item) => item.data)
          this.summaryData = this.setSummaryData(overview)
          this.listData = detail.detail_list
          this.listQuery = detail.page
          this.timeNow = UTCtoLocalTime(localStorage.getItem('sbomTime'))
          this.$once('hook:beforeDestroy', () => {
            localStorage.removeItem('sbomTime')
          })
        })
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    async fetchData() {
      this.listLoading = true
      const res = await getSbomRiskDetail(this.sbomId, this.params)
      this.listData = res.data.detail_list
      this.listQuery = res.data.page
      this.listLoading = false
    },
    async onPagination(query) {
      const { page } = query
      this.params.page = page
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
    getRowClass(row) {
      if (!row.row.description) return 'hide-expand-icon'
    },
    handleBackPage() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

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
</style>
