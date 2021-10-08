<template>
  <div class="app-container">
    <project-list-selector>
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form>
          <el-form-item :label="$t('Track.CheckRule')">
            <el-select
              v-model="trackerMapTarget.id"
              :disabled="selectedProjectId === -1||isRunning()"
              filterable
              @change="handleSetDefault"
            >
              <el-option v-for="trackOrder in trackerMapOptions" :key="trackOrder.id" :label="trackOrder.name"
                         :value="trackOrder.id"
              />
            </el-select>
          </el-form-item>
          <el-button class="w-full" icon="el-icon-setting" :loading="isRunning()"
                     @click="settingDialogVisible=!settingDialogVisible"
          >
            {{ $t('Track.CheckRuleSettings') }}
          </el-button>
          <el-divider />
          <el-form-item :label="$t('Track.CheckOrder')" class="relation_settings">
            <ol>
              <li v-for="item in trackerMapTarget.order" :key="item">{{ $t(`Issue.${item}`) }}</li>
            </ol>
          </el-form-item>
          <el-button class="w-full" type="primary" icon="el-icon-check" :loading="isRunning()"
                     @click="createTraceCheckJob"
          >
            {{ $t('Track.Run') }}
          </el-button>
        </el-form>
        <el-button slot="reference" icon="el-icon-s-operation" type="text" :loading="chartLoading"
                   :disabled="chartLoading"
        > {{ $t('Track.TraceabilityCheck') }}
          <i class="el-icon-arrow-down el-icon--right" /></el-button>
      </el-popover>
    </project-list-selector>
    <el-divider />
    <el-empty v-if="selectedProjectId === -1" :description="$t('general.NoData')" />
    <el-tabs v-else v-model="activeTab" type="border-card">
      <el-tab-pane :label="$t('Track.DemandTraceability')" name="map">
        <div ref="wrapper" class="wrapper">
          <el-alert v-if="getPercentProgress<100||issueLoading" type="warning" class="mb-4 loading" :closable="false">
            <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
            <el-progress v-if="getPercentProgress" :percentage="getPercentProgress" />
          </el-alert>
          <div v-show="data.length>0" ref="matrix" v-dragscroll class="mermaid-wrapper"
               :style="{height:`${tableHeight}px`}"
          >
            <h3>{{ $t('Track.DemandTraceability') }}
              <template v-if="startPoint">（{{ $t('Track.StartingPoint') }}：{{ startPoint }}）</template>
            </h3>
            <vue-mermaid
              ref="mermaid"
              :nodes="data"
              type="flowchart LR"
              :class="`w-${zoom}`"
              :config="{securityLevel:'loose',flowChart:{ htmlLabels:true, width:300}, logLevel:5}"
              @nodeClick="editNode"
            />
            <div class="toolbar">
              <el-slider v-model="zoom" :min="25" :max="500" :step="25" />
            </div>
          </div>
          <el-empty v-if="data.length<=0" :description="$t('general.NoData')" />
        </div>
        <right-panel v-if="activeTab==='map'" ref="rightPanel" :click-not-close="true">
          <div slot="icon"><em class="el-icon-setting" /></div>
          <el-row class="panel">
            <el-card>
              <template slot="header" />
              <el-form>
                <el-form-item :label="$t('general.group')">
                  <el-switch
                    v-model="group"
                    :active-text="$t('general.on')"
                    :inactive-text="$t('general.off')"
                  />
                </el-form-item>
                <el-form-item :label="$t('Issue.tracker')">
                  <el-select
                    v-model="filterValue.tracker_id"
                    :placeholder="$t('Issue.SelectType')"
                    :disabled="selectedProjectId === -1"
                    filterable
                  >
                    <el-option v-for="track in trackerList" :key="track.id" :label="$t('Issue.'+track.name)"
                               :value="track.id"
                    >
                      <tracker :name="track.name" />
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('Issue.Issue')">
                  <el-select
                    v-model="filterValue.issue_id"
                    style="width: 100%"
                    :placeholder="$t('RuleMsg.PleaseSelect')"
                    clearable
                    filterable
                    remote
                    multiple
                    collapse-tags
                    :remote-method="getSearchIssue"
                    :loading="issueLoading"
                    class="issue-select"
                  >
                    <el-option
                      v-for="item in issueList"
                      :key="item.id"
                      :label="'#' + item.id +' - '+item.name"
                      :value="item.id"
                    >
                      <span
                        style="float: left; width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
                      >
                        <b>#<span v-html="highLight(item.id.toString())" /></b> -
                        <span v-html="highLight(item.name)" />
                      </span>
                      <span style="float: right; color: #8492a6; font-size: 13px"
                            v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
                      />
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('Issue.fixed_version')">
                  <el-select
                    v-model="filterValue.fixed_version_id"
                    multiple
                    :placeholder="$t('Issue.SelectType')"
                    :disabled="selectedProjectId === -1"
                    clearable
                    filterable
                  >
                    <el-option v-for="version in versionFilterList" :key="version.id" :label="version.name"
                               :value="version.id"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
              <el-button icon="el-icon-s-operation" type="primary" :loading="chartLoading"
                         :disabled="chartLoading" @click="onPaintChart"
              >
                {{ $t('Track.StartPaint') }}
              </el-button>
              <el-popover
                placement="bottom"
                trigger="click"
              >
                <el-menu class="download">
                  <el-menu-item :disabled="selectedProjectId === -1" @click="downloadCSVReport">
                    <em class="el-icon-download" />{{ $t('Track.DownloadExcel') }}
                  </el-menu-item>
                  <!-- <el-menu-item>
                    <el-button icon="el-icon-download" @click="download">{{ $t('TestReport.DownloadPdf') }}</el-button>
                  </el-menu-item> -->
                  <el-menu-item :disabled="selectedProjectId === -1" @click="handleRotatePreview">
                    <em class="el-icon-download" />{{ $t('Track.Landscape') }}
                  </el-menu-item>
                  <el-menu-item :disabled="selectedProjectId === -1" @click="handlePreview">
                    <em class="el-icon-download" />{{ $t('Track.Portrait') }}
                  </el-menu-item>
                </el-menu>
                <el-button slot="reference" icon="el-icon-download">{{ $t('Track.Download') }}</el-button>
              </el-popover>
            </el-card>
          </el-row>
        </right-panel>
      </el-tab-pane>
      <el-tab-pane v-loading="listLoading" :label="$t('Track.TraceabilityCheck')" name="check"
                   :element-loading-text="$t('Loading')"
      >
        <el-form inline>
          <el-form-item :label="$t('Track.CheckRule')">
            <el-select
              v-model="trackerMapTarget.id"
              :disabled="selectedProjectId === -1||isRunning()"
              filterable
              @change="handleSetDefault"
            >
              <el-option v-for="trackOrder in trackerMapOptions" :key="trackOrder.id" :label="trackOrder.name"
                         :value="trackOrder.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button class="w-full" icon="el-icon-setting" :loading="isRunning()"
                       @click="settingDialogVisible=!settingDialogVisible"
            >
              {{ $t('Track.CheckRuleSettings') }}
            </el-button>
          </el-form-item>
          <el-form-item :label="$t('Track.CheckOrder')" class="relation_settings">
            <div v-for="(item,idx) in trackerMapTarget.order" :key="item" class="item">{{ idx + 1 }}.
              <el-tag>
                <tracker :name="item" />
              </el-tag>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-check" :loading="isRunning()" @click="createTraceCheckJob">
              {{ $t('Track.Run') }}
            </el-button>
          </el-form-item>
        </el-form>
        <TraceCheck v-if="activeTab==='check'" ref="TraceCheck" :tracker-map-target="trackerMapTarget"
                    @show-issue="onRelationIssueDialog"
        />
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible" width="80%" top="3vh" append-to-body destroy-on-close>
      <div ref="rotateImage" />
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Close') }}</el-button>
        <el-button type="primary" @click="downloadPdf">{{ $t('File.Download') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="$t('Track.TraceabilityCheck')" :visible.sync="settingDialogVisible" width="80%" top="3vh"
               append-to-body destroy-on-close
    >
      <OrderListDialog :tracker-map-options="trackerMapOptions" @update="getTrackerMapOptions" />
    </el-dialog>
    <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close
               :before-close="handleRelationIssueDialogBeforeClose"
    >
      <ProjectIssueDetail v-if="relationIssue.visible"
                          ref="children"
                          :props-issue-id="relationIssue.id"
                          :is-in-dialog="true"
                          @update="handleRelationUpdate"
                          @delete="handleRelationUpdate"
      />
    </el-dialog>
  </div>
</template>

<script>
import VueMermaid from './components/vue-mermaid'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssue, getIssueFamily } from '@/api/issue'
import Tracker from '@/components/Issue/Tracker'
import { getProjectIssueList, getProjectVersion } from '@/api/projects'
import { mapGetters } from 'vuex'
import {
  getTestFileByTestPlan,
  getTraceabilityMatrixReport, patchTraceOrderExecute,
  getTraceOrderList, patchTraceOrder
} from '@/views/Plugin/QA/api/qa'
import html2canvas from 'html2canvas'
import { camelCase, cloneDeep } from 'lodash'
import OrderListDialog from './components/OrderListDialog'
import TraceCheck from '@/views/Plan/TraceabilityMatrix/components/TraceCheck'
import { dragscroll } from 'vue-dragscroll'

import axios from 'axios'
import ProjectIssueDetail from '@/views/Plugin/QA/views/Project/IssueDetail'

import RightPanel from '@/components/RightPanel'

const stroke = [
  '#586c32',
  '#323b6c',
  '#64326c',
  '#6c3258',
  '#6c4732',
  '#b9320d',
  '#0d94b9',
  '#b90d3e',
  '#b9880d',
  '#94b90d',
  '#0db932'
]

export default {
  name: 'TraceabilityMatrix',
  components: { ProjectIssueDetail, TraceCheck, OrderListDialog, ProjectListSelector, Tracker, VueMermaid, RightPanel },
  directives: {
    dragscroll
  },
  data() {
    return {
      activeTab: 'map',
      tableHeight: 0,
      zoom: 100,
      filterValue: { tracker_id: null, issue_id: [], fixed_version_id: [] },
      nowFilterValue: { tracker_id: null, issue_id: [], fixed_version_id: [] },
      trackerMapOptions: [],
      trackerMapTarget: {},
      trackerOrder: '',
      fixed_version: [],
      traceCheck: [],
      issueList: [],
      chartIssueList: [],
      issueLoading: false,
      chartLoading: false,
      listLoading: false,
      jobLoading: false,
      chartProgress: {
        now: 0,
        total: 0
      },
      group: false,
      accessedIssueId: [],
      relationLine: {},
      testFilesResult: [],
      settingDialogVisible: false,
      dialogVisible: false,
      image: {
        filename: '',
        content_type: '',
        src: ''
      },
      relationIssue: {
        visible: false,
        id: null
      },
      isRotate: false,
      cancelToken: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker']),
    startPoint() {
      if (!this.nowFilterValue.issueList || this.nowFilterValue.issueList.length <= 0) {
        return null
      }
      return this.nowFilterValue.issueList.map(issue => `${this.$t(`Issue.${issue.tracker.name}`)} #${issue.id} - ${issue.name}`).join(', ')
    },
    getPercentProgress() {
      return Math.round((this.chartProgress.now / this.chartProgress.total) * 100)
    },
    trackerList() {
      if (!this.trackerMapTarget.order) return []
      if (this.trackerMapTarget.order.length === 0) return this.tracker
      return this.tracker.filter(item => (this.trackerMapTarget.order.includes(item.name)))
    },
    trackerMap() {
      return this.trackerMapTarget.order.map((item, idx) => {
        const result = {
          name: item,
          relation: {}
        }
        if (this.trackerMapTarget.order[idx - 1]) {
          result['relation']['parent'] = [this.trackerMapTarget.order[idx - 1]]
        }
        if (this.trackerMapTarget.order[idx + 1]) {
          result['relation']['children'] = [this.trackerMapTarget.order[idx + 1]]
        }
        if (item === 'Test Plan') {
          if (!result['relation']['children']) {
            result['relation']['children'] = []
          }
          result['relation']['children'].push('TestFile')
        }
        return result
      })
    },
    versionFilterList() {
      const nowVersionList = [...new Set(this.chartIssueList.map(issue => (issue.fixed_version && issue.fixed_version.id) ? issue.fixed_version.id : 'null'))]
      return this.fixed_version.filter(version => nowVersionList.includes(version.id))
    },
    data() {
      const strokeColor = {}

      let chartIssueList = this.chartIssueList
      if (this.filterValue.fixed_version_id.length > 0) {
        chartIssueList = chartIssueList.filter(issue => this.filterValue.fixed_version_id.includes((issue.fixed_version && issue.fixed_version.id) ? issue.fixed_version.id : 'null'))
      }
      this.versionFilterList.forEach((version, idx) => {
        strokeColor[version.id] = stroke[idx % stroke.length]
      })
      const chartData = chartIssueList.map(issue => this.formatChartData(issue, this.group, strokeColor))
      let testFileList = chartIssueList.map(issue => (issue.test_files) ? issue.test_files : null)
        .filter(issue => issue)
      testFileList = [].concat.apply([], testFileList).map(test_file => this.formatTestFile(test_file, this.group))
      testFileList = [].concat.apply([], testFileList)
      return chartData.concat(testFileList)
    },
    trackerColor() {
      return {
        success: '#67c23a',
        danger: '#f56c6c',
        warning: '#e6a23c',
        slow: '#56b1e8',
        light: '#c1c3c5',
        info: '#606260',
        primary: '#5388ff',
        secondary: '#3ecbbc',
        active: '#409eff',
        assigned: '#f56c6c',
        closed: '#909399',
        solved: '#3ecbbc',
        inProgress: '#e6a23c',
        finished: '#67c23a',
        document: '#005f73',
        research: '#0a9396',
        epic: '#409EEF',
        audit: '#82DDF0',
        feature: '#A0DA2C',
        bug: '#E84855',
        issue: '#5296A5',
        changeRequest: '#A06CD5',
        risk: '#FCD7AD',
        testPlan: '#A57548',
        failManagement: '#FF7033'
      }
    }
  },
  watch: {
    async selectedProjectId() {
      await this.getTrackerMapOptions()
      await this.loadVersionList(true)
      this.$set(this.filterValue, 'issue_id', [])
      this.$set(this.filterValue, 'fixed_version_id', [])
      this.$set(this.$data, 'nowFilterValue', { tracker_id: null, issue_id: [] })
      if (this.$refs['TraceCheck']) {
        await this.$refs['TraceCheck'].resetData()
        await this.$refs['TraceCheck'].loadData()
      }
      await this.getSearchIssue()
      await this.initChart()
    },
    'filterValue.tracker_id': {
      deep: true,
      async handler() {
        this.$set(this.filterValue, 'issue_id', [])
        this.$set(this.filterValue, 'fixed_version_id', [])
        this.$set(this.$data, 'nowFilterValue', { tracker_id: null, issue_id: [] })
        await this.getSearchIssue()
      }
    },
    trackerMapTarget: {
      deep: true,
      handler() {
        this.initChart()
        if (this.$refs['TraceCheck']) {
          this.$refs['TraceCheck'].resetData()
        }
      }
    }
  },
  created() {
    this.getTrackerMapOptions()
  },
  mounted() {
    this.loadVersionList(true)
    this.$nextTick(() => {
      this.tableHeight = this.$refs['wrapper'].clientHeight
    })
    window.onresize = () => {
      this.$nextTick(() => {
        this.tableHeight = this.$refs['wrapper'].clientHeight
      })
    }
  },
  methods: {
    async initChart() {
      if (this.selectedProjectId === -1) return Promise.reject()
      this.$set(this, 'chartIssueList', [])
      if (this.trackerMapTarget.order && this.trackerMapTarget.order.length > 0) {
        const getTracker = this.trackerList.find(item => item.name === this.trackerMapTarget.order[0])
        this.$set(this.filterValue, 'tracker_id', getTracker.id)
      }
      return Promise.resolve()
    },
    async getTrackerMapOptions() {
      const response = await getTraceOrderList({ project_id: this.selectedProjectId })
      this.trackerMapOptions = response.data
      const trackerOrder = this.trackerMapOptions.find(item => item.default)
      if (trackerOrder) {
        this.$set(this.$data, 'trackerMapTarget', cloneDeep(trackerOrder))
      } else {
        this.$set(this.$data, 'trackerMapTarget', {})
      }
      return Promise.resolve()
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    async getSearchIssue(query) {
      let querySearch = {}
      this.issueList = []
      if (query !== '') {
        querySearch = { search: query }
        this.issueQuery = query
      }
      this.issueLoading = true
      if (this.cancelToken) {
        this.cancelToken.cancel()
      }
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      const issueList = await getProjectIssueList(this.selectedProjectId, {
        tracker_id: this.filterValue.tracker_id,
        selection: true,
        ...querySearch
      }, { cancelToken: CancelToken.token })
      this.issueList = issueList.data
      this.issueLoading = false
      this.cancelToken = null
    },
    highLight: function(value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function(str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    },
    checkUniqueRelationLine(subIssue_id, issue_id) {
      return !(Object.keys(this.relationLine).includes(subIssue_id.toString()) && this.relationLine[subIssue_id].includes(issue_id))
    },
    checkNextRelation(subIssue_tracker, issue_tracker) {
      const object = this.trackerMap.find(item => issue_tracker === item.name)
      if (!object) return true
      return [...object.relation.children, object.name].includes(subIssue_tracker)
    },
    formatChartData(issue, group, strokeColor) {
      const checkIssueName = issue.name.replace(/"/g, '&quot;')
      const link = []
      let children = []
      let relations = []
      if (issue['children']) {
        children = issue['children'].map(item => item.id)
        for (let index = 0; index < children.length; index++) {
          link.push('-->')
        }
      }
      if (issue['relations']) {
        relations = issue['relations'].map(item => (this.checkNextRelation(item.tracker.name, issue.tracker.name) && this.checkUniqueRelationLine(item.id, issue.id)) ? item.id : null)
          .filter(item => item !== null)
        for (let index = 0; index < relations.length; index++) {
          link.push('-.' + this.$t('Issue.RelatedIssue') + '.-')
        }
        this.relationLine[issue.id] = relations
      }
      children = children.concat(relations)
      if (issue['test_files']) {
        const test_files = issue['test_files'].map(item => item.file_name)
        for (let index = 0; index < test_files.length; index++) {
          link.push('-->')
        }
        children = children.concat(test_files)
      }
      const point = {
        id: issue.id,
        link: link,
        next: children,
        editable: true
      }
      point['text'] = `"#${issue.id} - ${checkIssueName}<br/>`
      if (issue.fixed_version && issue.fixed_version.name) {
        point['text'] += `<span style=\'border-radius: 0.25rem; background: white; font-size: 0.75em; padding: 3px 5px; margin: 3px 5px;\'>${issue.fixed_version.name}</span>`
      }
      point['text'] += `(${this.$t('Issue.' + issue.status.name)})"`
      if (group) {
        point['group'] = `${this.$t('Issue.' + issue.tracker.name)}`
        point['style'] = `stroke-width:3`
      } else {
        point['style'] = `fill:${this.trackerColor[camelCase(issue.tracker.name)]},fill-opacity:0.5,stroke-width:3`
      }
      if (issue.fixed_version && issue.fixed_version.id) {
        point['style'] += `,stroke:${strokeColor[issue.fixed_version.id]}`
      }
      if (this.nowFilterValue.issue_id.includes(issue.id)) {
        point['edgeType'] = 'stadium'
      }
      return point
    },
    formatTestFile(test_file, group) {
      const result = []
      const file = {
        id: test_file.file_name,
        link: ['-->'],
        next: [`${test_file.software_name}.${test_file.file_name}_result`],
        editable: false
      }
      if (group) {
        file['group'] = `${this.$t('Issue.TestFile')}`
        file['text'] = `"${test_file.file_name}"`
      } else {
        file['text'] = `"${this.$t('Issue.TestFile')}<br/>${test_file.file_name}"`
        // file['style'] = `fill:${fullConfig.theme.colors[issue.tracker.name.toLowerCase()]}`
      }
      result.push(file)
      let last_result = null
      // const commit_icon = '<svg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' aria-hidden=\'true\' role=\'img\' class=\'iconify iconify--ion\' width=\'32\' height=\'32\' preserveAspectRatio=\'xMidYMid meet\' viewBox=\'0 0 512 512\'><circle cx=\'256\' cy=\'256\' r=\'96\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'></circle><path fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\' d=\'M160 256H48\'></path><path fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\' d=\'M464 256H352\'></path></svg>'
      const commit_icon = 'Commit: '
      let status_light = ''
      const color = { pass: 'rgba(103,194,80,100)', failure: 'rgba(245,108,108,100)' }
      if (test_file.software_name === 'Postman') {
        const success = test_file.the_last_test_result.success
        const failure = test_file.the_last_test_result.failure
        const total = success + failure
        let count_result
        if (success === total) {
          status_light = `<div style=\'width:10px; height: 10px; background-color: ${color['pass']}; display:inline-block; border-radius: 99999px; \'></div>`
          count_result = `${status_light} <span style=\'color: ${color['pass']}; font-weight:600;\'>Pass</span>`
        } else {
          status_light = `<div style=\'width:10px; height: 10px; background-color: ${color['failure']}; display:inline-block; border-radius: 99999px; \'></div>`
          count_result = `${status_light}  <span style=\'color: ${color['failure']}; font-weight:600;\'>Failure (${success} / ${total})</span>`
        }
        last_result = count_result + '<br/>' + test_file.the_last_test_result.branch + '<br/> ' + commit_icon + test_file.the_last_test_result.commit_id
      } else if (test_file.software_name === 'SideeX') {
        const success = test_file.the_last_test_result.result.casesPassed
        const total = test_file.the_last_test_result.result.casesTotal
        let count_result
        if (success === total) {
          status_light = `<div style=\'width:10px; height: 10px; background-color: ${color['pass']}; display:inline-block; border-radius: 99999px; \'></div>`
          count_result = `${status_light} <span style=\'color: ${color['pass']}; font-weight:600;\'>Pass</span>`
        } else {
          status_light = `<div style=\'width:10px; height: 10px; background-color: ${color['failure']}; display:inline-block; border-radius: 99999px; \'></div>`
          count_result = ` ${status_light} <span style=\'color: ${color['failure']}; font-weight:600;\'>Failure (${success} / ${total})</span>`
        }
        last_result = count_result + '<br/>' + test_file.the_last_test_result.branch + '<br/> ' + commit_icon + test_file.the_last_test_result.commit_id
      }
      const file_result = {
        id: `${test_file.software_name}.${test_file.file_name}_result`,
        link: ['-->'],
        text: `"${last_result}"`,
        editable: true
      }
      if (group) {
        file_result['group'] = `${this.$t('TestCase.TestResult')}`
        file_result['text'] = `"${last_result}"`
      } else {
        file_result['text'] = `"${this.$t('TestCase.TestResult')}<br/>${last_result}"`
        // file_result['style'] = `fill:${fullConfig.theme.colors[issue.tracker.name.toLowerCase()]}`
      }
      result.push(file_result)
      return result
    },
    async onPaintChart() {
      this.chartLoading = true
      this.nowFilterValue = Object.assign({}, this.filterValue)
      this.accessedIssueId = []
      this.chartIssueList = []
      this.testFilesResult = []
      this.chartProgress.now = 0
      this.chartProgress.total = 0
      const issueList = []
      this.chartIssueList = []
      for (const item of this.nowFilterValue.issue_id) {
        this.chartProgress.total += 1
        const issue = await getIssue(item)
        issueList.push(issue.data)
        this.nowFilterValue = { ...this.nowFilterValue, issueList: issueList }
        const network = new this.PaintNetwork(this, issue.data)
        const family = await getIssueFamily(item)
        this.chartProgress.now += 1
        this.accessedIssueId.push(item)
        await network.getPaintFamily(issue.data, family.data)
        await network.end()
      }
      this.chartLoading = false
    },
    PaintNetwork(vueInstance, rootIssue) {
      const startNodeIndex = vueInstance.trackerMap.findIndex((item) => (item.name === rootIssue.tracker.name))

      this.getIssueFamilyData = async function(chartIssueList) {
        const getIssueFamilyAPI = chartIssueList.map(issue => {
          vueInstance.accessedIssueId.push(issue.id)
          return getIssueFamily(issue.id)
        })
        const response = await Promise.all(getIssueFamilyAPI)
        return Promise.resolve(response.map(res => res.data))
      }

      this.getPaintFamily = async function(issue, issueFamily) {
        vueInstance.chartProgress.total += 1
        const findRelationTargets = await this.getRelationTargets(issue)
        if (findRelationTargets.includes('TestFile')) {
          const test_files = await getTestFileByTestPlan(vueInstance.selectedProjectId, issue.id)
          vueInstance.chartIssueList.push({ ...issue, ...issueFamily, test_files: test_files.data })
        } else {
          vueInstance.chartIssueList.push({ ...issue, ...issueFamily })
        }
        const getFamilyList = await this.combineFamilyList(issue, issueFamily)
        const getIssuesFamilyList = await this.getIssueFamilyData(getFamilyList)
        for (const [index, subIssue] of getFamilyList.entries()) {
          if (findRelationTargets.includes(subIssue.tracker.name)) {
            await this.getPaintFamily(subIssue, getIssuesFamilyList[index])
          }
          vueInstance.chartProgress.now += 1
        }
        return Promise.resolve(issue)
      }

      this.combineFamilyList = function(issue, family) {
        let getFamilyList = []
        Object.keys(family).forEach((relationType) => {
          if (!Array.isArray(family[relationType])) {
            family[relationType] = [family[relationType]]
          }
          family[relationType] = this.formatFamilyList(issue, family[relationType], relationType)
          if (family.hasOwnProperty(relationType)) {
            getFamilyList = getFamilyList.concat(family[relationType])
          }
        })
        getFamilyList = getFamilyList.filter(item => !vueInstance.accessedIssueId.includes(item.id))
        return Promise.resolve(getFamilyList)
      }

      this.formatFamilyList = function(issue, family, relationTarget) {
        return family.map((item) => ({ ...item, relation_type: relationTarget, relation_id: issue.id }))
      }

      this.getRelationTargets = function(issue) {
        const nowNode = vueInstance.trackerMap.find((item) => (item.name === issue.tracker.name))
        const nowNodeIndex = vueInstance.trackerMap.findIndex((item) => (item.name === issue.tracker.name))
        if (!nowNode) return []
        let findRelationTargets = ['children']
        if (nowNodeIndex === startNodeIndex) {
          findRelationTargets = ['parent', 'children']
        } else if (nowNodeIndex < startNodeIndex) {
          findRelationTargets = ['parent']
        }
        let getTargetArray = findRelationTargets.map(target => nowNode.relation[target]).filter(target => target)
        getTargetArray = [].concat.apply([], getTargetArray)
        return [...getTargetArray, issue.tracker.name]
      }

      this.end = function() {
        vueInstance.chartProgress.now = vueInstance.chartProgress.total
        return Promise.resolve()
      }
    },
    editNode(nodeId) {
      if (isNaN(parseInt(nodeId))) {
        const software_name = nodeId.split('.')[0]
        this.$router.push({ name: software_name.toLowerCase() })
      } else {
        this.onRelationIssueDialog(nodeId)
      }
    },
    isRunning() {
      if (!this.$refs['TraceCheck']) return false
      return this.$refs['TraceCheck'].getPercentProgress < 100 && !this.$refs['TraceCheck'].traceCheck.exception
    },
    async handleSetDefault(id) {
      try {
        const data = { default: true }
        if (id === -1) {
          data['project_id'] = this.selectedProjectId
        }
        await patchTraceOrder(id, data)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      } catch (e) {
        console.error(e)
      }
      await this.getTrackerMapOptions()
    },
    async createTraceCheckJob() {
      this.listLoading = true
      try {
        this.activeTab = 'check'
        const res = await patchTraceOrderExecute({ project_id: this.selectedProjectId })
        this.traceCheck = res.data
        await this.$refs['TraceCheck'].loadData()
      } catch (e) {
        console.error(e)
      }
      this.listLoading = false
    },
    async downloadCSVReport() {
      const response = await getTraceabilityMatrixReport(this.selectedProjectId, { responseType: 'blob' })
      this.handleDownload(response)
    },
    handleDownload(data) {
      if (!data) {
        return
      }
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', 'TraceabilityMatrix.xlsx')

      document.body.appendChild(link)
      link.click()
    },
    downloadPdf() {
      this.$pdf(this.$refs.rotateImage, 'Traceability_Matrix')
    },
    handleRotatePreview() {
      this.isRotate = true
      this.dialogVisible = true
      html2canvas(this.$refs.matrix).then(canvas => {
        const [A4Width, A4Height] = [595, 841] // a4
        const { width: CanvasWidth, height: CanvasHeight } = canvas
        const rotCanvas = document.createElement('canvas')
        rotCanvas.width = CanvasHeight
        rotCanvas.height = CanvasWidth
        const rctx = rotCanvas.getContext('2d')
        rctx.translate(rotCanvas.width * 0.5, rotCanvas.height * 0.5)

        // rotate -90° (CCW)
        rctx.rotate(Math.PI * 0.5)

        // draw image offset so center of image is on top of pivot
        rctx.drawImage(canvas, -CanvasWidth * 0.5, -CanvasHeight * 0.5, CanvasWidth, CanvasHeight)
        const data = rotCanvas.toDataURL('image/png', 1.0)
        const image = new Image()
        image.src = data
        image.width = A4Width * 1.95
        image.Height = A4Height
        this.$refs.rotateImage.appendChild(image)
      })
    },
    handlePreview() {
      this.isRotate = false
      this.dialogVisible = true
      html2canvas(this.$refs.matrix).then(canvas => {
        const [A4Width, A4Height] = [595, 841] // a4
        const data = canvas.toDataURL('image/png', 1.0)
        const image = new Image()
        image.src = data
        image.width = A4Width * 1.95
        image.Height = A4Height
        this.$refs.rotateImage.appendChild(image)
      })
    },
    onRelationIssueDialog(id) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
    },
    handleRelationUpdate() {
      this.onCloseRelationIssueDialog()
      this.initChart()
      this.$emit('update-issue')
    },
    handleRelationIssueDialogBeforeClose(done) {
      if (this.$refs.children.hasUnsavedChanges()) {
        this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        })
          .then(() => {
            done()
          })
          .catch(() => {
          })
      } else {
        done()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
$max_height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
$max_width: calc(100vw);
.wrapper {
  height: #{$max_height};
}

.mermaid-wrapper {
  @apply cursor-move;
  overflow: auto;
  @apply static;
  .toolbar {
    @apply absolute bottom-10 right-10 z-50 w-1/6;
  }

  @for $i from 1 through 20 {
    .w-#{25 * $i} {
      width: calc(#{$max_width} * 0.25 * #{$i});
      height: calc(#{$max_height} * 0.25 * #{$i});
      padding:0;

      >>>svg{
        width: 25% * $i;
        height: 25% * $i;
        transform-origin: top left;
        transform: scale(0.25* $i);
      }
    }
  }
}

.relation_settings {
  > > > .el-form-item__content {
    @apply clear-both;
  }

  .item {
    @apply mx-1 inline-block;
  }
}

.el-form {
  padding: 10px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.issue-select {
  > > > .el-tag {
    //width: 100%;
    height: fit-content;
    white-space: normal;

    .el-select__tags-text {
      width: 100%;
    }
  }
}

.loading {
  > > > .el-alert__content {
    width: 100%;
  }
}

.download {
  @apply border-none;
}

//> > > .el-tab-pane {
//  .el-tab-pane__body {
//    height: 100%;
//    overflow-y: auto;
//  }
//}

</style>
