<template>
  <el-col
    v-loading="listLoading"
    class="inner"
    :style="{height:height}"
  >
    <template v-if="listData.length>0">
      <transition-group
        name="slide-fade"
        tag="el-timeline"
      >
        <el-timeline-item
          v-for="commit in listData"
          :key="commit.id"
          :timestamp="commit.commit_time"
          placement="top"
        >
          <el-card class="timeline-item-card">
            <h4>{{ commit.commit_title }}</h4>
            <p v-if="compareCommitContent(commit)">{{ commit.commit_message }}</p>
            <p class="author">
              <template v-if="commitLink">
                <a :href="commit.web_url" class="el-link el-link--primary is-underline" target="_blank">
                  <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }}
                </a> : 
              </template>
              {{ commit.author_name }} @ {{ commit.pj_name }}
              <a v-if="type==='issueDetail'" @click="toggleIssueCommitDialog(commit)">
                <em class="ri-link" />
              </a>
            </p>
          </el-card>
        </el-timeline-item>
      </transition-group>
      <el-dialog
        v-if="type==='issueDetail'"
        :visible.sync="issueCommitDialog.visible"
        width="60%"
        top="50px"
        append-to-body
        destroy-on-close
      >
        <div slot="title">
          {{ $t('Issue.IssueHookSetting') }}
          <el-button
            type="primary"
            class="float-right"
            style="margin-right: 2em;"
            size="small"
            @click="toggleSaveCommitDialog"
          >
            {{ $t('general.Save') }}
          </el-button>
        </div>
        <a :href="commitData.web_url" class="el-link el-link--primary is-underline" target="_blank">
          <em class="ri-git-commit-line" />{{ firstEightCommitId(commitId) }}
        </a>
        : {{ commitData.author_name }} @ {{ commitData.commit_title }}
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
      </el-dialog>
    </template>
    <no-data v-else />
  </el-col>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import {
  getProjectIssueList,
  getRootProjectId,
  getCommitRelation,
  patchCommitRelation
} from '@/api/projects'
import { getIssue } from '@/api/issue'
import Tracker from '@/components/Issue/Tracker'
import NoData from './widget/NoData'

export default {
  name: 'AdminCommitLog',
  components: { Tracker, NoData },
  props: {
    type: {
      type: String,
      default: 'dashboard'
    },
    data: {
      type: Function,
      default: () => []
    },
    commitLink: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: '250px'
    }
  },
  data() {
    return {
      listData: [],
      detailDialog: false,
      listLoading: false,
      issueCommitDialog: {
        visible: false
      },
      parent: [],
      commitData: {},
      commitId: '',
      issueIds: [],
      rootProjectId: '',
      issueQuery: null,
      issueLoading: false,
      issueList: [],
      cancelToken: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    compareCommitContent() {
      return function (commit) {
        return commit.commit_message.trim() !== commit.commit_title
      }
    },
    firstEightCommitId() {
      return function (commit) {
        return commit.slice(0, 8)
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
    this.loadData()
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.data()
      this.listLoading = false
    },
    async getCommitRelationProject() {
      const issue_ids = await getCommitRelation(this.commitId)
      this.issueIds = issue_ids.data.issue_ids
    },
    async getRootProject() {
      const res = await getRootProjectId(this.selectedProjectId)
      this.rootProjectId = res.root_project_id
    },
    async toggleIssueCommitDialog(commit) {
      this.listLoading = true
      this.commitData = commit
      this.commitId = commit.commit_id
      await this.getCommitRelationProject()
      await this.getRootProject()
      this.parent = await this.originalParentIssue()
      this.issueCommitDialog.visible = !this.issueCommitDialog.visible
      this.listLoading = false
    },
    async toggleSaveCommitDialog() {
      const data = {
        commit_id: this.commitId,
        issue_ids: this.issueIds
      }
      await patchCommitRelation(data)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.issueCommitDialog.visible = !this.issueCommitDialog.visible
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
    highLight: function(value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function(str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.inner {
  overflow-y: auto;
  overflow-x: hidden;
}

.timeline-item-card {
  >>> .el-card__body {
    padding: 10px;
  }

  .author {
    margin-bottom: 0;
  }
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
