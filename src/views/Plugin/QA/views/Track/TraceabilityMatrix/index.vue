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
      <el-button icon="el-icon-download" @click="downloadPdf">{{ $t('TestReport.DownloadPdf') }}</el-button>
    </project-list-selector>
    <el-divider />
    <el-alert v-if="getPercentProgress<100||issueLoading" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress v-if="getPercentProgress" :percentage="getPercentProgress" />
    </el-alert>
    <el-card>
      <div ref="matrix">
        <template slot="header">
          {{ $t('Track.DemandTraceability') }}
          <template v-if="startPoint">（{{ $t('Track.StartingPoint') }}：{{ startPoint }}）</template>
        </template>
        <vue-mermaid
          :nodes="data"
          type="graph LR"
          :config="{securityLevel:'loose',flowChart:{ htmlLabels:true}, logLevel:1}"
          @nodeClick="editNode"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import VueMermaid from './components/vue-mermaid'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssue, getIssueFamily } from '@/api/issue'
import Tracker from '@/components/Issue/Tracker'
import { getProjectIssueList } from '@/api/projects'
import { mapGetters } from 'vuex'
import { getTestPlanDetail, getTraceabilityMatrixReport } from '@/views/Plugin/QA/api/qa'

const QATracker = [
  {
    name: 'Epic',
    relation: {
      children: { target: 'children', next: ['Epic', 'Feature'] }
    }
  },
  {
    name: 'Feature',
    relation: {
      parent: { target: 'parent', next: ['Epic', 'Feature'] },
      children: { target: 'children', next: ['Feature', 'Test Plan'] }
    }
  },
  {
    name: 'Test Plan',
    relation: {
      parent: { target: 'parent', next: ['Feature', 'Test Plan'] },
      children: { next: ['TestFile'] }
    }
  }
]

