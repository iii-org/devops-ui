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
              <a v-if="commit.web_url" :href="commit.web_url" class="el-link el-link--primary is-underline" target="_blank">
                <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }} :
              </a>
              <a v-else style="cursor: default;">
                <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }} :
              </a>
              {{ commit.author_name }} @ {{ commit.pj_name }}
              <el-tooltip effect="dark" :content="$t('Issue.EditIssueHook')" placement="bottom">
                <a
                  class="el-link el-link--primary"
                  @click="toggleIssueSingleCommitDialog(commit)"
                >
                  <em class="ri-link" />
                </a>
              </el-tooltip>
            </p>
          </el-card>
        </el-timeline-item>
      </transition-group>
      <el-dialog
        v-if="issueSingleCommitDialog.visible"
        :visible.sync="issueSingleCommitDialog.visible"
        width="60%"
        top="50px"
        append-to-body
      >
        <div slot="title">
          {{ $t('Issue.CommitIssueHookSetting') }}
          <el-button
            type="primary"
            class="float-right"
            style="margin-right: 2em;"
            size="small"
            :disabled="!isEnabledSaveSingleCommitHookBtn"
            @click="toggleSaveSingleCommitDialog"
          >
            {{ $t('general.Save') }}
          </el-button>
        </div>
        <a v-if="commitData.web_url" :href="commitData.web_url" class="el-link el-link--primary is-underline" target="_blank">
          <em class="ri-git-commit-line" />{{ firstEightCommitId(commitData.commit_id) }} :
        </a>
        <a v-else style="cursor: default;">
          <em class="ri-git-commit-line" />{{ firstEightCommitId(commitData.commit_id) }} :
        </a>
        {{ commitData.author_name }} @ {{ commitData.commit_title }}
        <IssueSelect
          ref="IssueSelect"
          :commit-id="commitData.commit_id"
          :issue-ids="issueIds"
          :issue-list="issueList"
          :issue-query="issueQuery"
          @update="getSearchIssue"
          @change="changeSingleIssueIds"
        />
      </el-dialog>
      <el-dialog
        v-if="issueMultiCommitDialog.visible"
        :visible.sync="issueMultiCommitDialog.visible"
        width="60%"
        top="50px"
        append-to-body
      >
        <div slot="title">
          {{ $t('Issue.CommitIssueHookSetting') }}
          <span style="padding-left: 10px;">
            #{{ issueId }} - {{ issueName }}
          </span>
          <el-button
            type="primary"
            class="float-right"
            style="margin-right: 2em;"
            size="small"
            :disabled="!isEnabledSaveMultiCommitHookBtn"
            @click="toggleSaveMultiCommitDialog"
          >
            {{ $t('general.Save') }}
          </el-button>
        </div>
        <transition-group
          name="slide-fade"
          tag="el-timeline"
        >
          <el-timeline-item
            v-for="commit in listAllData"
            :key="commit.id"
            :timestamp="commit.commit_time"
            placement="top"
          >
            <p class="author">
              <el-row>
                <el-col :span="14">
                  <a v-if="commit.web_url" :href="commit.web_url" class="el-link el-link--primary is-underline" target="_blank">
                    <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }}
                  </a>
                  <a v-else style="cursor: default;">
                    <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }}
                  </a>
                  : {{ commit.author_name }} @ {{ commit.commit_message }}
                </el-col>
                <el-col :span="10">
                  <IssueSelect
                    ref="IssueSelect"
                    :commit-id="commit.commit_id"
                    :issue-ids="commit.issue_ids"
                    :issue-list="commit.issue_list"
                    :issue-loading="commit.issue_loading"
                    :parent="commit.parent"
                    :issue-query="issueQuery"
                    @update="getSearchIssue"
                    @change="changeMultiIssueIds"
                  />
                </el-col>
              </el-row>
            </p>
          </el-timeline-item>
        </transition-group>
      </el-dialog>
      <el-tooltip effect="dark" :content="$t('Issue.BatchEditIssueHook')" placement="bottom">
        <a
          size="mini"
          class="el-link el-link--primary"
          style="position:absolute; right:10px; top:5px;"
          @click="toggleIssueMultiCommitDialog()"
        >
          {{ $t('Issue.IssueHookSetting') }}
          <em class="ri-link" />
        </a>
      </el-tooltip>
    </template>
    <NoData v-else />
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
import {
  getIssue,
  getIssueGitCommitLog
} from '@/api/issue'
import { UTCtoLocalTime } from '@/filters'
import IssueSelect from '@/components/Issue/IssueSelect'
import NoData from './widget/NoData'

