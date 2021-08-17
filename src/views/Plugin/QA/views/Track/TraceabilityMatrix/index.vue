<template>
  <div class="app-container">
    <project-list-selector>
      <el-popover
        placement="bottom"
        trigger="click"
        @hide="onPaintChart"
      >
        <el-form>
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
        </el-form>
        <el-button slot="reference" icon="el-icon-s-operation" type="text" :loading="chartLoading"
                   :disabled="chartLoading"
        > {{ $t('Track.StartingPoint') }}
          <i class="el-icon-arrow-down el-icon--right" /></el-button>
      </el-popover>
      <el-divider direction="vertical" />
      <el-button icon="el-icon-download" @click="downloadCSVReport">{{ $t('Track.DownloadExcel') }}</el-button>
      <!-- <el-button icon="el-icon-download" @click="downloadPdf">{{ $t('TestReport.DownloadPdf') }}</el-button> -->
      <el-button icon="el-icon-download" @click="handleRotatePreview">旋轉90度預覽</el-button>
      <el-button icon="el-icon-download" @click="handlePreview">預覽</el-button>
    </project-list-selector>
    <el-divider />
    <el-alert v-if="getPercentProgress<100||issueLoading" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress v-if="getPercentProgress" :percentage="getPercentProgress" />
    </el-alert>
    <!--    <el-card>-->
    <!--      <draggable-->
    <!--        v-model="trackerMapList"-->
    <!--        :draggable="'.item'"-->
    <!--      >-->
    <!--        <el-tag class="item" v-for="item in trackerMapList" :key="item">-->
    <!--          {{ item }}-->
    <!--        </el-tag>-->
    <!--      </draggable>-->
    <!--      {{ trackerMap }}-->
    <!--    </el-card>-->
    <el-card>
      {{ $t('general.group') }}:
      <el-switch
        v-model="group"
        :active-text="$t('general.on')"
        :inactive-text="$t('general.off')"
      />
      <template slot="header">
        {{ $t('Track.DemandTraceability') }}
        <template v-if="startPoint">（{{ $t('Track.StartingPoint') }}：{{ startPoint }}）</template>
      </template>
      <div ref="matrix">
        <vue-mermaid
          :nodes="data"
          type="graph LR"
          :config="{securityLevel:'loose',flowChart:{ htmlLabels:true}, logLevel:1}"
          @nodeClick="editNode"
        />
      </div>
    </el-card>
    <el-dialog :visible.sync="dialogVisible" width="80%" top="3vh" append-to-body destroy-on-close>
      <div ref="rotateImage" />
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Close') }}</el-button>
        <el-button type="primary" @click="downloadPdf">{{ $t('File.Download') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueMermaid from './components/vue-mermaid'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssue, getIssueFamily } from '@/api/issue'
import Tracker from '@/components/Issue/Tracker'
import { getProjectIssueList } from '@/api/projects'
import { mapGetters } from 'vuex'
import { getTestFileByTestPlan, getTraceabilityMatrixReport } from '@/views/Plugin/QA/api/qa'
import html2canvas from 'html2canvas'
import draggable from 'vuedraggable'
import { camelCase } from 'lodash'

export default {
  components: { ProjectListSelector, Tracker, VueMermaid, draggable },
  data() {
    return {
      filterValue: { tracker_id: null, issue_id: [] },
      nowFilterValue: { tracker_id: null, issue_id: [] },
      trackerMapList: ['Epic', 'Feature', 'Test Plan'],
      issueList: [],
      chartIssueList: [],
      issueLoading: false,
      chartLoading: false,
      chartProgress: {
        now: 0,
        total: 0
      },
      group: false,
      accessedIssueId: [],
      relationLine: {},
      testFilesResult: [],
      dialogVisible: false,
      image: {
        filename: '',
        content_type: '',
        src: ''
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker']),
    startPoint() {
      if (this.nowFilterValue.issue_id.length <= 0) {
        return null
      }
      const result = []
      this.nowFilterValue.issue_id.forEach((item) => {
        result.push(this.getName(this.nowFilterValue.tracker_id, this.nowFilterValue.tracker, 'Issue.') + '#' + item + '-' + this.getName(item, this.nowFilterValue.issueList))
      })
      return result.join(', ')
    },
    getPercentProgress() {
      return Math.round((this.chartProgress.now / this.chartProgress.total) * 100)
    },
    trackerList() {
      return this.tracker.filter((item) => (this.trackerMapList.includes(item.name)))
    },
    trackerMap() {
      return this.trackerMapList.map((item, idx) => {
        const result = {
          name: item,
          relation: {}
        }
        if (this.trackerMapList[idx - 1]) {
          result['relation']['parent'] = [this.trackerMapList[idx - 1]]
        }
        if (this.trackerMapList[idx + 1]) {
          result['relation']['children'] = [this.trackerMapList[idx + 1]]
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
    selectedProjectId() {
      this.initChart()
    },
    async 'filterValue.tracker_id'() {
      this.filterValue.issue_id = []
      await this.getSearchIssue('', true)
      this.$set(this.filterValue, 'issue_id', [this.issueList[0].id])
      await this.onPaintChart()
      await this.getSearchIssue()
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    async initChart() {
      this.$set(this.filterValue, 'tracker_id', this.trackerList[0].id)
      await this.getSearchIssue('', true)
      this.$set(this.filterValue, 'issue_id', [this.issueList[0].id])
      await this.onPaintChart()
    },
    async getSearchIssue(query, init) {
      let querySearch = {}
      let initQuery = {}
      this.issueList = []
      if (query !== '') {
        querySearch = { search: query }
        this.issueQuery = query
      }
      if (init) {
        initQuery = {
          offset: 0,
          limit: 1
        }
      }
      this.issueLoading = true
      const issueList = await getProjectIssueList(this.selectedProjectId, {
        tracker_id: this.filterValue.tracker_id,
        selection: true,
        ...querySearch,
        ...initQuery
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
        relations = issue['relations'].map(item => (this.checkUniqueRelationLine(item.id, issue.id)) ? item.id : null)
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
        editable: false
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
      this.nowFilterValue = Object.assign(this.nowFilterValue, { tracker: this.trackerList, issueList: this.issueList })
      this.accessedIssueId = []
      this.chartIssueList = []
      this.testFilesResult = []
      this.chartProgress.now = 0
      this.chartProgress.total = 0
      for (const item of this.nowFilterValue.issue_id) {
        this.chartProgress.total += 1
        const issue = await getIssue(item)
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
    getName(id, list, translate) {
      if (!list) return null
      const find = list.find((item) => (item.id === id))
      return (find) ? ((translate) ? this.$t(translate + find.name) : find.name) : null
    },
    editNode(nodeId) {
      if (isNaN(parseInt(nodeId))) {
        const software_name = nodeId.split('.')[0]
        this.$router.push({ name: software_name.toLowerCase() })
      } else {
        this.$router.push({ name: 'issue-detail', params: { issueId: nodeId } })
      }
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
      this.dialogVisible = true
      html2canvas(this.$refs.matrix, { scale: 1.2 }).then(canvas => {
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
        this.$refs.rotateImage.appendChild(image)
      })
    },
    handlePreview() {
      this.dialogVisible = true
      html2canvas(this.$refs.matrix, { scale: 1.2 }).then(canvas => {
        const data = canvas.toDataURL('image/png', 1.0)
        const image = new Image()
        image.src = data
        this.$refs.rotateImage.appendChild(image)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.issue-select {
  > > > .el-tag {
    width: 100%;
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

> > > .el-card {
  .el-card__body {
    height: 100%;
    overflow-y: auto;
  }
}

</style>
