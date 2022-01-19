<template>
  <el-select
    v-model="issueIds"
    style="width: 100%"
    :placeholder="$t('Issue.SearchNameOrAssignee')"
    clearable
    filterable
    remote
    multiple
    value-key="issueIds"
    :remote-method="getSearchIssue"
    :loading="issueLoading"
    @focus="getSearchIssue()"
  >
    <el-option-group
      v-for="group in issueList"
      :key="group.name"
      :label="group.name"
    >
      <template v-for="item in group.options">
        <el-option
          :key="item.id"
          :label="'#' + item.id +' - '+item.name"
          :value="item.id"
        >
          <el-popover
            placement="left"
            width="250"
            trigger="hover"
          >
            <el-card>
              <template slot="header">
                <Tracker :name="$t(`Issue.${item.tracker.name}`)" :type="item.tracker.name" />
                #{{ item.id }} - {{ item.name }}
              </template>
              <strong>{{ $t('Issue.Description') }}:</strong>
              <p>{{ item.description }}</p>
            </el-card>
            <div slot="reference">
              <span
                style="float: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
              >
                <strong>#<span v-html="highLight(item.id.toString())" /></strong> -
                <span v-html="highLight(item.name)" />
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px"
                    v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
              />
            </div>
          </el-popover>
        </el-option>
      </template>
    </el-option-group>
  </el-select>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { getIssue } from '@/api/issue'
import Tracker from '@/components/Issue/Tracker'
import {
  getProjectIssueList,
  getRootProjectId,
  getCommitRelation,
  patchCommitRelation
} from '@/api/projects'

export default {
  name: 'IssueSelect',
  components: { Tracker },
  props: {
    commit: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      issueLoading: false,
      parent: [],
      issueIds: [],
      issueList: []
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    firstEightCommitId() {
      return function (commit) {
        return commit.slice(0, 8)
      }
    },
    highLight() {
      return function (value) {
        if (!value) return ''
        if (!this.issueQuery) return value
        const reg = new RegExp(this.issueQuery, 'gi')
        return value.replace(reg, (str) => `<span class=\'bg-yellow-200 text-danger p-1\'><strong>${str}</strong></span>`)
      }
    }
  },
  watch: {
    parent: {
      deep: true,
      handler() {
        this.getSearchIssue()
      }
    },
    'issueIds'(value) {
      if (!value && !this.issueQuery) {
        this.getSearchIssue()
      }
    }
  },
  mounted() {
    this.getCommitRelationProject(this.commit.commit_id)
  },
  methods: {
    async getCommitRelationProject(commitId) {
      const issue_ids = await getCommitRelation(commitId)
      this.issueIds = issue_ids.data.issue_ids
      await this.getOriginalParentIssue()
    },
    async getOriginalParentIssue() {
      this.parent = await this.originalParentIssue()
    },

    async getRootProject(projectId) {
      const res = await getRootProjectId(projectId)
      this.rootProjectId = res.root_project_id
    },
    async getSearchIssue(query) {
      const params = this.getSearchParams(query)
      const cancelToken = this.checkToken()
      const projectId = this.rootProjectId || this.selectedProjectId
      await getProjectIssueList(projectId, params, { cancelToken })
        .then(res => { this.issueList = this.getListLabels(res) })
      this.issueLoading = false
      this.cancelToken = null
    },
    getSearchParams(query) {
      const params = {
        selection: true,
        status_id: 'open'
      }
      if (query !== '' && query) {
        params['search'] = query
        this.issueQuery = query
        this.issueLoading = true
      } else {
        params['offset'] = 0
        params['limit'] = 5
        this.issueQuery = null
      }
      this.issueList = []
      return params
    },
    getListLabels(res) {
      let queryList = res.data
      let key = 'Issue.Result'
      if (!this.issueQuery) {
        if (queryList && queryList.hasOwnProperty('issue_list')) {
          queryList = res.data.issue_list
        } else {
          queryList = []
        }
        key = 'Issue.LastResult'
      }
      const issueList = [this.parent, { name: this.$t(key), options: queryList }]
      return issueList
    },
    async originalParentIssue() {
      const parent = []
      for (const element of this.issueIds) {
        const res = await getIssue(element)
        parent.push(res.data)
      }
      if (parent.length <= 0) return {}
      return { name: this.$t('Issue.OriginalSetting'), options: parent }
    },
    checkToken() {
      if (this.cancelToken) this.cancelToken.cancel()
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      return CancelToken.token
    },
    async saveIssueLink() {
      const data = {
        commit_id: this.commit.commit_id,
        issue_ids: this.issueIds
      }
      await patchCommitRelation(data)
    }
  }
}
</script>
