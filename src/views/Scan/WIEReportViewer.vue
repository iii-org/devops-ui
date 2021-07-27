<template>
  <div
    id="wie-report-header" v-loading="isLoading" :element-loading-text="$t('Loading')"
    class="px-5 h-full overflow-x-hidden overflow-y-auto"
  >
    <!-- <div class="drawer w-1/4" :class="isShowDrawer ? '' : 'drawer-close'">
      <span class="button" @click="showDrawer">
        <el-icon :class="isShowDrawer ? 'el-icon-close' : 'el-icon-tickets'" />
      </span>
      <div class="ml-2 overflow-y-auto h-full">
        <div class="text-title mb-3">In this report</div>
        <div v-for="issue in groupByIssueSeverity" :key="issue.id" class="cursor-pointer py-1">
          <span class="badge" :class="mapSeverity('bgColor', issue.severity)">{{ mapSeverity('name', issue.severity) }}</span>
          <div class="hover:underline py-1 leading-snug" @click="toIssue(issue.id)"> {{ issue.name }}</div>
        </div>
      </div>
    </div> -->
    <el-backtop target="#wie-report-header" />
    <div v-if="!isLoading" class="flex justify-between items-center my-5">
      <h3>「{{ selectedProject.display }}」{{ $t('WebInspect.TestReport') }}</h3>
      <span>{{ $t('WebInspect.RunAt') }}：{{ runAt }}</span>
      <el-button icon="el-icon-download" @click="handleDownload">
        {{ $t('WebInspect.DownloadReport') }} (.xml)
      </el-button>
    </div>
    <el-row :gutters="12">
      <el-col v-for="issue in groupByIssueSeverity" :ref="issue.id" :key="issue.id" class="mb-8" :span="24">
        <div class="sticky top-0">
          <div class="text-white p-3 font-small font-semibold" :class="mapSeverity('bgColor', issue.severity)">
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
          <div v-for="(classification, clIdx) in issue.classifications" :key="clIdx" class="mb-2">
            <div class="text-base font-semibold">{{ classification._ }}</div>
            <a class="text-blue-400 hover:text-blue-300 underline" :href="classification.href" target="blank">
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
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true })

export default {
  name: 'WIEViewer',
  data() {
    return {
      runAt: null,
      isLoading: false,
      xmlData: '',
      jsonData: [],
      isShowDrawer: false
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
        0: { name: 'Info', bgColor: 'bg-green-500' },
        1: { name: 'Low', bgColor: 'bg-blue-500' },
        2: { name: 'Medium', bgColor: 'bg-yellow-500' },
        3: { name: 'High', bgColor: 'bg-pink-500' },
        4: { name: 'Critical', bgColor: 'bg-red-600' }
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
    },
    toIssue(target) {
      this.$refs[target][0].$el.scrollIntoView({ behavior: 'smooth' })
    },
    showDrawer() {
      this.isShowDrawer = !this.isShowDrawer
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
  @apply bg-green-500 text-white pl-2 pr-5 shadow py-2 rounded relative -left-12 top-52;
  transform: translate3d(-500px, 0, 0);
}
.drawer {
  @apply fixed h-full right-0 bg-white shadow-lg z-50 transition duration-500 p-5;
}
.drawer-close {
  @apply translate-x-full;
}
.badge{
  @apply uppercase text-white text-xs tracking-wide font-semibold px-2 py-1 rounded-sm cursor-default
}
</style>
