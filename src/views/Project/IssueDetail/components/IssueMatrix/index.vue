<template>
  <div ref="wrapper" class="wrapper">
    <el-alert v-if="getPercentProgress<100" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    {{ $t('general.group') }}:
    <el-switch
      v-model="group"
      :active-text="$t('general.on')"
      :inactive-text="$t('general.off')"
    />
    <div v-show="data.length>0" ref="matrix" v-dragscroll class="mermaid-wrapper"
         :style="{height:`${tableHeight}px`}"
    >
      <vue-mermaid
        ref="mermaid"
        :nodes="data"
        type="flowchart LR"
        :class="`w-${zoom}`"
        :config="{securityLevel:'loose',flowChart:{ htmlLabels:true}, logLevel:5}"
        @nodeClick="editNode"
      />
      <div class="toolbar">
        <el-slider v-model="zoom" :min="25" :max="500" :step="25" />
      </div>
    </div>
    <el-empty v-if="data.length<=0" :description="$t('general.NoData')" />
    <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close
               :before-close="handleRelationIssueDialogBeforeClose"
    >
      <QAProjectIssueDetail v-if="relationIssue.visible"
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
import { getIssueFamily } from '@/api/issue'
import { mapGetters } from 'vuex'
import { camelCase } from 'lodash'
import { dragscroll } from 'vue-dragscroll'
import { getTestFileByTestPlan } from '@/views/Plugin/QA/api/qa'

export default {
  name: 'IssueMatrix',
  components: { VueMermaid,
    QAProjectIssueDetail: () => import ('@/views/Plugin/QA/views/Project/IssueDetail')
  },
  directives: {
    dragscroll
  },
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tableHeight: 0,
      zoom: 100,
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
      relationIssue: {
        visible: false,
        id: null
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker', 'status']),
    getPercentProgress() {
      return Math.round((this.chartProgress.now / this.chartProgress.total) * 100)
    },
    data() {
      const chartData = this.chartIssueList.map(issue => this.formatChartData(issue, this.group))
      let testFileList = this.chartIssueList.map(issue => (issue.test_files) ? issue.test_files : null)
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
    selectedProjectId() {
      this.initChart()
    }
  },
  mounted() {
    this.initChart()
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
      await this.onPaintChart()
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
      point['text'] = `"#${issue.id} - ${checkIssueName}<br/>`
      if (issue.fixed_version && issue.fixed_version.name) {
        point['text'] += `<span style=\'border-radius: 0.25rem; background: white; font-size: 0.75em; padding: 3px 5px; margin: 3px 5px;\'>${issue.fixed_version.name}</span>`
      }
      point['text'] += `(${this.$t('Issue.' + issue.status.name)})"`
      if (group) {
        point['group'] = `${this.$t('Issue.' + issue.tracker.name)}`
      } else {
        point['style'] = `fill:${this.trackerColor[camelCase(issue.tracker.name)]},fill-opacity:0.5`
      }
      if (issue.id === this.row.id) {
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
          count_result = ` <span style=\'color: ${color['failure']}; font-weight:600;\'>Failure (${success} / ${total})</span>`
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
          count_result = ` <span style=\'color: ${color['failure']}; font-weight:600;\'>Failure (${success} / ${total})</span>`
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
      this.accessedIssueId = []
      this.chartIssueList = []
      this.chartProgress.total = 1
      const network = new this.PaintNetwork(this)
      const family = await getIssueFamily(this.row.id)
      this.chartProgress.now = 1
      this.accessedIssueId.push(this.row.id)
      await network.getPaintFamily(this.row, family.data)
      await network.end()
      this.chartLoading = false
    },
    PaintNetwork(vueInstance) {
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
        if (issue.tracker.name === 'Test Plan') {
          const test_files = await getTestFileByTestPlan(vueInstance.selectedProjectId, issue.id)
          vueInstance.chartIssueList.push({ ...issue, ...issueFamily, test_files: test_files.data })
        } else {
          vueInstance.chartIssueList.push({ ...issue, ...issueFamily })
        }
        const getFamilyList = await this.combineFamilyList(issue, issueFamily)
        const getIssuesFamilyList = await this.getIssueFamilyData(getFamilyList)
        for (const [index, subIssue] of getFamilyList.entries()) {
          await this.getPaintFamily(subIssue, getIssuesFamilyList[index])
          vueInstance.chartProgress.now += 1
        }
        return Promise.resolve(issue)
      }

      this.combineFamilyList = function(issue, family) {
        const bug = vueInstance.tracker.find((item) => (item.name === 'Bug')).id
        const close = vueInstance.status.find((item) => (item.name === 'Closed')).id
        let getFamilyList = []
        Object.keys(family).forEach((relationType) => {
          if (!Array.isArray(family[relationType])) {
            family[relationType] = [family[relationType]]
          }
          family[relationType] = family[relationType]
            .filter(item => !(item.status_id === close && item.tracker_id === bug))
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

      this.end = function() {
        vueInstance.chartProgress.now = vueInstance.chartProgress.total
        return Promise.resolve()
      }
    },
    editNode(nodeId) {
      this.onRelationIssueDialog(nodeId)
    },
    handleRelationUpdate() {
      this.onCloseRelationIssueDialog()
      this.initChart()
      this.$emit('update-issue')
    },
    onRelationIssueDialog(id) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
    },
    onCloseRelationIssueDialog() {
      this.$set(this.relationIssue, 'visible', false)
      this.$set(this.relationIssue, 'id', null)
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
$max_height: calc(100vh - 50px - 20px - 50px - 50px);
$max_width: calc(100vw - 50px - 20px - 50px - 50px);
.wrapper {
  height: #{$max_height};
  overflow: hidden;
}

.mermaid-wrapper {
  @apply cursor-move;
  overflow: hidden;
  @apply static;
  .toolbar {
    @apply absolute bottom-10 right-10 z-50 w-1/6;
  }

  @for $i from 1 through 20 {
    .w-#{25 * $i} {
      width: calc(#{$max_width} * 0.25 * #{$i});
      height: calc(#{$max_height} * 0.25 * #{$i});

      > > > svg {
        width: 25% * $i;
        height: calc(25% * #{$i} - 20px);
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

//> > > .el-card {
//  .el-card__body {
//    height: 100%;
//    overflow-y: auto;
//  }
//}

</style>
