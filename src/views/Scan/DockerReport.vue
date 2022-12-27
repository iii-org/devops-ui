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
      <div>
        <!-- <el-button
          v-show="!listLoading"
          type="text"
          class="linkTextColor"
          icon="el-icon-download"
          @click="downloadPdf"
        >
          {{ $t('TestReport.DownloadPdf') }}
        </el-button> -->
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
        <div class="text-center font-bold" style="padding-top: 20px;">
          {{ scanner.name }} {{ scanner.version }}
        </div>
        <div style="padding: 40px;">
          <ul class="text-base font-semibold">
            <li>{{ $t('general.project_name') }}: {{ projectName }}</li>
            <li>{{ $t('TestReport.TestTime') }}: {{ timeNow }}</li>
            <li>
              {{ $t('general.Branch') }} / {{ $t('TestReport.Commit') }}:
              {{ branch }} /<svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
              {{ commitId }}
            </li>
            <li>{{ $t('Docker.Size') }}: {{ size }}</li>
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
            ref="table_checkmarx"
            v-loading="listLoading"
            class="mb-10"
            :element-loading-text="$t('Loading')"
            :data="listData"
            size="small"
            border
            fit
          >
            <el-table-column align="center" type="index" width="50" />
            <el-table-column align="center" width="180px" :label="$t('Docker.Vulnerability')" prop="id">
              <template slot-scope="scope">
                <el-link
                  class="linkTextColor"
                  target="_blank"
                  style="font-size: 16px"
                  :href="scope.row.links[0]"
                >
                  {{ scope.row.id }}
                </el-link>
              </template>
            </el-table-column>
            <ElTableColumnTag
              :label="$t('Docker.Severity')"
              prop="severity"
              size="small"
              location="docker"
              min-width="130"
              i18n-key="Docker"
            />
            <el-table-column align="center" :label="$t('Docker.Package')" prop="package" />
            <el-table-column align="center" :label="$t('Docker.CurrentVersion')" prop="version" />
            <el-table-column align="center" :label="$t('Docker.FixedVersion')" prop="fix_version" />
          </el-table>
          <div
            class="text-center font-bold"
            style="
              padding: 10px;
              background: #606260;
              color: #fff;
            "
          >
            {{ $t('Docker.Reference') }}
          </div>
          <el-table
            ref="table_checkmarx"
            v-loading="listLoading"
            class="mb-10"
            :element-loading-text="$t('Loading')"
            :data="listData"
            size="small"
            border
            fit
          >
            <el-table-column align="center" type="index" width="50" />
            <el-table-column align="center" width="180px" :label="$t('Docker.Vulnerability')" prop="id">
              <template slot-scope="scope">
                <el-link
                  class="linkTextColor"
                  target="_blank"
                  style="font-size: 16px"
                  :href="scope.row.links[0]"
                >
                  {{ scope.row.id }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column header-align="center" :label="$t('general.Description')" prop="description">
              <template slot-scope="scope">
                {{ scope.row.description || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getHarborScanReport } from '@/api_v2/harbor'
import { getProjectInfos } from '@/api/projects'
import { UTCtoLocalTime } from '@/filters'
import { ElTableColumnTag } from '@/components'

const downloadFileName = 'Docker_Image_Vulnerability_Scan_Report'

export default {
  name: 'DockerReport',
  components: { ElTableColumnTag },
  data() {
    return {
      title: 'III DevOps',
      listLoading: false,
      listData: [],
      scanner: [],
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
    size() {
      return this.$route.params.size
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
        const res = await getHarborScanReport(this.project.name, { branch: this.branch, commit_id: this.commitId })
        this.summaryData = this.setSummaryData(res.data.overview)
        this.listData = this.sortVulnerabilityData(res.data.vulnerabilities)
        this.timeNow = UTCtoLocalTime(res.data.generated_at)
        this.scanner = res.data.scanner
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    sortVulnerabilityData(data) {
      var sortedData = []
      for (const severity of this.summaryData.map(s => s.severity)) {
        const sorted = data.filter(item => item.severity === severity)
        sortedData = [...sortedData, ...sorted]
      }
      return sortedData
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
    handleBackPage() {
      this.$router.go(-1)
    },
    async downloadPdf() {
      await this.$pdf(this.$refs.pdfPage, downloadFileName)
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
