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
import ProjectIssueDetail from '../../'

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
      this.accessedIssueId = []
      this.data = []
      this.testFilesResult = []
      this.chartProgress.total = 1
      const network = new this.PaintNetwork(this, this.row.id)
      const family = await getIssueFamily(this.row.id)
      this.chartProgress.now = 1
      this.accessedIssueId.push(this.row.id)
      await network.getPaintFamily(this.row, family.data)
      await network.end()
      this.chartLoading = false
    },
    PaintNetwork(vueInstance, startPoint) {
      const fetchingParent = {}
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
        const getFamilyList = await this.combineFamilyList(issue, issueFamily)
        const getIssuesFamilyList = await this.getIssueFamilyData(getFamilyList)
        for (const [index, subIssue] of getFamilyList.entries()) {
          await this.getPaintFamily(subIssue, getIssuesFamilyList[index])
          vueInstance.chartProgress.now += 1
        }
        const link = []
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
        const children_id = children.concat(relations)
        await this.paintNode(issue, children_id, link)
        return Promise.resolve()
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
        if (issue.id === startPoint) {
          point['style'] = 'fill:#ffafcc'
        }
        vueInstance.data.push(point)
        return Promise.resolve()
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
        return Promise.resolve(getFamilyList)
      }

      this.filterAccessedIssue = function(family) {
        return Promise.resolve(family.filter(issue => !vueInstance.accessedIssueId.includes(issue.id)))
      }

      this.checkUniqueRelationLine = function(subIssue_id, issue_id) {
        return vueInstance.data.filter(item =>
          (item.next.includes(subIssue_id) && item.id === issue_id) || item.next.includes(issue_id) && item.id === subIssue_id
        ).length <= 0
      }

      this.end = function() {
        Object.keys(fetchingParent).forEach((parent_id) => {
          const getParentIssue = vueInstance.data.find(item => (item.id).toString() === parent_id)
          if (getParentIssue) {
            const link = []
            for (let i = 0; i < fetchingParent[parent_id].length; i++) link.push('-->')
            vueInstance.$set(getParentIssue, 'next', getParentIssue['next'].concat(fetchingParent[parent_id]))
            vueInstance.$set(getParentIssue, 'link', getParentIssue['link'].concat(link))
          }
        })
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
