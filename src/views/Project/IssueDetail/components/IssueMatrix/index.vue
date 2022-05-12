<template>
  <div
    ref="wrapper"
    class="wrapper"
  >
    <el-alert
      v-if="getPercentProgress < 100"
      type="warning"
      class="mb-4 loading"
      :closable="false"
    >
      <h2 slot="title"><em class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <div class="text-right mb-2">
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form
          :model="form"
          :disabled="chartLoading"
          label-width="150px"
          label-position="left"
        >
          <el-form-item :label="$t('general.group')">
            <el-switch
              v-model="form.group"
              :active-text="$t('general.on')"
              :inactive-text="$t('general.off')"
            />
          </el-form-item>
          <el-form-item>
            <el-switch
              v-model="form.isStatus"
              :active-text="$t('Issue.status')"
              :inactive-text="$t('Issue.tracker')"
            />
          </el-form-item>
          <el-form-item :label="$t('IssueMatrix.SearchAllRelations')">
            <el-switch
              v-model="form.allRelation"
            />
          </el-form-item>
          <!-- <el-form-item v-if="!form.allRelation" :label="$t('IssueMatrix.SearchFor')">
            <div>
              <el-input v-model.number="form.level" style="width: 200px;">
                <div slot="prepend">{{ $t('IssueMatrix.SearchFor') }}</div>
                <div slot="append">{{ $t('IssueMatrix.Layer') }}</div>
              </el-input>
              <el-select
                v-model="form.level"
                clearable
              >
                <el-option
                  v-for="(level, index) of 5"
                  :key="index"
                  :label="level"
                  :value="level"
                />
              </el-select>
              <div style="color: red; font-size: 12px;">{{ $t('IssueMatrix.LayerWarning') }}</div>
            </div>
          </el-form-item> -->
          <el-form-item :label="$t('IssueMatrix.NoRelatedIssues')">
            <el-switch v-model="form.noRelation" />
          </el-form-item>
          <el-form-item :label="$t('IssueMatrix.DisplayItem')">
            <el-select
              v-model="form.showItem"
              :placeholder="$t('IssueMatrix.SelectDisplayItem')"
              multiple
              clearable
              collapse-tags
            >
              <el-option
                v-for="condition in displayConditionsList"
                :key="condition.value"
                :label="condition.label"
                :value="condition.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <el-button
          slot="reference"
          type="text"
          icon="el-icon-s-tools"
        >
          {{ $t('IssueMatrix.ConditionSettings') }}
        </el-button>
      </el-popover>
      <el-button
        icon="el-icon-download"
        class="buttonPrimaryReverse"
        :disabled="selectedProjectId === -1 || chartLoading"
        @click="downloadSVG"
      >{{ $t('Track.DownloadSVG') }}</el-button>
    </div>
    <div
      v-show="data.length > 0"
      ref="matrix"
      v-dragscroll
      class="mermaid-wrapper"
      :style="{ height:`${tableHeight}px` }"
    >
      <VueMermaid
        ref="mermaid"
        :nodes="data"
        type="flowchart LR"
        :class="`w-${zoom}`"
        :config="{ securityLevel: 'loose', flowChart:{ htmlLabels: true }, logLevel: 5 }"
        @nodeClick="editNode"
      />
      <div class="toolbar">
        <el-slider
          v-model="zoom"
          :min="25"
          :max="500"
          :step="25"
        />
      </div>
    </div>
    <el-empty
      v-if="data.length <= 0"
      :description="$t('general.NoData')"
    />
    <el-dialog
      :visible.sync="relationIssue.visible"
      width="90%"
      top="3vh"
      append-to-body
      destroy-on-close
      :before-close="handleRelationIssueDialogBeforeClose"
    >
      <ProjectIssueDetail
        v-if="relationIssue.visible"
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
import { getTestFileByTestPlan } from '@/api/qa'
import theme from '@/theme.js'

const Form = () => ({
  group: false,
  isStatus: true, // status or tracker
  allRelation: false,
  // level: '',
  noRelation: true,
  showItem: ['id', 'name', 'status', 'tracker', 'version']
})

