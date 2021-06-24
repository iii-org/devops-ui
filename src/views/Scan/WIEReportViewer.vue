<template>
  <div v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <div v-if="!isLoading" class="d-flex justify-between align-center mb-2">
      <h3>「{{ selectedProject.display }}」{{ $t('WebInspect.TestReport') }}</h3>
      <span>{{ $t('WebInspect.RunAt') }}：{{ runAt }}</span>
      <el-button icon="el-icon-download" @click="handleDownload">
        {{ $t('WebInspect.DownloadReport') }} (.xml)
      </el-button>
    </div>
    <el-row>
      <el-col :span="24">
        <div v-for="issue in groupByIssueSeverity" :key="issue.id" class="mb-5">
          <div class="bg-blue-500 text-white p-2 font-small font-semibold" :type="mapSeverity('type', issue.severity)">
            {{ mapSeverity('name', issue.severity) + ' Issues' }}
          </div>

          <div class="p-2 mb-3 bg-gray-200  text-xl font-medium">
            {{ issue.name }}
          </div>

          <div class="px-4">
            <div class="text-xl font-semibold">Request：</div>
            <pre class="code-block">{{ issue.request }}</pre>

            <div class="text-xl font-semibold">Response：</div>
            <pre class="code-block">{{ issue.response }}</pre>

            <div
              v-for="(ReportSection, ReportSectionIdx) in issue.reportSection"
              :key="issue.id + ReportSectionIdx"
              class="mb-2"
            >
              <div class="text-lg font-semibold underline">{{ ReportSection.Name }}</div>
              <div v-html="ReportSection.SectionText" />
            </div>

            <div class="text-lg font-semibold underline mb-3">Classifications</div>
            <div v-for="(classification, clIdx) in issue.classifications" :key="clIdx" class="mb-2">
              <div class="text-base font-semibold">{{ classification._ }}</div>
              <el-link type="primary" :href="classification.href" target="blank">
                {{ classification.href }}
              </el-link>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getWebInspectReport } from '@/api/webInspect'
import xml2js from 'xml2js'
import { mapGetters } from 'vuex'
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true })

export default {
  name: 'WIEViewer',
  data() {
    return {
      activeName: '',
      runAt: null,
      isLoading: false,
      xmlData: '',
      jsonData: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    groupByIssueSeverity() {
      const result = this.jsonData.flatMap(item =>
        item.Issues.flatMap(issue => ({
          id: issue.id,
          severity: Number(issue.Severity),
          name: issue.Name,
          request: item.RawRequest._,
          response: item.RawResponse,
          reportSection: issue.ReportSection,
          classifications: issue.Classifications.Classification
        }))
      )
      return result.sort((a, b) => a.severity - b.severity)
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.isLoading = true
      this.runAt = this.UTCtoLocalTime(this.$route.params.run_at)
      getWebInspectReport(this.$route.params.scan_id).then(res => {
        this.xmlData = res
        this.$nextTick(() => this.parseXml())
      })
    },
    parseXml() {
      parser
        .parseStringPromise(this.xmlData)
        .then(result => {
          this.jsonData = this.formatter(result)
          this.activeName = 'Session 1'
          this.isLoading = false
        })
        .catch(function(err) {
          console.error(err)
        })
    },
    formatter(data) {
      const sessions = data.Sessions.Session.filter(session => this.formatIssues(session.Issues).length > 0)
      sessions.forEach(session => {
        session.Issues = this.formatIssues(session.Issues)
      })
      return sessions
    },
    formatIssues(rowIssues) {
      const type = typeof rowIssues
      if (type === 'string') return []
      else {
        const result = Array.isArray(rowIssues.Issue) ? rowIssues.Issue : [rowIssues.Issue]
        return result
      }
    },
    handleDownload() {
      const link = document.createElement('a')
      const blob = new Blob([this.xmlData])
      link.download = 'WebInspect_Report.xml'
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(blob)
      link.remove()
    },
    mapSeverity(key, status) {
      const mapping = {
        0: { type: 'info', name: 'Info' },
        1: { type: 'primary', name: 'Low' },
        2: { type: 'warning', name: 'Medium' },
        3: { type: 'danger', name: 'High' },
        4: { type: 'danger', name: 'Critical' }
      }
      return mapping[status][key]
    },
    UTCtoLocalTime(dateTime) {
      if (!dateTime) return '-'
      const localTime = this.$dayjs
        .utc(dateTime)
        .local()
        .format('YYYY-MM-DD HH:mm:ss')
      return localTime
    }
  }
}
</script>

<style lang="scss" scoped>
.code-block {
  width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
