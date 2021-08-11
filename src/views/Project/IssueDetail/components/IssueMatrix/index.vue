<template>
  <div>
    <el-alert v-if="getPercentProgress<100" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title"><i class="el-icon-loading" /> {{ $t('Loading') }}</h2>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <el-card>
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
import ProjectIssueDetail from './'

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
    ...mapGetters(['selectedProjectId', 'tracker', 'status']),
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
      this.chartProgress.total = 1
      const network = new this.PaintNetwork(this, this.row.id)
      const family = await getIssueFamily(this.row.id)
      this.chartProgress.now = 1
      await network.getPaintFamily(this.row, family.data)
      await network.end()
      this.chartLoading = false
    },
    PaintNetwork(vueInstance, startPoint) {
      this.getIssueFamilyData = async function(issueList) {
        const getIssueFamilyAPI = issueList.map(issue => {
          vueInstance.accessedIssueId.push(issue.id)
          return getIssueFamily(issue.id)
        })
        const response = await Promise.all(getIssueFamilyAPI)
        return response.map(res => res.data)
      }

      this.getPaintFamily = async function(issue, issueFamily) {
        vueInstance.chartProgress.total += 1
        const children_id = []
        const link = []
        const getFamilyList = await this.combineFamilyList(issue, issueFamily)
        const getIssuesFamilyList = await this.getIssueFamilyData(getFamilyList)
        for (const [index, subIssue] of getFamilyList.entries()) {
          await this.getPaintFamily(subIssue, getIssuesFamilyList[index])
          if (subIssue.relation_type === 'children') {
            children_id.push(subIssue.id)
            link.push('-->')
          } else if (subIssue.relation_type === 'relations') {
            const checkChartRelations = vueInstance.data.filter(item => item.next.includes(subIssue.id)).length <= 0
            if (checkChartRelations) {
              children_id.push(subIssue.id)
              link.push('-.' + vueInstance.$t('Issue.RelatedIssue') + '.-')
            }
          }
          vueInstance.chartProgress.now += 1
        }

        await this.paintNode(issue, children_id, link)
      }

      this.paintNode = function(issue, children, link) {
        const checkIssueName = issue.name.replace(/"/g, '&quot;')
        const point = {
          id: issue.id,
          text: '"#' + issue.id + '-' + checkIssueName + '<br/>(' + vueInstance.$t('Issue.' + issue.status.name) + ')"',
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
            .map(item => ({
              ...item,
              relation_type: relationType,
              relation_id: issue.id
            }))
          if (family.hasOwnProperty(relationType)) {
            getFamilyList = getFamilyList.concat(family[relationType])
          }
        })
        getFamilyList = getFamilyList.filter(issue => !vueInstance.accessedIssueId.includes(issue.id))
        return getFamilyList
      }

      this.end = function() {
        vueInstance.chartProgress.now = vueInstance.chartProgress.total
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
