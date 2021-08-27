<template>
  <div class="app-container">
    <div class="mr-3 flex justify-between">
      <div>
        <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous" @click="handleBackPage">
          {{ $t('general.Back') }}
        </el-button>
        <span class="ml-2 text-xl">
          <span>{{ $t('route.testReport') }}</span>
        </span>
      </div>
      <div>
        <el-button v-show="!listLoading" type="text" icon="el-icon-download" @click="downloadPdf">
          {{ $t('TestReport.DownloadPdf') }}
        </el-button>
        <el-button v-show="!listLoading" type="text" icon="el-icon-download" @click="getSheet('excel')">
          {{ $t('TestReport.DownloadExcel') }}
        </el-button>
        <el-button v-show="!listLoading" type="text" icon="el-icon-download" @click="getSheet('csv')">
          {{ $t('TestReport.DownloadCsv') }}
        </el-button>
      </div>
    </div>
    <div ref="pdfPage">
      <el-card>
        <div class="text-center text-2xl bg-gray-300 clearfix" style="line-height: 50px;">{{ $t('route.testReport') }}</div>
        <div style="padding: 40px;">
          <ul class="text-base mb-10">
            <li>{{ $t('TestReport.TestTime') }}: {{ timeNow }}</li>
            <li>
              {{ $t('general.Branch') }} / {{ $t('TestReport.Commit') }}:
              {{ branch }} /<svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
              {{ commitId }}
            </li>
          </ul>
          <el-divider content-position="center">{{ $t('TestReport.WhiteBoxTesting') }}</el-divider>
          <ToolBar>
            <span slot="toolName">SonarQube</span>
            <el-button slot="link" type="text" icon="el-icon-position" :disabled="!sonarQubeLink" @click="openSonarQube">
              {{ $t('TestReport.DetailReport') }}
            </el-button>
          </ToolBar>
          <el-table
            ref="tableSonarQube"
            v-loading="listLoading"
            :element-loading-text="$t('Loading')"
            :data="sonarQubeData"
            border
            fit
          >
            <el-table-column align="center" :label="$t('DevOps.Tools')">SonarQube</el-table-column>
            <el-table-column align="center" :label="$t('SonarQube.Bugs')">
              <template slot-scope="scope">
                <span>{{ scope.row.bugs }} ({{ convertRating(scope.row.reliability_rating) }})</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('SonarQube.Vulnerabilities')">
              <template slot-scope="scope">
                <span>{{ scope.row.vulnerabilities }} ({{ convertRating(scope.row.security_rating) }})</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('SonarQube.CodeSmells')">
              <template slot-scope="scope">
                <span>{{ scope.row.code_smells }} ({{ convertRating(scope.row.sqale_rating) }})</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('SonarQube.Duplicates')">
              <template slot-scope="scope">
                <span>{{ scope.row.duplicated_blocks }} ({{ scope.row.duplicated_lines_density }}%)</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('SonarQube.Coverage')">
              <template slot-scope="scope">
                <span>{{ scope.row.coverage === '' ? '-' : `${scope.row.coverage}%` }}</span>
              </template>
            </el-table-column>
          </el-table>
          <ToolBar>
            <span slot="toolName">CheckMarx</span>
            <el-button slot="link" type="text" icon="el-icon-download" :disabled="Object.keys(checkMarxData[0]).length === 0" @click="openCheckMarx">
              {{ $t('TestReport.DetailReport') }}
            </el-button>
          </ToolBar>
          <el-table
            ref="tableCheckMarx"
            v-loading="listLoading"
            class="mb-10"
            :element-loading-text="$t('Loading')"
            :data="checkMarxData"
            border
            fit
          >
            <el-table-column align="center" :label="$t('DevOps.Tools')">CheckMarx</el-table-column>
            <el-table-column align="center" :label="$t('CheckMarx.HighSeverity')" prop="stats.highSeverity">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.highSeverity }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('CheckMarx.MediumSeverity')" prop="stats.mediumSeverity">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.mediumSeverity }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('CheckMarx.LowSeverity')" prop="stats.lowSeverity">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.lowSeverity }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('CheckMarx.InfoSeverity')" prop="stats.infoSeverity">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.infoSeverity }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-divider content-position="center">{{ $t('TestReport.BlackBoxTesting') }}</el-divider>
          <ToolBar>
            <span slot="toolName">OWASP ZAP</span>
            <el-button slot="link" type="text" icon="el-icon-position" :disabled="Object.keys(zapData[0]).length === 0" @click="openZap">
              {{ $t('TestReport.DetailReport') }}
            </el-button>
          </ToolBar>
          <el-table
            ref="tableZAP"
            v-loading="listLoading"
            :element-loading-text="$t('Loading')"
            :data="zapData"
            border
            fit
          >
            <el-table-column align="center" :label="$t('DevOps.Tools')">OWASP ZAP</el-table-column>
            <el-table-column align="center" :label="$t('Zap.high')">
              <template slot-scope="scope">
                <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['3'] }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('Zap.medium')">
              <template slot-scope="scope">
                <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['2'] }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('Zap.low')">
              <template slot-scope="scope">
                <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['1'] }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('general.Info')">
              <template slot-scope="scope">
                <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['0'] }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <ToolBar>
            <span slot="toolName">WebInspect</span>
            <el-button slot="link" type="text" icon="el-icon-tickets" :disabled="Object.keys(webInspectData[0]).length === 0" @click="openWebInspect">
              {{ $t('TestReport.DetailReport') }}
            </el-button>
          </ToolBar>
          <el-table
            ref="tableWebInspect"
            v-loading="listLoading"
            class="mb-10"
            :element-loading-text="$t('Loading')"
            :data="webInspectData"
            border
            fit
          >
            <el-table-column align="center" :label="$t('DevOps.Tools')">WebInspect</el-table-column>
            <el-table-column align="center" :label="$t('WebInspect.Critical')" prop="stats.criticalCount">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.criticalCount }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('WebInspect.HighSeverity')" prop="stats.highCount">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.highCount }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('WebInspect.MediumSeverity')" prop="stats.mediumCount">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.mediumCount }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('WebInspect.LowSeverity')" prop="stats.lowCount">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.lowCount }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('WebInspect.InfoSeverity')" prop="stats.infoCount">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.infoCount }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('WebInspect.BpSeverity')" prop="stats.bpCount">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.bpCount }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-divider content-position="center">{{ $t('TestReport.ApiScriptTesting') }}</el-divider>
          <ToolBar>
            <span slot="toolName">Postman</span>
            <el-button slot="link" type="text" icon="el-icon-tickets" :disabled="Object.keys(postmanData[0]).length === 0" @click="openPostman">
              {{ $t('TestReport.DetailReport') }}
            </el-button>
          </ToolBar>
          <el-table
            ref="tablePostman"
            v-loading="listLoading"
            class="mb-10"
            :element-loading-text="$t('Loading')"
            :data="postmanData"
            border
            fit
          >
            <el-table-column align="center" :label="$t('DevOps.Tools')">Postman</el-table-column>
            <el-table-column align="center" :label="$t('Postman.TestPass')" prop="success" min-width="100">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.success">{{ scope.row.success }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('Postman.TestFail')" prop="failure" min-width="100">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.failure">{{ scope.row.failure }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-divider content-position="center">{{ $t('TestReport.WebScriptTesting') }}</el-divider>
          <ToolBar>
            <span slot="toolName">Sideex</span>
            <el-button slot="link" type="text" icon="el-icon-position" :disabled="!showSideexReport" @click="openSideex">
              {{ $t('TestReport.DetailReport') }}
            </el-button>
          </ToolBar>
          <el-table
            ref="tableSideex"
            v-loading="listLoading"
            :element-loading-text="$t('Loading')"
            :data="sideexData"
            border
            fit
          >
            <el-table-column align="center" :label="$t('DevOps.Tools')">Sideex</el-table-column>
            <el-table-column align="center" :label="$t('Sideex.suitesPassedRatio')">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.result">
                  {{ scope.row.result.suitesPassed }} {{ $t('TestReport.Item') }} /{{ scope.row.result.suitesTotal }} {{ $t('TestReport.Item') }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('Sideex.casesPassedRatio')">
              <template slot-scope="scope">
                <span v-if="scope.row && scope.row.result">
                  {{ scope.row.result.casesPassed }} {{ $t('TestReport.Item') }} /{{ scope.row.result.casesTotal }} {{ $t('TestReport.Item') }}
                </span>
                <span v-else>-</span>
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
import { UTCtoLocalTime } from '@/filters/index'
import { getCheckMarxReport, registerCheckMarxReport } from '@/api/checkMarx'
import { getSideexReport } from '@/api/sideex'
import { getProjectCommitTestSummary } from '@/api/projects'
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'
import XLSX from 'xlsx'

export default {
  name: 'TestReport',
  components: { ToolBar },
  data() {
    return {
      listLoading: false,
      sonarQubeData: [],
      checkMarxData: [],
      zapData: [],
      webInspectData: [],
      postmanData: [],
      sideexData: [],
      sonarQubeLink: '',
      downloadFileName: 'DevOps_test_report',
      dataName: ['sonarQubeData', 'checkMarxData', 'zapData', 'webInspectData', 'postmanData', 'sideexData'],
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
      return this.sonarQubeData && this.sonarQubeData.length > 0 ? this.sonarQubeData[0].branch : '-'
    },
    commitId() {
      return this.$route.params.commitId
    },
    showSideexReport() {
      return this.sideexData[0] ? this.sideexData[0].status === 'Finished' && this.sideexData[0].has_report : false
    }
  },
  created() {
    this.loadTestReport()
  },
  methods: {
    async loadTestReport() {
      this.listLoading = true
      try {
        const res = await getProjectCommitTestSummary(this.selectedProjectId, this.$route.params.commitId)
        this.sonarQubeData = this.handleSonarQubeData(res.data.sonarqube.history)
        this.sonarQubeLink = res.data.sonarqube.link
        this.checkMarxData.push(res.data.checkmarx)
        this.zapData.push(res.data.zap)
        this.webInspectData.push(res.data.webinspect)
        this.postmanData.push(res.data.postman)
        this.sideexData.push(res.data.sideex)
        this.getDataTime()
        this.listLoading = false
      } catch (error) {
        console.log(error)
        this.listLoading = false
      }
    },
    handleSonarQubeData(data) {
      const ret = []
      for (const key in data) {
        const row = data[key]
        row['run_at'] = key
        ret.push(row)
      }
      return ret
    },
    getDataTime() {
      const dataTimeArr = []
      this.dataName.map(item => {
        if (this[item][0]) item === 'sonarQubeData' ? dataTimeArr.push(this.getSonarQubeTime(this[item][0].run_at)) : dataTimeArr.push(this[item][0].run_at)
      })
      dataTimeArr.sort((a, b) => Date.parse(b) - Date.parse(a))
      this.dataTimeArr = dataTimeArr
    },
    getSonarQubeTime(time) {
      const currentDate = new Date()
      const offset = -(currentDate.getTimezoneOffset() / 60)
      const givenDate = new Date(time)
      let hours = givenDate.getUTCHours()
      hours -= offset
      givenDate.setHours(hours)
      return givenDate
    },
    openSonarQube() {
      window.open(this.sonarQubeLink)
    },
    async openCheckMarx() {
      const { report_id, scan_id } = this.checkMarxData[0]
      await getCheckMarxReport(report_id)
        .then(res => {
          const url = window.URL.createObjectURL(new Blob([res]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'checkmarx_Report.pdf')
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch(_ => {
          this.confirmRegistryReport(scan_id)
        })
    },
    openZap() {
      const { full_log } = this.zapData[0]
      this.showFullLog(full_log)
    },
    openWebInspect() {
      const { scan_id, run_at } = this.webInspectData[0]
      const routeUrl = this.$router.resolve({
        name: 'webinspect-report', params: { scan_id, run_at }
      })
      window.open(routeUrl.href, '_blank')
    },
    openPostman() {
      const { id } = this.postmanData[0]
      const routeUrl = this.$router.resolve({
        name: 'postman-test-case', params: { id }
      })
      window.open(routeUrl.href, '_blank')
    },
    async openSideex() {
      const { id } = this.sideexData[0]
      const res = await getSideexReport(id)
      this.showFullLog(res.data)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    },
    convertRating(rating) {
      const r = parseInt(rating)
      if (r) {
        return ['0', 'A', 'B', 'C', 'D', 'E'][r]
      } else {
        return '-'
      }
    },
    confirmRegistryReport(scan_id) {
      const h = this.$createElement
      this.$msgbox({
        title: this.$t('general.caution'),
        type: 'warning',
        message: h('p', null, [h('div', { style: 'font-size: large' }, this.$t('CheckMarx.registryReport')), h('div', { style: 'color: red' }, this.$t('CheckMarx.registryReportTip'))]),
        showCancelButton: true,
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel')
      }).then(() => {
        this.registerReport(scan_id)
      })
    },
    async registerReport(scanId) {
      this.listLoading = true
      await registerCheckMarxReport(scanId).then(res => {
        const { reportId } = res.data
        const idx = this.listData.findIndex(item => item.scan_id === scanId)
        this.listData[idx].report_id = reportId
        if (reportId > 0) this.fetchReportStatus(reportId)
      })
      this.listLoading = false
    },
    handleBackPage() {
      this.$router.go(-1)
    },
    async downloadPdf() {
      await this.$pdf(this.$refs.pdfPage, this.downloadFileName)
    },
    async getSheet(filename_extension) {
      // table dom
      const tableSonarQube = this.$refs.tableSonarQube.$el.cloneNode(true)
      const tableCheckMarx = this.$refs.tableCheckMarx.$el.cloneNode(true)
      const tableZAP = this.$refs.tableZAP.$el.cloneNode(true)
      const tableWebInspect = this.$refs.tableWebInspect.$el.cloneNode(true)
      const tablePostman = this.$refs.tablePostman.$el.cloneNode(true)
      const tableSideex = this.$refs.tableSideex.$el.cloneNode(true)

      // create a new div and append all the table dom on it
      const newDiv = document.createElement('div')

      newDiv.appendChild(tableSonarQube).appendChild(tableCheckMarx)
        .appendChild(tableZAP).appendChild(tableWebInspect)
        .appendChild(tablePostman).appendChild(tableSideex)

      // use XLSX to transform a sheet from tables
      const sheet = XLSX.utils.table_to_sheet(newDiv)
      await this.download(sheet, filename_extension)
    },
    async download(sheet, filename_extension) {
      switch (filename_extension) {
        case 'csv':
          await this.$csv(sheet, this.downloadFileName)
          break
        case 'excel':
          await this.$excel(sheet, this.downloadFileName)
      }
    }
  }
}
</script>

<style scoped>
>>> .el-divider__text {
  font-size: 18px;
}
</style>
