<template>
  <div
    id="wie-report-header"
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    class="px-5 h-full overflow-x-hidden overflow-y-auto"
  >
    <el-backtop target="#wie-report-header" />
    <div
      v-if="!isLoading"
      class="flex justify-between items-center my-5"
    >
      <h3>「{{ selectedProject.display }}」{{ $t('WebInspect.TestReport') }}</h3>
      <span>{{ $t('WebInspect.RunAt') }}：{{ runAt }}</span>
      <el-button
        icon="el-icon-download"
        class="buttonPrimaryReverse"
        @click="handleDownload"
      >
        {{ $t('WebInspect.DownloadReport') }} (.xml)
      </el-button>
    </div>
    <el-row :gutters="12">
      <el-col
        v-for="issue in groupByIssueSeverity"
        :ref="issue.id"
        :key="issue.id"
        class="mb-8"
        :span="24"
      >
        <div class="sticky top-0">
          <div
            class="text-white p-3 font-small font-semibold"
            :class="mapSeverity('bgColor', issue.severity)"
          >
            {{ mapSeverity('name', issue.severity) + ' Issue' }}
          </div>
          <div class="p-3 bg-gray-200 text-xl font-medium z-0">
            {{ issue.name }}
          </div>
        </div>
        <div class="p-6 bg-white shadow rounded">
          <div class="text-xl font-semibold">Request：</div>
          <pre class="w-full whitespace-pre-wrap text-sm break-words">{{ issue.request }}</pre>

          <div class="text-xl font-semibold">Response：</div>
          <pre class="w-full whitespace-pre-wrap text-sm break-words">{{ issue.response }}</pre>

          <div
            v-for="(ReportSection, ReportSectionIdx) in issue.reportSection"
            :key="issue.id + ReportSectionIdx"
            class="mb-2"
          >
            <div class="text-lg font-semibold underline">{{ ReportSection.Name }}</div>
            <div v-html="ReportSection.SectionText" />
          </div>

          <div class="text-lg font-semibold underline mb-3">Classifications</div>
          <div
            v-for="(classification, clIdx) in issue.classifications"
            :key="clIdx"
            class="mb-2"
          >
            <div class="text-base font-semibold">{{ classification._ }}</div>
            <a
              class="text-blue-400 hover:text-blue-300 underline"
              :href="classification.href"
              target="blank"
            >
              {{ classification.href }}
            </a>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import xml2js from 'xml2js'
import { mapGetters } from 'vuex'
import { getWebInspectReport } from '@/api/webInspect'
import { getLocalTime } from '@/utils/handleTime'
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true })

export default {
  name: 'WIEReportViewer',
  data() {
    return {
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
      return result.sort((a, b) => b.severity - a.severity)
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.isLoading = true
      this.runAt = this.getLocalTime(this.$route.params.run_at)
      getWebInspectReport(this.$route.params.scanId).then(res => {
        this.xmlData = res
        this.$nextTick(() => this.parseXml())
      })
    },
    parseXml() {
      parser
        .parseStringPromise(this.xmlData)
        .then(result => {
          this.jsonData = this.formatter(result)
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
        return Array.isArray(rowIssues.Issue) ? rowIssues.Issue : [rowIssues.Issue]
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
        0: { name: 'Info', bgColor: 'bg-green-500' },
        1: { name: 'Low', bgColor: 'bg-blue-500' },
        2: { name: 'Medium', bgColor: 'bg-yellow-500' },
        3: { name: 'High', bgColor: 'bg-pink-500' },
        4: { name: 'Critical', bgColor: 'bg-red-600' }
      }
      return mapping[status][key]
    },
    getLocalTime(time) {
      return getLocalTime(time)
    }
  }
}
</script>
