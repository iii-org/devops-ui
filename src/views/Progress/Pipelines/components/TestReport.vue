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
      <el-card class="shadow-md">
        <div class="logo-container">
          <img src="@/assets/logo.png" class="logo">
          <h1 class="title">{{ title }} </h1>
        </div>
        <div
          class="text-center font-bold clearfix"
          style="line-height: 7px; color: #429470; font-size: 36px; text-shadow: #b3b1b1 0.05em 0.05em 0.1em;"
        >{{ $t('route.testReport') }}</div>
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
          <el-divider content-position="center">{{ $t('TestReport.WhiteBoxTesting') }}</el-divider>
          <SonarQube
            ref="sonarQube"
            :sonar-qube-data="sonarQubeData"
            :sonar-qube-link="sonarQubeLink"
            :list-loading="listLoading"
          />
          <CheckMarx
            ref="checkMarx"
            :check-marx-data="checkMarxData"
            :list-loading="listLoading"
          />
          <el-divider content-position="center">{{ $t('TestReport.BlackBoxTesting') }}</el-divider>
          <Zap
            ref="zap"
            :zap-data="zapData"
            :list-loading="listLoading"
          />
          <WebInspect
            ref="webInspect"
            :web-inspect-data="webInspectData"
            :list-loading="listLoading"
          />
          <el-divider content-position="center">{{ $t('TestReport.ApiScriptTesting') }}</el-divider>
          <Postman
            ref="postman"
            :postman-data="postmanData"
            :list-loading="listLoading"
          />
          <el-divider content-position="center">{{ $t('TestReport.WebScriptTesting') }}</el-divider>
          <Sideex
            ref="sideex"
            :sideex-data="sideexData"
            :list-loading="listLoading"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UTCtoLocalTime } from '@/filters/index'
import { getProjectCommitTestSummary } from '@/api/projects'
import XLSX from 'xlsx'
import SonarQube from '@/views/Progress/Pipelines/components/SonarQubeReport'
import CheckMarx from '@/views/Progress/Pipelines/components/CheckMarxReport'
import Zap from '@/views/Progress/Pipelines/components/ZapReport'
import WebInspect from '@/views/Progress/Pipelines/components/WebInspectReport'
import Postman from '@/views/Progress/Pipelines/components/PostmanReport'
import Sideex from '@/views/Progress/Pipelines/components/SideexReport'

export default {
  name: 'TestReport',
  components: { SonarQube, CheckMarx, Zap, WebInspect, Postman, Sideex },
  data() {
    return {
      title: 'III DevOps',
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
        console.error(error)
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
    handleBackPage() {
      this.$router.go(-1)
    },
    async downloadPdf() {
      await this.$pdf(this.$refs.pdfPage, this.downloadFileName)
    },
    async getSheet(filename_extension) {
      // table dom
      const tableSonarQube = this.$refs.sonarQube.$refs.tableSonarQube.$el.cloneNode(true)
      const tableCheckMarx = this.$refs.checkMarx.$refs.tableCheckMarx.$el.cloneNode(true)
      const tableZAP = this.$refs.zap.$refs.tableZAP.$el.cloneNode(true)
      const tableWebInspect = this.$refs.webInspect.$refs.tableWebInspect.$el.cloneNode(true)
      const tablePostman = this.$refs.postman.$refs.tablePostman.$el.cloneNode(true)
      const tableSideex = this.$refs.sideex.$refs.tableSideex.$el.cloneNode(true)

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
