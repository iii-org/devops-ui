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
            :disabled="btnStatus"
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
            :disabled="btnStatus"
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
                    :issue-query="issueQuery"
                    @update="getSearchIssue"
                    @change="changeIssueIds"
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

export default {
  name: 'AdminCommitLog',
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
      rootProjectId: '',
      issueQuery: null,
      issueList: [],
      cancelToken: null,
      buttonState: false
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
      return function (commitId) {
        return commitId.slice(0, 8)
      }
    },
    btnStatus() {
      return true
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
      const issue_ids = await getCommitRelation(commitId)
      return issue_ids.data.issue_ids
    },
    async getRootProject(projectId) {
      const res = await getRootProjectId(projectId)
      this.rootProjectId = res.root_project_id
    },
    async toggleIssueSingleCommitDialog(commit) {
      this.issueSingleCommitDialog.visible = !this.issueSingleCommitDialog.visible
      this.commitData = commit
      this.commitId = commit.commit_id
      this.issueIds = await this.getCommitRelationIssue(commit.commit_id)
      this.parent = await this.originalParentIssue(this.issueIds)
    },
    toggleSaveSingleCommitDialog() {
      this.saveIssueIds(this.commitId, this.issueIds)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.issueSingleCommitDialog.visible = !this.issueSingleCommitDialog.visible
    },
    async toggleIssueMultiCommitDialog() {
      this.listAllData = await this.getAllGitCommitLogData()
      this.issueMultiCommitDialog.visible = !this.issueMultiCommitDialog.visible
    },
    toggleSaveMultiCommitDialog() {
      this.listAllData.forEach((item) => {
        this.saveIssueIds(item.commit_id, item.issue_ids)
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
      const res = await getIssueGitCommitLog(this.rootProjectId, parseInt(this.$route.params.issueId))
      res.data.forEach(async(item, index) => {
        item['id'] = index
        const issueIds = await this.getCommitRelationIssue(item['commit_id'])
        item['issue_ids'] = issueIds
        const parent = await this.originalParentIssue(issueIds)
        item['parent'] = parent
        await this.getMultiUnderLine(parent)
        item['issue_list'] = this.issueList
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
        item['issue_loading'] = false
      })
      return res.data
    },
    async getSearchIssue(query) {
      const params = this.getSearchParams(query)
      const cancelToken = this.checkToken()
      const projectId = this.rootProjectId || this.selectedProjectId
      await getProjectIssueList(projectId, params, { cancelToken })
        .then((res) => { this.issueList = this.getListLabels(res) })
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
    async getMultiUnderLine(parent) {
      const params = {
        selection: true,
        status_id: 'open',
        offset: 0,
        limit: 5
      }
      const cancelToken = this.checkToken()
      const projectId = this.rootProjectId || this.selectedProjectId
      await getProjectIssueList(projectId, params, { cancelToken })
        .then(async(res) => { this.issueList = await this.getMultiListLabels(res, parent) })
      this.cancelToken = null
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
      console.log(data)
      // await patchCommitRelation(data)
    },
    changeIssueIds(value) {
      const index = this.listAllData.findIndex((item) => {
        return (item.commit_id === value.commitId)
      })
      this.$set(this.listAllData[index], 'issue_ids', value.issue_ids)
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
