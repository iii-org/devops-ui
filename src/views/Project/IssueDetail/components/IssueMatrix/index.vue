<template>
  <div>
    <el-alert v-if="getPercentProgress<100" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <el-card v-else>
      <vue-mermaid
        :nodes="data"
        type="graph LR"
        :config="{securityLevel:'loose',flowChart:{ htmlLabels:true}, logLevel:1}"
        @nodeClick="editNode"
      />
    </el-card>
    <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close :before-close="handleRelationIssueDialogBeforeClose">
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

export default {
  name: 'IssueMatrix',
  components: { VueMermaid, ProjectIssueDetail },
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    tracker: {
      type: Array,
      default: () => ([])
    },
    status: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      issueList: [],
      issueLoading: false,
      chartLoading: false,
      chartProgress: {
        now: 0,
        total: 0
      },
      data: [],
      accessedIssueId: [],
      testFilesResult: [],
      relationIssue: {
        visible: false,
        id: null
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    getPercentProgress() {
      return Math.round((this.chartProgress.now / this.chartProgress.total) * 100)
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
    highLight: function (value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function (str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    },
    async onPaintChart() {
      this.chartLoading = true
      this.accessedIssueId = []
      this.data = []
      this.testFilesResult = []
      this.chartProgress.now = 0
      this.chartProgress.total = 0
      const network = new this.PaintNetwork(this, this.row.id)
      await network.getPaintFamily(this.row.id, this.row.name, this.row.status.name, this.row.tracker.name)
      const result = await network.getResult()
      this.$set(this.$data, 'data', [...this.data, ...result])
      this.chartLoading = false
    },
    PaintNetwork(vueInstance, startPoint) {
      const result = []
      this.getPaintFamily = async function (issue_id, issue_name, issue_status, group) {
        vueInstance.chartProgress.total += 1
        let family = await getIssueFamily(issue_id, { relation: true })
        family = family.data
        const children_id = []
        const link = []
        vueInstance.accessedIssueId.push(issue_id)
        if (family.hasOwnProperty('parent')) {
          family['parent'] = [family['parent']]
        }
        const getFamilyList = await this.combineFamilyList(family)
        for (const issue of getFamilyList) {
          if (!vueInstance.accessedIssueId.includes(issue.id)) {
            if (issue.relation_type === 'children' || issue.relation_type === 'relations') {
              await this.getPaintFamily(issue.id, issue.name, issue.status.name, issue.tracker.name)
            } else {
              await this.getPaintFamily(issue.id, issue.name, issue.status.name, issue.tracker.name, issue_id)
            }
          }

          if (!children_id.includes(issue.id) && (issue.relation_type === 'children' || issue.relation_type === 'relations')) {
            children_id.push(issue.id)
            if (issue.relation_type === 'relations') {
              link.push('-.' + vueInstance.$t('Issue.RelatedIssue') + '.-')
            } else {
              link.push('-->')
            }
          }
        }
        const checkIssueName = issue_name.replace(/"/g, '&quot;')
        const point = {
          id: issue_id,
          text: '"#' + issue_id + '-' + checkIssueName + '<br/>(' + vueInstance.$t('Issue.' + issue_status) + ')"',
          link: link,
          group: vueInstance.$t('Issue.' + group),
          next: children_id,
          editable: true
        }
        if (issue_id === startPoint) {
          point['style'] = 'fill:#ffafcc'
        }
        result.push(point)
        vueInstance.chartProgress.now += 1
      }

      this.combineFamilyList = function (family) {
        const bug = vueInstance.tracker.find((item) => (item.name === 'Bug')).id
        const close = vueInstance.status.find((item) => (item.name === 'Closed')).id
        let getFamilyList = []
        Object.keys(family).forEach((relationType) => {
          if (!Array.isArray(family[relationType])) {
            family[relationType] = [family[relationType]]
          }
          family[relationType] = family[relationType].filter((item) => (!(item.status_id === close && item.tracker_id === bug))).map((item) => ({ ...item, relation_type: relationType }))
          if (family.hasOwnProperty(relationType)) {
            getFamilyList = getFamilyList.concat(family[relationType])
          }
        })
        return getFamilyList
      }

      this.getResult = function () {
        return result
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
  >>>.el-tag{
    width: 100%;
    height: fit-content;
    white-space: normal;
    .el-select__tags-text{
      width: 100%;
    }
  }
}
.loading{
  >>>.el-alert__content{
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