export default {
  components: { ProjectListSelector, Tracker, VueMermaid },
  data() {
    return {
      filterValue: { tracker_id: null, issue_id: [] },
      nowFilterValue: { tracker_id: null, issue_id: [] },
      issueList: [],
      issueLoading: false,
      chartLoading: false,
      chartProgress: {
        now: 0,
        total: 0
      },
      data: [],
      accessedIssueId: [],
      testFilesResult: []
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
      return this.tracker.filter((item) => (QATracker.map((tracker_item) => (tracker_item.name)).includes(item.name)))
    }
  },
  watch: {
    selectedProjectId() {
      this.initChart()
    },
    'filterValue.tracker_id'() {
      this.filterValue.issue_id = []
      this.getSearchIssue()
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    async initChart() {
      this.$set(this.filterValue, 'tracker_id', this.trackerList[0].id)
      await this.getSearchIssue()
      this.$set(this.filterValue, 'issue_id', [this.issueList[0].id])
      await this.onPaintChart()
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
        selection: true, ...querySearch
      })
      this.issueList = issueList.data
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
    async onPaintChart() {
      this.chartLoading = true
      this.nowFilterValue = Object.assign({}, this.filterValue)
      this.nowFilterValue = Object.assign(this.nowFilterValue, { tracker: this.trackerList, issueList: this.issueList })
      this.accessedIssueId = []
      this.data = []
      this.testFilesResult = []
      this.chartProgress.now = 0
      this.chartProgress.total = 0
      for (const item of this.nowFilterValue.issue_id) {
        this.chartProgress.total += 1
        const issue = await getIssue(item)
        const network = new this.PaintNetwork(this, item, issue.data)
        const family = await getIssueFamily(item)
        this.chartProgress.now += 1
        await network.getPaintFamily(issue.data, family.data)
        await network.end()
      }
      this.chartLoading = false
    },
    PaintNetwork(vueInstance, startPoint, rootIssue) {
      const startNodeIndex = QATracker.findIndex((item) => (item.name === rootIssue.tracker.name))

      this.getIssueFamilyData = async function(issueList) {
        const getIssueFamilyAPI = issueList.map(issue => {
          vueInstance.accessedIssueId.push(issue.id)
          return getIssueFamily(issue.id)
        })
        const response = await Promise.all(getIssueFamilyAPI)
        return Promise.resolve(response.map(res => res.data))
      }

      this.getPaintFamily = async function(issue, issueFamily) {
        vueInstance.chartProgress.total += 1
        const nowNode = QATracker.find((item) => (item.name === issue.tracker.name))
        const nowNodeIndex = QATracker.findIndex((item) => (item.name === issue.tracker.name))
        let children_id = []
        let link = []
        const findRelationTargets = await this.getRelationTargets(startNodeIndex, nowNodeIndex)
        for (const relationTarget of findRelationTargets) {
          const findRelation = nowNode.relation[relationTarget]
          if (findRelation) {
            if (findRelation['next'][0] === 'TestFile') {
              children_id = await this.getPaintTestFile(issue.id)
              link = ['-->']
              vueInstance.chartProgress.now += 1
            } else {
              const getFamilyList = await this.combineFamilyList(issue, issueFamily, relationTarget)
              const getIssuesFamilyList = await this.getIssueFamilyData(getFamilyList)
              for (const [index, subIssue] of getFamilyList.entries()) {
                if (findRelation['next'].includes(subIssue.tracker.name)) {
                  await this.getPaintFamily(subIssue, getIssuesFamilyList[index])
                }
                // !children_id.includes(issue.id) &&
                vueInstance.chartProgress.now += 1
              }
              let children = []
              let relations = []
              if (issueFamily['children']) {
                children = issueFamily['children'].map(item => item.id)
                for (let index = 0; index < children.length; index++) {
                  link.push('-->')
                }
              }
              if (issueFamily['relations']) {
                relations = issueFamily['relations']
                  .map(item => (this.checkUniqueRelationLine(item.id, issue.id)) ? item.id : null)
                  .filter(item => item !== null)
                for (let index = 0; index < relations.length; index++) {
                  link.push('-.' + vueInstance.$t('Issue.RelatedIssue') + '.-')
                }
              }
              children_id = children.concat(relations)
            }
          }
        }
        await this.paintNode(issue, children_id, link)
        return Promise.resolve()
      }

      this.paintNode = function(issue, children, link) {
        // TODO: issue subject or name?
        const issueName = (issue.subject) ? issue.subject : issue.name
        const checkIssueName = issueName.replace(/"/g, '&quot;')
        const point = {
          id: issue.id,
          text: '"#' + issue.id + '-' + checkIssueName + '"',
          link: link,
          group: vueInstance.$t('Issue.' + issue.tracker.name),
          next: children,
          editable: true
        }
        if (issue.relation_type === 'parent') {
          point['next'] = [issue.relation_id]
          point['link'] = ['-->']
        }
        if (issue.id === startPoint) {
          point['style'] = 'fill:#ffafcc'
        }
        vueInstance.data.push(point)
        return Promise.resolve()
      }

      this.getPaintTestFile = async function(issue_id) {
        vueInstance.chartProgress.total += 1
        let test = await getTestPlanDetail(vueInstance.selectedProjectId, issue_id)
        test = test.data
        const children = []
        if (test.hasOwnProperty('test_files')) {
          test.test_files.forEach((item) => {
            if (!vueInstance.testFilesResult.includes(item.file_name)) {
              vueInstance.data.push({
                id: item.file_name,
                link: ['-->'],
                text: '"' + item.file_name + '"',
                group: vueInstance.$t('Issue.TestFile'),
                next: [item.software_name + '.' + item.file_name + '_result'],
                editable: false
              })
              let last_result = null
              // const commit_icon = '<svg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' aria-hidden=\'true\' role=\'img\' class=\'iconify iconify--ion\' width=\'32\' height=\'32\' preserveAspectRatio=\'xMidYMid meet\' viewBox=\'0 0 512 512\'><circle cx=\'256\' cy=\'256\' r=\'96\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'></circle><path fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\' d=\'M160 256H48\'></path><path fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\' d=\'M464 256H352\'></path></svg>'
              const commit_icon = 'Commit: '
              if (item.software_name === 'Postman') {
                const total = [item.the_last_test_result.success + '/' + (item.the_last_test_result.success + item.the_last_test_result.failure)]
                last_result = total + '<br/>' + item.the_last_test_result.branch + '<br/> ' + commit_icon + item.the_last_test_result.commit_id
              } else if (item.software_name === 'SideeX') {
                const total = [item.the_last_test_result.result.casesPassed + '/' + (item.the_last_test_result.result.casesTotal)]
                last_result = total + '<br/>' + item.the_last_test_result.branch + '<br/> ' + commit_icon + item.the_last_test_result.commit_id
              }
              vueInstance.data.push({
                id: item.software_name + '.' + item.file_name + '_result',
                link: ['-->'],
                text: '"' + last_result + '"',
                group: vueInstance.$t('TestCase.TestResult'),
                editable: true
              })
              vueInstance.testFilesResult.push(item.file_name)
            }
            children.push(item.file_name)
          })
        }
        vueInstance.chartProgress.now += 1
        return Promise.resolve(children)
      }

      this.combineFamilyList = function(issue, family, relationTarget) {
        let getFamilyList = []
        if (family.hasOwnProperty(relationTarget)) {
          if (!Array.isArray(family[relationTarget])) {
            family[relationTarget] = [family[relationTarget]]
          }
          family[relationTarget] = this.formatFamilyList(issue, family[relationTarget], relationTarget)
          getFamilyList = getFamilyList.concat(family[relationTarget])
        }
        if (family.hasOwnProperty('relations')) {
          family['relations'] = this.formatFamilyList(issue, family['relations'], 'relations')
          getFamilyList = getFamilyList.concat(family['relations'])
        }
        getFamilyList = getFamilyList.filter(issue => !vueInstance.accessedIssueId.includes(issue.id))
        return Promise.resolve(getFamilyList)
      }

      this.formatFamilyList = function(issue, family, relationTarget) {
        return family.map((item) => ({ ...item, relation_type: relationTarget, relation_id: issue.id }))
      }

      this.filterAccessedIssue = function(family) {
        return Promise.resolve(family.filter(issue => !vueInstance.accessedIssueId.includes(issue.id)))
      }

      this.checkUniqueRelationLine = function(subIssue_id, issue_id) {
        return vueInstance.data.filter(item =>
          (item.next.includes(subIssue_id) && item.id === issue_id) || item.next.includes(issue_id) && item.id === subIssue_id
        ).length <= 0
      }

      this.getRelationTargets = function(startNodeIndex, nowNodeIndex) {
        let findRelationTargets = ['children']
        if (nowNodeIndex === startNodeIndex) {
          findRelationTargets = ['parent', 'children']
        } else if (nowNodeIndex < startNodeIndex) {
          findRelationTargets = ['parent']
        }
        return findRelationTargets
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
        this.$router.push({ name: 'issue-detail', params: { issueId: nodeId }})
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
      this.$pdf(this.$refs.matrix, 'Traceability_Matrix')
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
