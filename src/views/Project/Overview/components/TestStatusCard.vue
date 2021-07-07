<template>
  <el-card v-loading="isLoading" :element-loading-text="$t('Loading')" class="mb-3" shadow="never">
    <div slot="header" class="flex justify-between align-center" :style="{ height: '30px' }">
      <span class="font-semibold">{{ $t('Dashboard.TestStatus') }}</span>
      <el-button
        type="text"
        icon="el-icon-refresh"
        size="mini"
        :disabled="selectedProjectId === -1"
        @click="updateProjectTestList()"
      >
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <div v-if="!selectedProjectId" class="flex justify-center align-center" style="height: 300px">
      <span>{{ $t('general.NoData') }}</span>
    </div>
    <el-table v-else :data="testResultList" stripe fit>
      <el-table-column :label="$t('Dashboard.Software')" prop="Software" width="110">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" style="font-size: 16px" @click="handleClick(scope.row.Software)">
            {{ scope.row.Software }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-time :label="$t('general.RunAt')" prop="runAt" />
      <el-table-column :label="$t('Dashboard.Brief')" prop="informationText">
        <template slot-scope="scope">
          <div v-if="Object.keys(scope.row.informationText).length === 0">
            {{ $t('general.NoData') }}
          </div>
          <div v-else>
            <div v-for="item in scope.row.informationText" :key="item.status">
              <span class="text-sm">{{ item.status }}</span>
              <span class="font-base font-bold">{{ item.count }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('Dashboard.Report')" align="center">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.report_id"
            type="primary"
            target="_blank"
            :underline="false"
            icon="el-icon-download"
            :disabled="isDisabled"
            @click="fetchTestReport(scope.row.report_id)"
          />
        </template>
      </el-table-column> -->
    </el-table>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { getTestReport } from '@/api/projects'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'TestStatusCard',
  components: {
    ElTableColumnTime
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    projectTestObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      testResultList: [],
      isDisabled: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    projectTestObj(val) {
      this.testResultList = this.handleTestRes(val)
    },
    '$i18n.locale'() {
      this.testResultList = this.handleTestRes(this.projectTestObj)
    }
  },
  methods: {
    handleTestRes(data) {
      const ret = []
      const rowData = data
      ret[0] = this.formatPostmanResult(rowData['postman'])
      ret[1] = this.formatCheckmarxResult(rowData['checkmarx'])
      ret[2] = this.formatWebinspectResult(rowData['webinspect'])
      ret[3] = this.formatSonarqubeResult(rowData['sonarqube'])
      ret[4] = this.formatZapResult(rowData['zap'])
      ret[5] = this.formatSideexResult(rowData['sideex'])
      return ret
    },
    formatPostmanResult(postmanResult) {
      const ret = {}
      if (Object.keys(postmanResult).length === 0) {
        Object.assign(ret, {
          Software: 'postman',
          runAt: '',
          informationText: []
        })
      } else {
        Object.assign(ret, {
          Software: 'postman',
          runAt: postmanResult.run_at,
          informationText: [
            { status: this.$t('Postman.TestPass'), count: postmanResult['passed'] },
            { status: this.$t('Postman.TestFail'), count: postmanResult['failed'] },
            { status: this.$t('Postman.TestTotal'), count: postmanResult['total'] }
          ]
        })
      }
      return ret
    },
    formatCheckmarxResult(checkmarxResult) {
      const ret = {}
      if (checkmarxResult.status === 3) {
        Object.assign(ret, {
          Software: 'checkmarx',
          report_id: checkmarxResult.report_id,
          runAt: checkmarxResult.run_at,
          informationText: [
            { status: this.$t('CheckMarx.HighSeverity'), count: checkmarxResult['highSeverity'] },
            { status: this.$t('CheckMarx.MediumSeverity'), count: checkmarxResult['mediumSeverity'] },
            { status: this.$t('CheckMarx.LowSeverity'), count: checkmarxResult['lowSeverity'] },
            { status: this.$t('CheckMarx.InfoSeverity'), count: checkmarxResult['infoSeverity'] }
          ]
        })
      } else if (checkmarxResult.status === -1) {
        Object.assign(ret, {
          Software: 'checkmarx',
          report_id: checkmarxResult.report_id,
          runAt: checkmarxResult.run_at,
          informationText: []
        })
      } else {
        Object.assign(ret, {
          Software: 'checkmarx',
          runAt: '',
          informationText: [{ status: this.getCheckmarxStatusText(checkmarxResult.status), count: '' }]
        })
      }
      return ret
    },
    getCheckmarxStatusText(statusCode) {
      const statusString = String(statusCode)
      const mapText = {
        '-1': this.$t('CheckMarx.noScan'),
        '1': this.$t('CheckMarx.notCompletedScan'),
        '2': this.$t('CheckMarx.generatingReportScan'),
        '4': this.$t('CheckMarx.canceledScan'),
        '5': this.$t('CheckMarx.failedScan')
      }
      return mapText[statusString]
    },
    formatWebinspectResult(webinspectResult) {
      const ret = {}
      if (Object.keys(webinspectResult).length === 0) {
        Object.assign(ret, {
          Software: 'webinspect',
          informationText: []
        })
      } else {
        Object.assign(ret, {
          Software: 'webinspect',
          runAt: webinspectResult.run_at,
          informationText: [
            { status: this.$t('WebInspect.BpSeverity'), count: webinspectResult['bpCount'] },
            { status: this.$t('WebInspect.Critical'), count: webinspectResult['criticalCount'] },
            { status: this.$t('WebInspect.HighSeverity'), count: webinspectResult['highCount'] },
            { status: this.$t('WebInspect.MediumSeverity'), count: webinspectResult['mediumCount'] },
            { status: this.$t('WebInspect.LowSeverity'), count: webinspectResult['lowCount'] },
            { status: this.$t('WebInspect.InfoSeverity'), count: webinspectResult['infoCount'] }
          ]
        })
      }
      return ret
    },
    formatSonarqubeResult(sonarqubeResult) {
      const ret = {}
      const informationArr = sonarqubeResult
        .map(row => ({ status: row.metric, count: row.value }))
        .filter(item => item.status !== 'run_at')
      const runAtIdx = sonarqubeResult.findIndex(row => row.metric === 'run_at')
      if (Object.keys(sonarqubeResult).length === 0) {
        Object.assign(ret, {
          Software: 'sonarqube',
          informationText: []
        })
      } else {
        Object.assign(ret, {
          Software: 'sonarqube',
          runAt: runAtIdx > -1 ? sonarqubeResult[runAtIdx].value : undefined,
          informationText: informationArr.map(row => ({ status: this.$t(`SonarQube.${row.status}`), count: row.count }))
        })
      }
      return ret
    },
    formatSideexResult(sideexResult) {
      const ret = {}
      if (Object.keys(sideexResult).length === 0) {
        Object.assign(ret, {
          Software: 'sideex',
          informationText: []
        })
      } else {
        Object.assign(ret, {
          Software: 'sideex',
          runAt: sideexResult.run_at,
          informationText: [
            { status: this.$t('Sideex.suitesPassedRatio'), count: sideexResult.result['suitesPassed'] },
            { status: this.$t('Sideex.suitesPassedTotal'), count: sideexResult.result['suitesTotal'] },
            { status: this.$t('Sideex.casesPassedRatio'), count: sideexResult.result['casesPassed'] },
            { status: this.$t('Sideex.casesPassedTotal'), count: sideexResult.result['casesTotal'] }
          ]
        })
      }
      return ret
    },
    formatZapResult(zapResult) {
      const ret = {}
      if (Object.keys(zapResult).length === 0) {
        Object.assign(ret, {
          Software: 'zap',
          informationText: []
        })
      } else {
        Object.assign(ret, {
          Software: 'zap',
          runAt: zapResult.run_at,
          informationText: [
            { status: this.$t('Zap.critical'), count: zapResult.result['0'] },
            { status: this.$t('Zap.high'), count: zapResult.result['1'] },
            { status: this.$t('Zap.medium'), count: zapResult.result['2'] },
            { status: this.$t('Zap.low'), count: zapResult.result['3'] }
          ]
        })
      }
      return ret
    },
    async fetchTestReport(reportId) {
      this.isDisabled = true
      await getTestReport(reportId).then(res => {
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'checkmarx_Report.pdf')
        document.body.appendChild(link)
        link.click()
        link.remove()
      })
      this.isDisabled = false
    },
    handleClick(target) {
      this.$router.push({ name: target })
    },
    updateProjectTestList() {
      this.$emit('update')
    }
  }
}
</script>
