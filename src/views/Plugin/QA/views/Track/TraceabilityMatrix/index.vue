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
          <el-button class="w-full" icon="el-icon-setting" :loading="isRunning()" @click="settingDialogVisible=!settingDialogVisible">
            {{ $t('Track.CheckRuleSettings') }}
          </el-button>
          <el-divider />
          <el-form-item :label="$t('Track.CheckOrder')" class="relation_settings">
            <ol>
              <li v-for="item in trackerMapTarget.order" :key="item">{{ $t(`Issue.${item}`) }}</li>
            </ol>
          </el-form-item>
          <el-button class="w-full" type="primary" icon="el-icon-check" :loading="isRunning()" @click="createTraceCheckJob">
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
        <el-row type="flex" justify="space-between" align="middle">
          <el-col>
            <el-form inline>
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
              <el-form-item>
                <el-button icon="el-icon-s-operation" type="primary" :loading="chartLoading"
                           :disabled="chartLoading" @click="onPaintChart"
                >
                  {{ $t('Track.StartPaint') }}
                </el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="4" class="text-right">
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
          </el-col>
        </el-row>
        <el-alert v-if="getPercentProgress<100||issueLoading" type="warning" class="mb-4 loading" :closable="false">
          <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
          <el-progress v-if="getPercentProgress" :percentage="getPercentProgress" />
        </el-alert>
        <el-card>
          <template slot="header">
            {{ $t('Track.DemandTraceability') }}
            <template v-if="startPoint">（{{ $t('Track.StartingPoint') }}：{{ startPoint }}）</template>
          </template>
          <div v-show="data.length>0" ref="matrix">
            <vue-mermaid
              :nodes="data"
              type="graph LR"
              :config="{securityLevel:'loose',flowChart:{ htmlLabels:true}, logLevel:1}"
              @nodeClick="editNode"
            />
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane v-loading="listLoading" :label="$t('Track.TraceabilityCheck')" name="check" :element-loading-text="$t('Loading')">
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
            <el-button class="w-full" icon="el-icon-setting" :loading="isRunning()" @click="settingDialogVisible=!settingDialogVisible">
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
        <TraceCheck v-if="activeTab==='check'" ref="TraceCheck" :tracker-map-target="trackerMapTarget" />
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible" width="80%" top="3vh" append-to-body destroy-on-close>
      <div ref="rotateImage" />
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Close') }}</el-button>
        <el-button type="primary" @click="downloadPdf">{{ $t('File.Download') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="$t('Track.TraceabilityCheck')" :visible.sync="settingDialogVisible" width="80%" top="3vh" append-to-body destroy-on-close>
      <OrderListDialog :tracker-map-options="trackerMapOptions" @update="getTrackerMapOptions" />
    </el-dialog>
  </div>
</template>

<script>
import VueMermaid from '@/components/vue-mermaid'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssue, getIssueFamily } from '@/api/issue'
import Tracker from '@/components/Issue/Tracker'
import { getProjectIssueList } from '@/api/projects'
import { mapGetters } from 'vuex'
import {
  getTestFileByTestPlan,
  getTraceabilityMatrixReport, patchTraceOrderExecute,
  getTraceOrderList, patchTraceOrder
} from '@/views/Plugin/QA/api/qa'
import html2canvas from 'html2canvas'
import { camelCase, cloneDeep } from 'lodash'
import OrderListDialog from './components/OrderListDialog'
import TraceCheck from '@/views/Plugin/QA/views/Track/TraceabilityMatrix/components/TraceCheck'

export default {
  name: 'TraceabilityMatrix',
  components: { TraceCheck, OrderListDialog, ProjectListSelector, Tracker, VueMermaid },
  data() {
    return {
      activeTab: 'map',
      filterValue: { tracker_id: null, issue_id: [] },
      nowFilterValue: { tracker_id: null, issue_id: [] },
      trackerMapOptions: [],
      trackerMapTarget: {},
      trackerOrder: '',
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
      isRotate: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker']),
    startPoint() {
      if (!this.nowFilterValue.issueList || this.nowFilterValue.issueList.length <= 0) {
        return null
      }
      return this.nowFilterValue.issueList.map(issue => `${this.$t(`Issue.${issue.tracker.name}`)} #${issue.id} - ${issue.subject}`).join(', ')
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
    data() {
      const chartIssueList = this.chartIssueList.map(issue => this.formatChartData(issue, this.group))
      let testFileList = this.chartIssueList.map(issue => (issue.test_files) ? issue.test_files : null)
        .filter(issue => issue)
      testFileList = [].concat.apply([], testFileList).map(test_file => this.formatTestFile(test_file, this.group))
      testFileList = [].concat.apply([], testFileList)
      return chartIssueList.concat(testFileList)
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
        audit: '#A0DA2C',
        feature: '#82DDF0',
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
      await this.getSearchIssue()
      await this.initChart()
      if (this.$refs['TraceCheck']) {
        this.$refs['TraceCheck'].resetData()
      }
    },
    'filterValue.tracker_id': {
      deep: true,
      async handler() {
        this.filterValue.issue_id = []
        await this.getSearchIssue()
        await this.initChart()
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
    async getSearchIssue(query) {
      let querySearch = {}
      this.issueList = []
      if (query !== '') {
        querySearch = { search: query }
        this.issueQuery = query
      }
      this.issueLoading = true
      const issueList = await getProjectIssueList(this.selectedProjectId, {
        tracker_id: this.filterValue.tracker_id,
        selection: true,
        ...querySearch
      })
      this.issueList = (issueList.data.issue_list) ? issueList.data.issue_list : issueList.data
      this.issueLoading = false
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
    formatChartData(issue, group) {
      const issueName = (issue.subject) ? issue.subject : issue.name
      const checkIssueName = issueName.replace(/"/g, '&quot;')
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
      if (group) {
        point['group'] = `${this.$t('Issue.' + issue.tracker.name)}`
        point['text'] = `"#${issue.id} - ${checkIssueName}<br/>(${this.$t('Issue.' + issue.status.name)})"`
      } else {
        point['text'] = `"${this.$t('Issue.' + issue.tracker.name)} #${issue.id} - ${checkIssueName}<br/>(${this.$t('Issue.' + issue.status.name)})"`
        point['style'] = `fill:${this.trackerColor[camelCase(issue.tracker.name)]}`
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
      if (test_file.software_name === 'Postman') {
        const total = [test_file.the_last_test_result.success + '/' + (test_file.the_last_test_result.success + test_file.the_last_test_result.failure)]
        last_result = total + '<br/>' + test_file.the_last_test_result.branch + '<br/> ' + commit_icon + test_file.the_last_test_result.commit_id
      } else if (test_file.software_name === 'SideeX') {
        const total = [test_file.the_last_test_result.result.casesPassed + '/' + (test_file.the_last_test_result.result.casesTotal)]
        last_result = total + '<br/>' + test_file.the_last_test_result.branch + '<br/> ' + commit_icon + test_file.the_last_test_result.commit_id
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
        this.$router.push({ name: 'issue-detail', params: { issueId: nodeId }})
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
        console.log(e)
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
        console.log(e)
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
      if (this.isRotate) this.$rotatePdf(this.$refs.rotateImage, 'Traceability_Matrix')
      else this.$pdf(this.$refs.rotateImage, 'Traceability_Matrix')
    },
    handleRotatePreview() {
      this.isRotate = true
      this.dialogVisible = true
      html2canvas(this.$refs.matrix).then(canvas => {
        const [A4Width, A4Height] = [595, 841] // a4
        const { width: CanvasWidth, height: CanvasHeight } = canvas
        const PdfWidth = A4Width * 2
        const PdfHeight = (A4Width / CanvasWidth) * CanvasHeight
        const rotCanvas = document.createElement('canvas')
        rotCanvas.width = canvas.height
        rotCanvas.height = canvas.width
        const rctx = rotCanvas.getContext('2d')
        rctx.translate(rotCanvas.width * 0.5, rotCanvas.height * 0.5)

        // rotate -90° (CCW)
        rctx.rotate(Math.PI * 0.5)

        // draw image offset so center of image is on top of pivot
        rctx.drawImage(canvas, -canvas.width * 0.5, -canvas.height * 0.5)
        const data = rotCanvas.toDataURL('image/png', 1.0)
        const image = new Image()
        image.src = data
        image.width = PdfWidth
        image.Height = PdfHeight
        this.$refs.rotateImage.appendChild(image)
      })
    },
    handlePreview() {
      this.isRotate = false
      this.dialogVisible = true
      html2canvas(this.$refs.matrix).then(canvas => {
        const [A4Width, A4Height] = [595, 841] // a4
        const { width: CanvasWidth, height: CanvasHeight } = canvas
        const PdfWidth = A4Width * 1.8
        const PdfHeight = (A4Width / CanvasWidth) * CanvasHeight
        const data = canvas.toDataURL('image/png', 1.0)
        const image = new Image()
        image.src = data
        image.width = PdfWidth
        image.Height = PdfHeight
        this.$refs.rotateImage.appendChild(image)
      })
    }
  }
}
</script>
<style lang="scss" scoped>

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

> > > .el-tab-pane {
  .el-tab-pane__body {
    height: 100%;
    overflow-y: auto;
  }
}

</style>
