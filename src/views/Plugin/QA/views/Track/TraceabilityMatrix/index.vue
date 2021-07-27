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
              <el-option v-for="track in tracker" :key="track.id" :label="$t('Issue.'+track.name)"
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
        > 起始點
          <i class="el-icon-arrow-down el-icon--right" /></el-button>
      </el-popover>
      <el-divider direction="vertical" />
      <el-button icon="el-icon-download" @click="downloadCSVReport">下載Excel總表</el-button>
    </project-list-selector>
    <el-divider />
    <el-alert v-if="getPercentProgress<100||issueLoading" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress v-if="getPercentProgress" :percentage="getPercentProgress" />
    </el-alert>
    <el-card v-else>
      <template slot="header">
        需求追溯
        <template v-if="startPoint">（起始點：{{ startPoint }}）</template>
      </template>
      <vue-mermaid
        :nodes="data"
        type="graph LR"
        :config="{securityLevel:'loose',flowChart:{ htmlLabels:true}, logLevel:1}"
        @nodeClick="editNode"
      />
    </el-card>
  </div>
</template>

<script>
import VueMermaid from './components/vue-mermaid'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssueFamily, getIssueTracker } from '@/api/issue'
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
      tracker: [],
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
    ...mapGetters(['selectedProjectId']),
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
      await this.getSelectionList()
      this.$set(this.filterValue, 'tracker_id', this.tracker[0].id)
      await this.getSearchIssue()
      this.$set(this.filterValue, 'issue_id', [this.issueList[0].id])
      await this.onPaintChart()
    },
    async getSelectionList() {
      const tracker = await getIssueTracker()
      this.tracker = tracker.data.filter((item) => (QATracker.map((tracker_item) => (tracker_item.name)).includes(item.name)))
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
      this.nowFilterValue = Object.assign(this.nowFilterValue, { tracker: this.tracker, issueList: this.issueList })
      const trackerName = this.getName(this.nowFilterValue.tracker_id, this.nowFilterValue.tracker)
      this.accessedIssueId = []
      this.data = []
      this.testFilesResult = []
      this.chartProgress.now = 0
      this.chartProgress.total = 0
      for (const item of this.nowFilterValue.issue_id) {
        const network = new this.PaintNetwork(this, item)
        await network.getPaintFamily(item,
          this.getName(item, this.nowFilterValue.issueList),
          trackerName
        )
        const result = await network.getResult()
        this.$set(this.$data, 'data', [...this.data, ...result])
      }
      this.chartLoading = false
    },
    PaintNetwork(vueInstance, startPoint) {
      const startNodeIndex = QATracker.findIndex((item) => (item.name === vueInstance.getName(vueInstance.nowFilterValue.tracker_id, vueInstance.nowFilterValue.tracker)))
      const result = []

      this.getPaintFamily = async function(issue_id, issue_name, group, last_id) {
        vueInstance.chartProgress.total += 1
        const nowNode = QATracker.find((item) => (item.name === group))
        const nowNodeIndex = QATracker.findIndex((item) => (item.name === group))
        let family = await getIssueFamily(issue_id)
        let children_id = []
        const link = []
        vueInstance.accessedIssueId.push(issue_id)
        family = family.data
        const findRelationTargets = await this.getRelationTargets(startNodeIndex, nowNodeIndex)
        for (const relationTarget of findRelationTargets) {
          const findRelation = nowNode.relation[relationTarget]
          if (findRelation) {
            if (findRelation['next'][0] === 'TestFile') {
              children_id = await this.getPaintTestFile(issue_id)
            } else {
              const getFamilyList = await this.combineFamilyList(family, relationTarget)
              for (const issue of getFamilyList) {
                if (!vueInstance.accessedIssueId.includes(issue.id) && findRelation['next'].includes(issue.tracker.name)) {
                  if (relationTarget === 'children') {
                    await this.getPaintFamily(issue.id, issue.name, issue.tracker.name)
                  } else {
                    await this.getPaintFamily(issue.id, issue.name, issue.tracker.name, issue_id)
                  }
                }
                if (!children_id.includes(issue.id) && relationTarget === 'children') {
                  children_id.push(issue.id)
                  if (issue.relation_type === 'relations') {
                    link.push('-.' + vueInstance.$t('Issue.RelatedIssue') + '.-')
                  } else {
                    link.push('-->')
                  }
                }
              }
            }
          }
        }
        const point = {
          id: issue_id,
          text: '"#' + issue_id + '-' + issue_name + '"',
          link: link,
          group: vueInstance.$t('Issue.' + group),
          next: children_id,
          editable: true
        }
        if (link.length <= 0) {
          point['link'] = ['-->']
        }
        if (last_id) {
          point['next'] = [last_id]
        } else {
          point['next'] = children_id
        }
        if (issue_id === startPoint) {
          point['style'] = 'fill:#ffafcc'
        }
        result.push(point)
        vueInstance.chartProgress.now += 1
      }
      this.getPaintTestFile = async function(issue_id) {
        vueInstance.chartProgress.total += 1
        let test = await getTestPlanDetail(vueInstance.selectedProjectId, issue_id)
        test = test.data
        const children = []
        if (test.hasOwnProperty('test_files')) {
          test.test_files.forEach((item) => {
            if (!vueInstance.testFilesResult.includes(item.file_name)) {
              result.push({
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
              result.push({
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
        return children
      }

      this.combineFamilyList = function(family, relationTarget) {
        let getFamilyList = []
        if (family.hasOwnProperty(relationTarget)) {
          if (!Array.isArray(family[relationTarget])) {
            family[relationTarget] = [family[relationTarget]]
          }
          family[relationTarget] = family[relationTarget].map((item) => ({ ...item, relation_type: relationTarget }))
          getFamilyList = getFamilyList.concat(family[relationTarget])
        }
        if (family.hasOwnProperty('relations')) {
          getFamilyList = getFamilyList.concat(family['relations'])
        }
        return getFamilyList
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

      this.getResult = function() {
        return result
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
