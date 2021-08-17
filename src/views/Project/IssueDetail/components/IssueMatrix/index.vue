<template>
  <div>
    <el-alert v-if="getPercentProgress<100" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <el-card>
      {{ $t('general.group') }}:
      <el-switch
        v-model="group"
        :active-text="$t('general.on')"
        :inactive-text="$t('general.off')"
      />
      <vue-mermaid
        :nodes="data"
        type="graph LR"
        :config="{securityLevel:'loose',flowChart:{ htmlLabels:true}, logLevel:1}"
        @nodeClick="editNode"
      />
    </el-card>
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
import { getIssueFamily } from '@/api/issue'
import { mapGetters } from 'vuex'
import ProjectIssueDetail from '../../'
import { camelCase } from 'lodash'

export default {
  name: 'IssueMatrix',
  components: { VueMermaid, ProjectIssueDetail },
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
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
      return this.chartIssueList.map(issue => this.formatChartData(issue, this.group))
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
    }
  },
  mounted() {
    this.initChart()
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
      if (issue.id === this.row.id) {
        point['edgeType'] = 'stadium'
      }
      return point
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
        vueInstance.chartIssueList.push({ ...issue, ...issueFamily })
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