export default {
  name: 'IssueMatrix',
  components: {
    VueMermaid,
    ProjectIssueDetail: () => import('@/views/Project/IssueDetail')
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
    this.displayConditionsList = [
      { value: 'id', label: this.$t('IssueMatrix.Id') },
      { value: 'name', label: this.$t('IssueMatrix.Name') },
      { value: 'status', label: this.$t('IssueMatrix.Status') },
      { value: 'tracker', label: this.$t('IssueMatrix.Tracker') },
      { value: 'assignee', label: this.$t('IssueMatrix.Assignee') },
      { value: 'version', label: this.$t('IssueMatrix.Version') }
    ]
    return {
      tableHeight: 0,
      zoom: 100,
      chartIssueList: [],
      // chartProgress: {
      //   level: 0,
      //   now: 0,
      //   total: 0
      // },
      accessedIssueId: [],
      relationLine: {},
      relationIssue: {
        visible: false,
        id: null
      },
      trackerColor: Object.freeze(theme.backgroundColor),
      form: new Form()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker', 'status']),
    getPercentProgress() {
      return Math.round((this.chartIssueList.length / this.accessedIssueId.length) * 100)
    },
    chartLoading() {
      return this.accessedIssueId.length !== this.chartIssueList.length
    },
    data() {
      const chartData = this.chartIssueList.map((issue) => this.formatChartData(issue))
      let testFileList = this.chartIssueList
        .map((issue) => (issue.test_files ? issue.test_files : null))
        .filter((issue) => issue)
      testFileList = [].concat.apply([], testFileList).map((test_file) => this.formatTestFile(test_file))
      testFileList = [].concat.apply([], testFileList)
      return chartData.concat(testFileList)
    }
  },
  watch: {
    selectedProjectId() {
      this.initChart()
    },
    'form.allRelation'(val) {
      if (val) this.form.level = ''
      this.initChart()
    },
    'form.noRelation'(val) {
      this.initChart()
    }
    // 'form.level'(val) {
    //   if (val) {
    //     this.chartProgress.now = 0
    //     this.chartProgress.total = 0
    //   }
    //   this.initChart()
    // }
  },
  mounted() {
    this.initChart()
    this.$nextTick(() => {
      this.tableHeight = this.$refs['wrapper'].clientHeight - 30
    })
    window.onresize = () => {
      this.$nextTick(() => {
        this.tableHeight = this.$refs['wrapper'].clientHeight - 30
      })
    }
  },
  methods: {
    async initChart() {
      await this.onPaintChart()
    },
    highLight: function (value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function (str) {
        return "<span class='bg-yellow-200 text-danger p-1'><strong>" + str + '</strong></span>'
      })
    },
    checkUniqueRelationLine(subIssue_id, issue_id) {
      return !(
        Object.keys(this.relationLine).includes(subIssue_id.toString()) &&
        this.relationLine[subIssue_id].includes(issue_id)
      )
    },
    formatChartData(issue) {
      const link = []
      let children = []
      let relations = []
      if (issue['children']) {
        children = issue['children'].map((item) => item.id)
        for (let index = 0; index < children.length; index++) {
          link.push('-->')
        }
      }
      if (issue['relations']) {
        relations = issue['relations']
          .map((item) => (this.checkUniqueRelationLine(item.id, issue.id) ? item.id : null))
          .filter((item) => item !== null)
        for (let index = 0; index < relations.length; index++) {
          link.push('-.' + this.$t('Issue.RelatedIssue') + '.-')
        }
        this.relationLine[issue.id] = relations
      }
      children = children.concat(relations)
      if (issue['test_files']) {
        const test_files = issue['test_files'].map((item) => item.file_name)
        for (let index = 0; index < test_files.length; index++) {
          link.push('-->')
        }
        children = children.concat(test_files)
      }
      const point = this.getChartLayout(issue, link, children)
      return point
    },
    getChartLayout(issue, link, children) {
      const checkIssueName = issue.name.replace(/"/g, '&quot;')
      const point = {
        id: issue.id,
        next: children,
        link,
        editable: true
      }
      if (issue.id === this.row.id) {
        point['edgeType'] = 'stadium'
      }

      point['text'] = `"`
      if (this.isConditionSelected('id')) point['text'] += `#${issue.id}`
      if (this.isConditionSelected('name')) point['text'] += ` - ${checkIssueName}`
      if (point['text'] !== `"`) point['text'] += `<br/>`
      if (this.isConditionSelected('version') && issue.fixed_version && issue.fixed_version.name) {
        point[
          'text'
        ] += `<span style=\'border-radius: 0.25rem; background: white; font-size: 0.75em; padding: 3px 5px; margin: 3px 5px;\'>${issue.fixed_version.name}</span>`
      }
      if (this.form.group) {
        if (this.form.isStatus) {
          if (this.isConditionSelected('status')) point['text'] += `(${this.$t('Issue.' + issue.tracker.name)})`
          point['group'] = `${this.$t('Issue.' + issue.status.name)}`
          point['style'] = `fill:${this.trackerColor[camelCase(issue.tracker.name)]},fill-opacity:0.5`
        } else {
          if (this.isConditionSelected('tracker')) point['text'] += `(${this.$t('Issue.' + issue.status.name)})`
          point['group'] = `${this.$t('Issue.' + issue.tracker.name)}`
          point['style'] = `fill:${this.trackerColor[camelCase(issue.status.name)]},fill-opacity:0.5`
        }
      } else {
        if (this.isConditionSelected('status')) point['text'] += `${this.$t('Issue.' + issue.status.name)}`
        if (this.isConditionSelected('tracker')) point['text'] += ` - (${this.$t('Issue.' + issue.tracker.name)})`
        if (this.form.isStatus) {
          point['style'] = `fill:${this.trackerColor[camelCase(issue.status.name)]},fill-opacity:0.5`
        } else {
          point['style'] = `fill:${this.trackerColor[camelCase(issue.tracker.name)]},fill-opacity:0.5`
        }
      }
      if (point['text'] !== `"`) point['text'] += `<br/>`
      if (this.isConditionSelected('assignee') && issue.assigned_to && issue.assigned_to.name) point['text'] += `${issue.assigned_to.name}`
      point['text'] += `"`
      return point
    },
    isConditionSelected(item) {
      return this.form.showItem.includes(item)
    },
    formatTestFile(test_file) {
      const result = []
      const file = {
        id: test_file.file_name,
        link: ['-->'],
        next: [`${test_file.software_name}.${test_file.file_name}_result`],
        editable: false
      }
      if (this.form.group) {
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
          count_result = `${status_light} <span style=\'color: ${color['failure']}; font-weight:600;\'>Failure (${success} / ${total})</span>`
        }
        last_result =
          count_result +
          '<br/>' +
          test_file.the_last_test_result.branch +
          '<br/> ' +
          commit_icon +
          test_file.the_last_test_result.commit_id
      } else if (test_file.software_name === 'SideeX') {
        const success = test_file.the_last_test_result.result.casesPassed
        const total = test_file.the_last_test_result.result.casesTotal
        let count_result
        if (success === total) {
          status_light = `<div style=\'width:10px; height: 10px; background-color: ${color['pass']}; display:inline-block; border-radius: 99999px; \'></div>`
          count_result = `${status_light} <span style=\'color: ${color['pass']}; font-weight:600;\'>Pass</span>`
        } else {
          status_light = `<div style=\'width:10px; height: 10px; background-color: ${color['failure']}; display:inline-block; border-radius: 99999px; \'></div>`
          count_result = `${status_light} <span style=\'color: ${color['failure']}; font-weight:600;\'>Failure (${success} / ${total})</span>`
        }
        last_result =
          count_result +
          '<br/>' +
          test_file.the_last_test_result.branch +
          '<br/> ' +
          commit_icon +
          test_file.the_last_test_result.commit_id
      }
      const file_result = {
        id: `${test_file.software_name}.${test_file.file_name}_result`,
        link: ['-->'],
        text: `"${last_result}"`,
        editable: true
      }
      if (this.form.group) {
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
      this.accessedIssueId = []
      this.chartIssueList = []
      const family = (await getIssueFamily(this.row.id)).data
      this.accessedIssueId.push(this.row.id)
      await this.handlePaintFamily(this.row, family)
    },
    async handlePaintFamily(issue, issueFamily) {
      await this.getChartIssueList(issue, issueFamily)
      await this.paintAllFamily(issue, issueFamily)
    },
    async paintAllFamily(issue, issueFamily) {
      const getFamilyList = await this.combineFamilyList(issue, issueFamily)
      const getIssuesFamilyList = await this.getIssueFamilyData(getFamilyList)
      getFamilyList.forEach(async (subIssue, index) => {
        await this.handlePaintFamily(subIssue, getIssuesFamilyList[index])
      })
    },
    async getChartIssueList(issue, issueFamily) {
      if (issue.tracker.name === 'Test Plan') {
        const test_files = await this.getTestPlan(issue.id)
        this.chartIssueList.push({ ...issue, ...issueFamily, test_files })
      } else {
        this.chartIssueList.push({ ...issue, ...issueFamily })
      }
    },
    async getTestPlan(issueId) {
      const testFiles = await getTestFileByTestPlan(this.selectedProjectId, issueId)
      return testFiles.data
    },
    async getIssueFamilyData(chartIssueList) {
      const getIssueFamilyAPI = chartIssueList.map((issue) => {
        this.accessedIssueId.push(issue.id)
        return getIssueFamily(issue.id)
      })
      const response = await Promise.all(getIssueFamilyAPI)
      return Promise.resolve(response.map((res) => res.data))
    },
    combineFamilyList(issue, family) {
      const bug = this.tracker.find((item) => item.name === 'Bug').id
      const close = this.status.find((item) => item.name === 'Closed').id
      let familyList = []
      Object.keys(family).forEach((relationType) => {
        if (this.form.noRelation && relationType === 'relations') return
        if (!this.form.allRelation && relationType === 'parent') return
        if (!Array.isArray(family[relationType])) {
          family[relationType] = [family[relationType]]
        }
        family[relationType] = family[relationType].filter(
          (item) => !(item.status_id === close && item.tracker_id === bug)
        )
        family[relationType] = this.formatFamilyList(issue, family[relationType], relationType)
        if (family.hasOwnProperty(relationType)) {
          familyList = familyList.concat(family[relationType])
        }
      })
      familyList = familyList.filter((item) => !this.accessedIssueId.includes(item.id))
      return Promise.resolve(familyList)
    },
    formatFamilyList(issue, family, relationTarget) {
      return family.map((item) => ({ ...item, relation_type: relationTarget, relation_id: issue.id }))
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
          .catch(() => {})
      } else {
        done()
      }
    },
    downloadSVG() {
      try {
        const svg = document.getElementById('mermaid').getElementsByTagName('svg')[0]
        const style = svg.getElementsByClassName('nodeLabel')
        for (let idx = 0; idx < style.length; idx++) {
          style[idx].style = 'font-size:0.8em'
        }
        const serializer = new XMLSerializer()
        let source = serializer.serializeToString(svg)
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = `TraceabilityMatrix_${this.$dayjs().format('YYYY-MM-DD_HH:mm:ss')}`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      } catch (e) {
        // nothing to do.
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
  @apply overflow-hidden;
}

.mermaid-wrapper {
  @apply cursor-move static overflow-auto;
  .toolbar {
    @apply absolute bottom-10 right-10 z-50 w-1/6;
  }

  @for $i from 1 through 20 {
    .w-#{25 * $i} {
      width: calc(#{$max_width} * 0.25 * #{$i});
      height: calc(#{$max_height} * 0.25 * #{$i});

      >>> svg {
        width: 25% * $i;
        height: calc(25% * #{$i} - 20px);
        transform-origin: top left;
        transform: scale(0.25 * $i);
      }
    }
  }
}

.relation_settings {
  >>> .el-form-item__content {
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
  >>> .el-tag {
    //width: 100%;
    height: fit-content;
    white-space: normal;

    .el-select__tags-text {
      width: 100%;
    }
  }
}

.loading {
  >>> .el-alert__content {
    width: 100%;
  }
}

//>>>. el-card {
//  .el-card__body {
//    height: 100%;
//    overflow-y: auto;
//  }
//}
</style>
