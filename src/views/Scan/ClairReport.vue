<template>
  <div class="app-container">
    <div class="mr-3 flex justify-between">
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
        <span class="ml-2 text-xl">
          <span>Docker Image Vulnerability Scan Report</span>
        </span>
      </div>
      <div>
        <el-button
          v-show="!listLoading"
          type="text"
          class="linkTextColor"
          icon="el-icon-download"
          @click="downloadPdf"
        >
          {{ $t('TestReport.DownloadPdf') }}
        </el-button>
      </div>
    </div>
    <div ref="pdfPage">
      <el-card class="shadow-md">
        <div class="logo-container">
          <img src="@/assets/logo.png" class="logo">
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
        >Docker Image Vulnerability Scan Report</div>
        <div style="padding: 40px;">
          <ul class="text-base mb-10 font-semibold">
            <li>{{ $t('general.project_name') }}: {{ selectedProject.display }}</li>
            <li>{{ $t('TestReport.TestTime') }}: {{ timeNow }}</li>
            <li>
              {{ $t('general.Branch') }} / {{ $t('TestReport.Commit') }}:
              {{ branch }} /<svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
              {{ commitId }}
            </li>
          </ul>
          <!-- white box test -->
          <el-table
            ref="table_checkmarx"
            v-loading="listLoading"
            class="mb-10"
            :element-loading-text="$t('Loading')"
            :data="summaryData"
            size="small"
            border
            fit
          >
            <el-table-column align="center" label="Severity" prop="severity" />
            <el-table-column align="center" label="Count" prop="value" />
          </el-table>
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
            <el-table-column align="center" width="180px" label="Vulnerability" prop="id" />
            <el-table-column align="center" label="Severity" prop="severity" />
            <el-table-column align="center" label="Package" prop="package" />
            <el-table-column align="center" label="Current Version" prop="version" />
            <el-table-column align="center" label="Fixed in Version" prop="fix_version" />
          </el-table>
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
            <el-table-column align="center" width="180px" label="Vulnerability" prop="id" />
            <el-table-column align="center" label="Description" prop="description" />
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UTCtoLocalTime } from '@/filters/index'
import { getHarborScanReport } from '@/api_v2/harbor'

const downloadFileName = 'Docker_Image_Vulnerability_Scan_Report'

export default {
  name: 'ClairReport',
  data() {
    return {
      title: 'III DevOps',
      listLoading: false,
      listData: [],
      scanner: [],
      dataTimeArr: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    timeNow() {
      return UTCtoLocalTime(this.dataTimeArr[0])
    },
    branch() {
      return this.$route.params.commitBranch
    },
    commitId() {
      return this.$route.params.commitId
    },
    summaryData() {
      return this.$route.params.summary
    }
  },
  mounted() {
    this.loadTestReport()
  },
  methods: {
    async loadTestReport() {
      this.listLoading = true
      try {
        const res = await getHarborScanReport(this.selectedProject.name, { branch: this.branch, commit_id: this.commitId })
        // this.listData = res.data.vulnerabilities
        this.listData = this.sortVulnerabilityData(res.data.vulnerabilities)
        this.scanner = res.data.scanner
        console.log(res)
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    sortVulnerabilityData(data) {
      var sortedData = []
      for (const severity of this.summaryData.map(s => s.severity)) {
        console.log(severity)
        const sorted = data.filter(item => item.severity === severity)
        sortedData = [...sortedData, ...sorted]
      }
      console.log(sortedData)
      return sortedData
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
</style>
