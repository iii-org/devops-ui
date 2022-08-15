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
          <span>{{ $t('route.TestReport') }}</span>
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
        <el-button
          v-show="!listLoading"
          type="text"
          class="linkTextColor"
          icon="el-icon-download"
          @click="getSheet('excel')"
        >
          {{ $t('TestReport.DownloadExcel') }}
        </el-button>
        <el-button
          v-show="!listLoading"
          type="text"
          class="linkTextColor"
          icon="el-icon-download"
          @click="getSheet('csv')"
        >
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
          style="
            line-height: 7px;
            color: #429470;
            font-size: 36px;
            text-shadow: #b3b1b1 0.05em 0.05em 0.1em;
          "
        >{{ $t('route.TestReport') }}</div>
        <div style="padding: 40px;">
          <ul class="text-base mb-10 font-semibold">
            <li>{{ $t('general.project_name') }}: {{ projectName }}</li>
            <li>{{ $t('TestReport.TestTime') }}: {{ latestTime }}</li>
            <li>
              {{ $t('general.Branch') }} / {{ $t('TestReport.Commit') }}:
              {{ branch }} /<svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
              {{ commitId }}
            </li>
          </ul>
          <!-- white box test -->
          <div v-show="sonarqube || checkmarx">
            <el-divider content-position="center">{{ $t('TestReport.WhiteBoxTesting') }}</el-divider>
            <SonarQubeReport
              v-show="sonarqube"
              ref="sonarqube"
              :sonarqube="sonarqube"
              :sonar-qube-link="sonarQubeLink"
              :list-loading="listLoading"
            />
            <CheckMarxReport
              v-show="checkmarx"
              ref="checkmarx"
              :checkmarx="checkmarx"
              :list-loading="listLoading"
            />
          </div>
          <!-- black box test -->
          <div v-show="zap || webinspect">
            <el-divider content-position="center">{{ $t('TestReport.BlackBoxTesting') }}</el-divider>
            <ZapReport
              v-show="zap"
              ref="zap"
              :zap="zap"
              :list-loading="listLoading"
            />
            <WebInspectReport
              v-show="webinspect"
              ref="webinspect"
              :webinspect="webinspect"
              :list-loading="listLoading"
            />
          </div>
          <!-- app script test -->
          <div v-show="cmas">
            <el-divider content-position="center">{{ $t('TestReport.AppScriptTesting') }}</el-divider>
            <CmasReport
              ref="cmas"
              :cmas="cmas"
              :list-loading="listLoading"
            />
          </div>
          <!-- api script test -->
          <div v-show="postman">
            <el-divider content-position="center">{{ $t('TestReport.ApiScriptTesting') }}</el-divider>
            <PostmanReport
              ref="postman"
              :postman="postman"
              :list-loading="listLoading"
            />
          </div>
          <!-- web script test -->
          <div v-show="sideex">
            <el-divider content-position="center">{{ $t('TestReport.WebScriptTesting') }}</el-divider>
            <SideexReport
              ref="sideex"
              :sideex="sideex"
              :list-loading="listLoading"
            />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { UTCtoLocalTime, formatTime } from '@/filters/index'
import { getProjectCommitTestSummary, getProjectInfos } from '@/api/projects'
import XLSX from 'xlsx'
import SonarQubeReport from '@/views/Progress/Pipelines/components/SonarQubeReport'
import CheckMarxReport from '@/views/Progress/Pipelines/components/CheckMarxReport'
import ZapReport from '@/views/Progress/Pipelines/components/ZapReport'
import WebInspectReport from '@/views/Progress/Pipelines/components/WebInspectReport'
import PostmanReport from '@/views/Progress/Pipelines/components/PostmanReport'
import SideexReport from '@/views/Progress/Pipelines/components/SideexReport'
import CmasReport from '@/views/Progress/Pipelines/components/CmasReport'

const downloadFileName = 'DevOps_test_report'
const dataName = [
  'sonarqube',
  'checkmarx',
  'zap',
  'webinspect',
  'cmas',
  'postman',
  'sideex'
]

export default {
  name: 'TestReport',
  components: {
    SonarQubeReport,
    CheckMarxReport,
    ZapReport,
    WebInspectReport,
    CmasReport,
    PostmanReport,
    SideexReport
  },
  data() {
    this.title = 'III DevOps'
    return {
      projectName: '',
      listLoading: false,
      sonarqube: [],
      checkmarx: [],
      zap: [],
      webinspect: [],
      cmas: [],
      postman: [],
      sideex: [],
      sonarQubeLink: '',
      dataTimeArr: []
    }
  },
  computed: {
    latestTime() {
      return this.dataTimeArr[0]
    },
    projectId () {
      return this.$route.params.projectId
    },
    branch() {
      return this.$route.params.commitBranch
    },
    commitId() {
      return this.$route.params.commitId
    },
    handleDataTime() {
      const dataTimeArr = []
      dataName.forEach(name => {
        if (!this[name]) return
        if (this[name][0] && this[name][0].run_at) {
          name === 'sonarqube'
            ? dataTimeArr.push(formatTime(this[name][0].run_at))
            : dataTimeArr.push(UTCtoLocalTime(this[name][0].run_at))
        }
      })
      return dataTimeArr.sort((a, b) => Date.parse(b) - Date.parse(a))
    },
    getTableDom() {
      let dom = null
      // create a new div and append all the table dom on it
      const newDiv = document.createElement('div')
      // table dom
      dataName.forEach(name => {
        if (this[name]) {
          dom = this.$refs[name].$refs[`table_${name}`].$el.cloneNode(true)
          newDiv.appendChild(dom)
        }
      })
      return newDiv
    }
  },
  mounted() {
    this.fetchProjectInfo()
    this.fetchTestReport()
  },
  methods: {
    async fetchProjectInfo() {
      try {
        const res = await getProjectInfos(this.projectId)
        this.projectName = res.data.display
      } catch (error) {
        console.error(error)
      }
    },
    async fetchTestReport() {
      this.listLoading = true
      try {
        const res = await getProjectCommitTestSummary(this.projectId, this.commitId)
        dataName.forEach(name => this.setTestReportData(res.data, name))
        this.dataTimeArr = this.handleDataTime
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    setTestReportData(resData, name) {
      const data = resData[name]
      if (name === 'sonarqube') {
        this.setSonarQubeData(resData)
      } else if (data) {
        this[name].push(data)
      } else {
        this[name] = undefined
      }
    },
    setSonarQubeData(data) {
      if (data.sonarqube) {
        this.sonarqube = this.handleSonarQubeData(data.sonarqube.history)
        this.sonarQubeLink = data.sonarqube.link
      } else this.sonarqube = undefined
    },
    handleSonarQubeData(data) {
      const ret = []
      if (!data) return ret
      Object.keys(data).forEach(key => {
        const row = data[key]
        row['run_at'] = key
        ret.push(row)
      })
      return ret
    },
    handleBackPage() {
      this.$router.go(-1)
    },
    async downloadPdf() {
      await this.$pdf(this.$refs.pdfPage, downloadFileName)
    },
    async getSheet(filename_extension) {
      const newDiv = await this.getTableDom
      // use XLSX to transform a sheet from tables
      const sheet = XLSX.utils.table_to_sheet(newDiv)
      await this.download(sheet, filename_extension)
    },
    async download(sheet, filename_extension) {
      switch (filename_extension) {
        case 'csv':
          await this.$csv(sheet, downloadFileName)
          break
        case 'excel':
          await this.$excel(sheet, downloadFileName)
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