class CommitLogItem {
  constructor (data) {
    this.issue_ids = data.issue_ids !== undefined ? data.issue_ids : []
    this.parent = data.parent !== undefined ? data.parent : {}
    this.issue_list = data.issue_list !== undefined ? data.issue_list : []
    this.id = data.id !== undefined ? data.id : -1
    this.issue_loading = data.issue_loading !== undefined ? data.issue_loading : true
    this.pj_name = data.pj_name !== undefined ? data.pj_name : ''
    this.issue_id = data.issue_id !== undefined ? data.issue_id : ''
    this.author_name = data.author_name !== undefined ? data.author_name : ''
    this.commit_id = data.commit_id !== undefined ? data.commit_id : ''
    this.commit_message = data.commit_message !== undefined ? data.commit_message : ''
    this.commit_title = data.commit_title !== undefined ? data.commit_title : ''
    this.commit_time = data.commit_time !== undefined ? data.commit_time : ''
    this.branch = data.branch !== undefined ? data.branch : ''
    this.web_url = data.web_url !== undefined ? data.web_url : ''
    this.created_at = data.created_at !== undefined ? data.created_at : ''
    this.updated_at = data.updated_at !== undefined ? data.updated_at : ''
  }
}

export default {
  name: 'CommitIssueHookTab',
  components: { IssueSelect, NoData },
  props: {
    issueId: {
      type: Number,
      default: null
    },
    issueName: {
      type: String,
      default: ''
    },
    getData: {
      type: Function,
      default: () => []
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
      issueSingleCommitDialog: {
        visible: false
      },
      issueMultiCommitDialog: {
        visible: false
      },
      listAllData: [],
      parent: [],
      commitData: {},
      commitId: '',
      issueIds: [],
      fatherIssueIds: [],
      rootProjectId: '',
      issueQuery: null,
      issueList: [],
      cancelToken: null,
      multiType: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    isEnabledSaveSingleCommitHookBtn() {
      return this.issueIds.length > 0
    },
    isEnabledSaveMultiCommitHookBtn() {
      const hasCommit = this.listAllData.length > 0
      if (hasCommit) {
        return this.listAllData.reduce((prevVal, commitLog) => {
          return prevVal && commitLog.issue_ids.length > 0
        }, true)
      } else {
        return false
      }
    }
  },
  watch: {
    issueId(value) {
      if (value) this.loadData()
    },
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
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.getData()
      this.listLoading = false
    },
    async getCommitRelationIssue(commitId) {
      const issueInProject = []
      const issueOutProject = []
      await getCommitRelation(commitId).then((res) => {
        for (const [key, value] of Object.entries(res.data.issue_ids)) {
          if (value) {
            issueInProject.push(parseInt(key))
          } else {
            issueOutProject.push(parseInt(key))
          }
        }
        this.fatherIssueIds = issueOutProject
      })
      return issueInProject
    },
    async getRootProject(projectId) {
      const res = await getRootProjectId(projectId)
      this.rootProjectId = res.root_project_id
    },
    async toggleIssueSingleCommitDialog(commit) {
      this.issueSingleCommitDialog.visible = !this.issueSingleCommitDialog.visible
      this.multiType = false
      this.commitData = commit
      this.commitId = commit.commit_id
      await this.getRootProject(this.selectedProjectId)
      this.issueIds = await this.getCommitRelationIssue(commit.commit_id)
      this.parent = await this.originalParentIssue(this.issueIds)
    },
    toggleSaveSingleCommitDialog() {
      const issueAllIds = this.issueIds.concat(this.fatherIssueIds)
      this.saveIssueIds(this.commitId, issueAllIds)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.issueSingleCommitDialog.visible = !this.issueSingleCommitDialog.visible
    },
    async toggleIssueMultiCommitDialog() {
      this.multiType = true
      this.listAllData = await this.getAllGitCommitLogData()
      this.issueMultiCommitDialog.visible = !this.issueMultiCommitDialog.visible
    },
    toggleSaveMultiCommitDialog() {
      this.listAllData.forEach((item) => {
        const issueAllIds = item.issue_ids.concat(item.father_issue_ids)
        this.saveIssueIds(item.commit_id, issueAllIds)
      })
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.issueMultiCommitDialog.visible = !this.issueMultiCommitDialog.visible
    },
    async getAllGitCommitLogData() {
      await this.getRootProject(this.selectedProjectId)
      const { data } = await getIssueGitCommitLog(this.rootProjectId, parseInt(this.$route.params.issueId))
      const commitLogs = data.map((item) => new CommitLogItem(item))
      commitLogs.forEach(async(item, index) => {
        item['id'] = index
        const issueIds = await this.getCommitRelationIssue(item['commit_id'])
        item['issue_ids'] = issueIds
        item['father_issue_ids'] = this.fatherIssueIds
        const parent = await this.originalParentIssue(issueIds)
        item['parent'] = parent
        const issueList = await this.getMultiUnderList(parent)
        item['issue_list'] = issueList
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
        item['issue_loading'] = false
      })
      return commitLogs
    },
    async getSearchIssue(query, commitId, parent) {
      const params = this.getSearchParams(query)
      const cancelToken = this.checkToken()
      await getProjectIssueList(this.rootProjectId, params, { cancelToken })
        .then(async(res) => {
          if (this.multiType) {
            this.issueList = await this.getMultiListLabels(res, parent)
            const index = this.listAllData.findIndex((item) => {
              return (item.commit_id === commitId)
            })
            this.$set(this.listAllData[index], 'issue_list', this.issueList)
          } else {
            this.issueList = await this.getListLabels(res)
          }
        })
      this.$refs.IssueSelect.isLoading = false
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
    async originalParentIssue(issueIds) {
      const parent = []
      for (const element of issueIds) {
        const res = await getIssue(element)
        parent.push(res.data)
      }
      if (parent.length <= 0) return {}
      return { name: this.$t('Issue.OriginalSetting'), options: parent }
    },
    async getMultiUnderList(parent) {
      const params = {
        selection: true,
        status_id: 'open',
        offset: 0,
        limit: 5
      }
      const cancelToken = this.checkToken()
      await getProjectIssueList(this.rootProjectId, params, { cancelToken })
        .then((res) => { this.issueList = this.getMultiListLabels(res, parent) })
      this.cancelToken = null
      return this.issueList
    },
    getMultiListLabels(res, parent) {
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
      const issueList = [parent, { name: this.$t(key), options: queryList }]
      return issueList
    },
    checkToken() {
      if (this.cancelToken) this.cancelToken.cancel()
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      return CancelToken.token
    },
    async saveIssueIds(commitId, issueIds) {
      const data = {
        commit_id: commitId,
        issue_ids: issueIds
      }
      await patchCommitRelation(data)
      await this.loadData()
    },
    changeSingleIssueIds(value) {
      this.issueIds = value.issue_ids
    },
    changeMultiIssueIds(value) {
      const index = this.listAllData.findIndex((item) => {
        return (item.commit_id === value.commitId)
      })
      this.$set(this.listAllData[index], 'issue_ids', value.issue_ids)
    },
    firstEightCommitId (commitId) {
      return commitId.slice(0, 8)
    },
    compareCommitContent (commit) {
      return commit.commit_message.trim() !== commit.commit_title
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

.el-tooltip.el-link.el-link--primary {
    color: inherit;
}

.el-tooltip.el-link.el-link--primary:hover {
    color: #66b1ff;
}

>>> .el-dialog{
  max-height: 80%;
  overflow: auto;
}
</style>
