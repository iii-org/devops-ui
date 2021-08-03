<template>
  <div class="app-container">
    <div class="mr-3">
      <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous" @click="handleBackPage">
        {{ $t('general.Back') }}
      </el-button>
      <span class="ml-2 text-xl">
        <span>{{ $t('route.testReport') }}</span>
      </span>
      <span class="text-base ml-20">
        <span class="ml-10 inline">{{ $t('TestReport.TestTime') }}: {{ timeNow }}</span>
        <span class="ml-10 inline">
          {{ $t('general.Branch') }} / {{ $t('TestReport.Commit') }}:
          {{ branch }} /<svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
          {{ commitId }}
        </span>
      </span>
    </div>
    <div class="ml-20 mr-20">
      <el-divider content-position="center">{{ $t('TestReport.WhiteBoxTesting') }}</el-divider>
      <ToolBar>
        <span slot="toolName">SonarQube</span>
      </ToolBar>
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="sonarQubeData"
        border
        fit
      >
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
      </ToolBar>
      <el-table
        v-loading="listLoading"
        class="mb-10"
        :element-loading-text="$t('Loading')"
        :data="checkMarxData"
        border
        fit
      >
        <el-table-column align="center" :label="$t('CheckMarx.HighSeverity')" prop="stats.highSeverity" />
        <el-table-column align="center" :label="$t('CheckMarx.MediumSeverity')" prop="stats.mediumSeverity" />
        <el-table-column align="center" :label="$t('CheckMarx.LowSeverity')" prop="stats.lowSeverity" />
        <el-table-column align="center" :label="$t('CheckMarx.InfoSeverity')" prop="stats.infoSeverity" />
      </el-table>
      <el-divider content-position="center">{{ $t('TestReport.BlackBoxTesting') }}</el-divider>
      <ToolBar>
        <span slot="toolName">OWASP ZAP</span>
      </ToolBar>
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="zapData"
        border
        fit
      >
        <el-table-column align="center" :label="$t('Zap.high')">
          <template slot-scope="scope">
            <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['3'] }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Zap.medium')">
          <template slot-scope="scope">
            <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['2'] }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Zap.low')">
          <template slot-scope="scope">
            <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['1'] }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Info')">
          <template slot-scope="scope">
            <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['0'] }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <ToolBar>
        <span slot="toolName">WebInspect</span>
      </ToolBar>
      <el-table
        v-loading="listLoading"
        class="mb-10"
        :element-loading-text="$t('Loading')"
        :data="webInspectData"
        border
        fit
      >
        <el-table-column align="center" :label="$t('WebInspect.Critical')" prop="stats.criticalCount" />
        <el-table-column align="center" :label="$t('WebInspect.HighSeverity')" prop="stats.highCount" />
        <el-table-column align="center" :label="$t('WebInspect.MediumSeverity')" prop="stats.mediumCount" />
        <el-table-column align="center" :label="$t('WebInspect.LowSeverity')" prop="stats.lowCount" />
        <el-table-column align="center" :label="$t('WebInspect.InfoSeverity')" prop="stats.infoCount" />
        <el-table-column align="center" :label="$t('WebInspect.BpSeverity')" prop="stats.bpCount">
          <template slot-scope="scope">
            <span v-if="scope.row.stats.bpCount">{{ scope.row.stats.bpCount }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <el-divider content-position="center">{{ $t('TestReport.ApiScriptTesting') }}</el-divider>
      <ToolBar>
        <span slot="toolName">Postman</span>
      </ToolBar>
      <el-table
        v-loading="listLoading"
        class="mb-10"
        :element-loading-text="$t('Loading')"
        :data="postmanData"
        border
        fit
      >
        <el-table-column align="center" :label="$t('Postman.TestPass')" prop="success" min-width="100" />
        <el-table-column align="center" :label="$t('Postman.TestFail')" prop="failure" min-width="100" />
      </el-table>
      <el-divider content-position="center">{{ $t('TestReport.WebScriptTesting') }}</el-divider>
      <ToolBar>
        <span slot="toolName">Sideex</span>
      </ToolBar>
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="sideexData"
        border
        fit
      >
        <el-table-column align="center" :label="$t('Sideex.suitesPassedRatio')">
          <template slot-scope="scope">
            <span v-if="Object.keys(scope.row.result).length > 0">
              {{ scope.row.result.suitesPassed }}/{{ scope.row.result.suitesTotal }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Sideex.casesPassedRatio')">
          <template slot-scope="scope">
            <span v-if="Object.keys(scope.row.result).length > 0">
              {{ scope.row.result.casesPassed }}/{{ scope.row.result.casesTotal }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UTCtoLocalTime } from '@/filters/index'
import { getSonarQubeData } from '@/api/sonarQube'
import { getCheckMarxScans } from '@/api/checkMarx'
import { getWebInspectScans } from '@/api/webInspect'
import { getZapScans } from '@/api/zap'
import { getPostmanResult } from '@/api/postman'
import { getSideexScans } from '@/api/sideex'
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'

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
      sideexData: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    selectedProjectName() {
      return this.selectedProject.name
    },
    timeNow() {
      return this.sonarQubeData && this.sonarQubeData.length > 0 ? UTCtoLocalTime(this.sonarQubeData[0].date) : '-'
    },
    branch() {
      return this.sonarQubeData && this.sonarQubeData.length > 0 ? this.sonarQubeData[0].branch : '-'
    },
    commitId() {
      return this.sonarQubeData && this.sonarQubeData.length > 0 ? this.sonarQubeData[0].commit_id : '-'
    }
  },
  created() {
    this.loadTestReport()
  },
  methods: {
    async loadTestReport() {
      this.listLoading = true
      await Promise.all([
        getSonarQubeData(this.selectedProjectName),
        getCheckMarxScans(this.selectedProjectId),
        getZapScans(this.selectedProjectId),
        getWebInspectScans(this.selectedProjectName),
        getPostmanResult(this.selectedProjectId),
        getSideexScans(this.selectedProjectId)
      ]).then(res => {
        const [sonarQubeData, checkMarxData, zapData, webInspectData, postmanData, sideexData] = res
        this.handleSonarQubeData(sonarQubeData.data.history)
        this.handleLatestData(checkMarxData.data, 'checkMarxData')
        this.handleLatestData(zapData.data, 'zapData')
        this.handleLatestData(webInspectData.data, 'webInspectData')
        this.handleLatestData(postmanData.data, 'postmanData')
        this.handleLatestData(sideexData.data, 'sideexData')
        this.listLoading = false
      })
    },
    handleSonarQubeData(data) {
      const ret = []
      for (const key in data) {
        const row = data[key]
        row['date'] = key
        ret.push(row)
      }
      this.handleLatestData(ret, 'sonarQubeData')
    },
    handleLatestData(data, param) {
      let timeParam = ''
      switch (param) {
        case 'sonarQubeData':
          timeParam = 'date'
          break
        case 'checkMarxData':
          timeParam = 'datetime'
          break
        case 'zapData':
          timeParam = 'run_at'
          break
        case 'webInspectData':
          timeParam = 'run_at'
          break
        case 'postmanData':
          timeParam = 'run_at'
          break
        case 'sideexData':
          timeParam = 'run_at'
      }
      data.sort((a, b) => {
        return Date.parse(b[timeParam]) - Date.parse(a[timeParam])
      })
      this[param] = [data[0]]
    },
    convertRating(rating) {
      const r = parseInt(rating)
      if (r) {
        return ['0', 'A', 'B', 'C', 'D', 'E'][r]
      } else {
        return '-'
      }
    },
    handleBackPage() {
      this.$router.push({ name: 'Pipelines' })
    }
  }
}
</script>

<style scoped>
>>> .el-divider__text {
  font-size: 18px;
}
</style>
