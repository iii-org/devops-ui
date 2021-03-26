<template>
  <el-card v-loading="isLoading" class="mb-3" shadow="hover">
    <div slot="header" class="d-flex justify-space-between align-center" :style="{ height: '30px' }">
      <span class="font-weight-bold">{{ $t('Dashboard.TestStatus') }}</span>
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
    <div v-if="!selectedProjectId" class="d-flex justify-center align-center" style="height: 300px">
      <span>{{ $t('general.NoData') }}</span>
    </div>
    <el-table v-else :data="testResultList" style="width: 100%" stripe>
      <el-table-column :label="$t('Dashboard.Software')" prop="Software" width="110">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" style="font-size: 16px" @click="handleClick(scope.row.Software)">
            {{ scope.row.Software }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-time :label="$t('general.RunAt')" prop="runAt" />
      <el-table-column :label="$t('Dashboard.Brief')" prop="informationText" width="180">
        <template slot-scope="scope">
          <div v-if="Object.keys(scope.row.informationText).length === 0">
            {{ $t('general.NoData') }}
          </div>
          <div v-else>
            <div v-for="item in scope.row.informationText" :key="item.status">
              <span class="text-subtitle-2">{{ item.status }}</span>
              <span class="text-subtitle-1 font-weight-bold">{{ item.count }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Dashboard.Report')" align="center">
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
      </el-table-column>
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
  data: () => ({
    testResultList: [],
    isDisabled: false
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    projectTestObj(val) {
      this.testResultList = this.handleTestRes(val)
    }
  },
  methods: {
    handleTestRes(data) {
      const ret = []
      const rowData = Object.values(data)
      // console.log('handleTestRes', rowData)
      ret[0] = this.formatPostmanResult(rowData[0])
      ret[1] = this.formatCheckmarxResult(rowData[1])
      ret[2] = this.formatWebinspectResult(rowData[2])
      return ret
    },
    formatPostmanResult(postmanResult) {
      // const rowData = { id: 144, passed: 0, failed: 0, total: 0, run_at: '2021-03-11 16:44:17.274099' }
      // console.log('formatPostmanResult', postmanResult)
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
            { status: 'passed', count: postmanResult['passed'] },
            { status: 'failed', count: postmanResult['failed'] },
            { status: 'total', count: postmanResult['total'] }
          ]
        })
      }
      return ret
    },
    formatCheckmarxResult(checkmarxResult) {
      // const rowData = {
      //   message: 'success',
      //   status: 3,
      //   highSeverity: 0,
      //   mediumSeverity: 0,
      //   lowSeverity: 0,
      //   infoSeverity: 0,
      //   statisticsCalculationDate: '2020-12-31T15:32:38.003',
      //   run_at: '2020-12-31 07:31:15.116494',
      //   report_id: 5556
      // }
      // console.log('formatCheckmarxResult', checkmarxResult)
      const ret = {}
      if (Object.keys(checkmarxResult).length === 0) {
        Object.assign(ret, {
          Software: 'checkmarx',
          report_id: '',
          status: '',
          runAt: '',
          informationText: []
        })
      }
      if (checkmarxResult.report_id === undefined) {
        Object.assign(ret, {
          Software: 'checkmarx',
          runAt: '',
          informationText: [{ status: checkmarxResult.message, count: '' }]
        })
      } else {
        Object.assign(ret, {
          Software: 'checkmarx',
          report_id: checkmarxResult.report_id,
          runAt: checkmarxResult.run_at,
          informationText: [
            { status: 'highSeverity', count: checkmarxResult['highSeverity'] },
            { status: 'mediumSeverity', count: checkmarxResult['mediumSeverity'] },
            { status: 'lowSeverity', count: checkmarxResult['lowSeverity'] },
            { status: 'infoSeverity', count: checkmarxResult['infoSeverity'] }
          ]
        })
      }
      return ret
    },

    // getCheckmarxStatusText(statusCode) {
    //   switch (statusCode) {
    //     case -1:
    //       return 'This project does not have any scan.'
    //     case 1:
    //       return 'The scan is not completed yet. It may take several hours to complete.'
    //     case 2:
    //       return 'Scan done, the system is generating a report. It may take several minutes to complete.'
    //     case 3:
    //       object['report_id'] = apiProjectData.test_results[i].report_id
    //       return
    //     case 4:
    //       return 'The scan is canceled.'
    //     case 5:
    //       return 'The scan failed.'
    //     case undefined:
    //       return 'No data.'
    //   }
    // },

    formatWebinspectResult(webinspectResult) {
      // const rowData = {
      //   '0': 3,
      //   '1': 2,
      //   '2': 0,
      //   '3': 0,
      //   '4': 0,
      //   status: 'Complete',
      //   run_at: '2021-03-12 07:54:14.679501'
      // }
      const ret = {}
      if (Object.keys(webinspectResult).length === 0) {
        Object.assign(ret, {
          Software: 'webinspect',
          informationText: []
        })
      } else {
        Object.assign(ret, {
          Software: 'webinspect',
          // status: webinspectResult.status,
          runAt: webinspectResult.run_at,
          informationText: [
            { status: 'Critical', count: webinspectResult['0'] },
            { status: 'High Severity', count: webinspectResult['1'] },
            { status: 'Medium Severity', count: webinspectResult['2'] },
            { status: 'Low Severity', count: webinspectResult['3'] },
            { status: 'Info Severity', count: webinspectResult['4'] }
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
      })
      this.isDisabled = false
    },
    handleClick(target) {
      switch (target) {
        case 'postman':
          this.$router.push({ name: 'postman-result' })
          break
        case 'checkmarx':
          this.$router.push({ name: 'checkmarx' })
          break
        case 'webinspect':
          this.$router.push({ name: 'web-inspect' })
          break
        default:
          this.$router.push({ name: '404' })
          break
      }
    },
    updateProjectTestList() {
      this.$emit('update')
    }
  }
}
</script>
