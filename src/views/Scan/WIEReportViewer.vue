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
        <el-tabs v-model="activeName">
          <template v-for="(session, sessionIdx) in jsonData">
            <el-tab-pane :key="session.requestId" :label="`${sessionIdx + 1}`" :name="`Session ${sessionIdx + 1}`">
              <template slot="title">
                <div>
                  <span class="text-h6 mx-3">Session {{ sessionIdx + 1 }}</span>
                  <span class="text-subtitle-2"># {{ session.requestId }}</span>
                </div>
              </template>
              <div class="p-5">
                <!-- <el-row>
                  <el-col :span="12"><span class="font-weight-bold">URL：</span>{{ session.URL }}</el-col>
                  <el-col :span="12"><span class="font-weight-bold">Scheme：</span>{{ session.Scheme }}</el-col>
                  <el-col :span="12"><span class="font-weight-bold">Host：</span>{{ session.Host }}</el-col>
                  <el-col :span="12"><span class="font-weight-bold">Port：</span>{{ session.Port }}</el-col>
                  <el-col :span="12">
                    <span :span="12" class="font-weight-bold">AttackParamDescriptor：</span>
                    {{ session.AttackParamDescriptor || '-' }}
                  </el-col>
                </el-row> -->

                <!-- Issues -->
                <!-- <div class="text-h5 font-weight-bold">Issues</div> -->
                <div v-for="issue in session.Issues" :key="issue.id">
                  <div
                    class="bg-blue-500 text-white p-2 font-small font-weight-bold"
                    :type="mapSeverity('type', issue.Severity)"
                  >
                    {{ mapSeverity('name', issue.Severity) + ' Issues' }}
                  </div>
                  <div class="bg-gray-200 p-2">
                    <span class="text-h5 font-medium mr-2">{{ issue.Name }}</span>
                  </div>

                  <!-- <div class="text-subtitle-2"># {{ issue.id }}</div> -->
                  <!-- <div><span class="text-subtitle-1 font-weight-bold">CheckTypeID：</span>{{ issue.CheckTypeID }}</div> -->
                  <!-- <div><span class="text-subtitle-1 font-weight-bold">EngineType：</span>{{ issue.EngineType }}</div>
                  <div>
                    <span class="text-subtitle-1 font-weight-bold">AttackHTTPRequest：</span>
                    {{ issue.AttackHTTPRequest }}
                  </div>
                  <div>
                    <span class="text-subtitle-1 font-weight-bold">VulnerabilityID：</span>{{ issue.VulnerabilityID }}
                  </div> -->

                  <!-- ReportSection -->
                  <div
                    v-for="(ReportSection, ReportSectionIdx) in issue.ReportSection"
                    :key="issue.id + ReportSectionIdx"
                    class="mb-2"
                  >
                    <div class="text-subtitle-1 font-weight-bold text-blue-600">{{ ReportSection.Name }}</div>
                    <div v-html="ReportSection.SectionText" />
                  </div>

                  <!-- Classification -->
                  <div class="text-subtitle-1 font-weight-bold text-blue-600">Classification</div>
                  <div
                    v-for="(classification, clIdx) in issue.Classifications.Classification"
                    :key="clIdx"
                    class="mb-2"
                  >
                    <div class="text-subtitle-2 font-weight-bold">{{ classification._ }}</div>
                    <el-link type="primary" :href="classification.href" target="blank">{{
                      classification.href
                    }}</el-link>
                    <!-- <div>kind：{{ classification.kind }}</div> -->
                    <!-- <div>identifier：{{ classification.identifier }}</div> -->
                  </div>

                  <el-divider />
                </div>

                <!-- RawRequest -->

                <div class="text-h5 font-weight-bold">Request</div>
                <!-- <div class="text-subtitle-2"># {{ session.RawRequest.id }}</div> -->
                <pre class="code-block">{{ formatRawData(session.RawRequest._) }}</pre>
                <el-divider />

                <!-- RawResponse -->
                <div class="text-h5 font-weight-bold">Response</div>
                <pre class="code-block">{{ formatRawData(session.RawResponse) }}</pre>
                <el-divider />

                <!-- Request -->
                <!-- <div class="text-h5 font-weight-bold">Request</div>
                <ul>
                  <template v-for="(requestVal, requestKey) in session.Request">
                    <li v-if="requestKey === 'Headers'" :key="requestKey">
                      <span class="font-weight-bold">{{ requestKey }}：</span>
                      <ul>
                        <li v-for="headerItem in requestVal.Header" :key="headerItem.Name">
                          {{ headerItem.Name }}：{{ headerItem.Value }}
                        </li>
                      </ul>
                    </li>
                    <li v-else-if="requestKey === 'Cookies'" :key="requestKey">
                      <span class="font-weight-bold">{{ requestKey }}：</span>
                      <ul>
                        <li v-for="headerItem in requestVal.Header" :key="headerItem.Name">
                          {{ headerItem.Name }}：{{ headerItem.Value }}
                        </li>
                      </ul>
                    </li>
                    <li v-else :key="requestKey">
                      <span class="font-weight-bold">{{ requestKey }}：</span>
                      {{ requestVal }}
                    </li>
                  </template>
                </ul>
                <el-divider /> -->

                <!-- Response -->
                <!-- <div class="text-h5 font-weight-bold">Response</div>
                <ul>
                  <template v-for="(responseVal, responseKey) in session.Response">
                    <li v-if="responseKey === 'Headers'" :key="responseKey">
                      <span class="font-weight-bold">{{ responseKey }}：</span>
                      <ol>
                        <li v-for="headerItem in responseVal.Header" :key="headerItem.Name">
                          {{ headerItem.Name }}：{{ headerItem.Value }}
                        </li>
                      </ol>
                    </li>
                    <li v-else-if="responseKey === 'ResponseBody'" :key="responseKey">
                      <span class="font-weight-bold">ResponseBody：</span>
                      <pre v-text="responseVal" />
                    </li>

                    <li v-else :key="responseKey">
                      <span class="font-weight-bold">{{ responseKey }}：</span>
                      {{ responseVal }}
                    </li>
                  </template>
                </ul> -->
              </div>
            </el-tab-pane>
          </template>
        </el-tabs>
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
    ...mapGetters(['selectedProject'])
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
    },
    formatRawData(data) {
      return data
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
