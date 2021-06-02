<template>
  <div v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <div v-if="!isLoading" class="d-flex justify-between align-center mb-2">
      <div>
        <span class="mr-3">Version：{{ jsonData.version }}</span>
        <span>AppVersion：{{ jsonData.appVersion }}</span>
      </div>
      <el-button @click="handleDownload">下載報告（.xml）</el-button>
    </div>
    <el-row>
      <el-col :span="24">
        <el-collapse v-model="activeName" accordion>
          <template v-for="(session, sessionIdx) in jsonData.Session">
            <el-collapse-item
              :key="session.requestId"
              :title="`Session ${sessionIdx + 1}`"
              :name="`Session ${sessionIdx + 1}`"
            >
              <template slot="title">
                <div>
                  <span class="text-h6 mx-3">Session {{ sessionIdx + 1 }}</span>
                  <span class="text-subtitle-2"># {{ session.requestId }}</span>
                </div>
              </template>
              <div class="p-5">
                <el-row>
                  <el-col :span="12"><span class="font-weight-bold">URL：</span>{{ session.URL }}</el-col>
                  <el-col :span="12"><span class="font-weight-bold">Scheme：</span>{{ session.Scheme }}</el-col>
                  <el-col :span="12"><span class="font-weight-bold">Host：</span>{{ session.Host }}</el-col>
                  <el-col :span="12"><span class="font-weight-bold">Port：</span>{{ session.Port }}</el-col>
                  <el-col :span="12">
                    <span :span="12" class="font-weight-bold">AttackParamDescriptor：</span>
                    {{ session.AttackParamDescriptor || '-' }}
                  </el-col>
                </el-row>
                <el-divider />

                <div class="text-h5 font-weight-bold">Issues</div>
                <div v-for="issue in session.Issues" :key="issue.id">
                  <div class="text-subtitle-2"># {{ issue.id }}</div>
                  <div><span class="text-subtitle-1 font-weight-bold">CheckTypeID：</span>{{ issue.CheckTypeID }}</div>
                  <div><span class="text-subtitle-1 font-weight-bold">EngineType：</span>{{ issue.EngineType }}</div>
                  <div>
                    <span class="text-subtitle-1 font-weight-bold">AttackHTTPRequest：</span
                    >{{ issue.AttackHTTPRequest }}
                  </div>
                  <div>
                    <span class="text-subtitle-1 font-weight-bold">VulnerabilityID：</span>{{ issue.VulnerabilityID }}
                  </div>
                  <div><span class="text-subtitle-1 font-weight-bold">Severity：</span>{{ issue.Severity }}</div>
                  <div><span class="text-subtitle-1 font-weight-bold">Name：</span>{{ issue.Name }}</div>

                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Classification</div>
                    <div
                      v-for="(classification, clIdx) in issue.Classifications.Classification"
                      :key="clIdx"
                      class="mb-2"
                    >
                      <div class="font-weight-bold">{{ classification._ }}</div>
                      <div>kind：{{ classification.kind }}</div>
                      <div>identifier：{{ classification.identifier }}</div>
                      <div>href：{{ classification.href }}</div>
                    </div>

                    <div>
                      <div class="text-subtitle-1 font-weight-bold">ReportSection</div>
                      <div v-for="ReportSection in issue.ReportSection" :key="ReportSection.Name" class="mb-2">
                        <div class="text-subtitle-2 font-weight-bold">{{ ReportSection.Name }}</div>
                        <div v-html="ReportSection.SectionText" />
                      </div>
                    </div>
                  </div>
                </div>
                <el-divider />

                <div class="text-h5 font-weight-bold">RawRequest</div>
                <div class="text-subtitle-2"># {{ session.RawRequest.id }}</div>
                <span class="font-weight-bold">RawRequest Content：</span>
                <pre>{{ session.RawRequest._ }}</pre>
                <el-divider />

                <div class="text-h5 font-weight-bold">RawResponse</div>
                <pre v-text="session.RawResponse" />
                <el-divider />

                <div class="text-h5 font-weight-bold">Request</div>
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
                <el-divider />

                <div class="text-h5 font-weight-bold">Response</div>
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
                </ul>
              </div>
            </el-collapse-item>
          </template>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getWebInspectReport } from '@/api/webInspect'
import xml2js from 'xml2js'
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true })

export default {
  name: 'WIEViewer',
  data: function() {
    return {
      activeName: '',
      isLoading: false,
      xmlData: '',
      jsonData: {}
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.isLoading = true
      getWebInspectReport(this.$route.params.id).then(res => {
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
          console.log(err)
        })
    },
    formatter(data) {
      const result = data.Sessions
      result.Session.forEach(session => {
        session.Issues = this.formatIssues(session.Issues)
      })
      return result
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
    }
  }
}
</script>
