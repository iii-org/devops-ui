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
                <a v-if="commit.web_url" :href="commit.web_url" class="el-link el-link--primary is-underline" target="_blank">
                  <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }} :
                </a>
                <a v-else style="cursor: default;">
                  <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }} :
                </a>
              </template>
              {{ commit.author_name }} @ {{ commit.pj_name }}
              <el-tooltip effect="dark" :content="$t('Issue.EditIssueHook')" placement="bottom">
                <a
                  v-if="type==='issueDetail'"
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
      <template v-if="type==='issueDetail'">
        <el-dialog
          :visible.sync="issueSingleCommitDialog.visible"
          width="60%"
          top="50px"
          append-to-body
          destroy-on-close
        >
          <div slot="title">
            {{ $t('Issue.CommitIssueHookSetting') }}
            <el-button
              type="primary"
              class="float-right"
              style="margin-right: 2em;"
              size="small"
              @click="toggleSaveSingleCommitDialog"
            >
              {{ $t('general.Save') }}
            </el-button>
          </div>
          <a v-if="commitData.web_url" :href="commitData.web_url" class="el-link el-link--primary is-underline" target="_blank">
            <em class="ri-git-commit-line" />{{ firstEightCommitId(commitId) }} :
          </a>
          <a v-else style="cursor: default;">
            <em class="ri-git-commit-line" />{{ firstEightCommitId(commitId) }} :
          </a>
          {{ commitData.author_name }} @ {{ commitData.commit_title }}
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
        <el-dialog
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
                      :commit="commit"
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
import {
  getIssue,
  getIssueGitCommitLog
} from '@/api/issue'
import { UTCtoLocalTime } from '@/filters'
import IssueSelect from '@/components/Issue/IssueSelect'
import Tracker from '@/components/Issue/Tracker'
import NoData from './widget/NoData'

export default {
  name: 'AdminCommitLog',
  components: { IssueSelect, Tracker, NoData },
  props: {
    issueId: {
      type: Number,
      default: null
    },
    issueName: {
      type: String,
      default: ''
    },
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
    this.loadData()
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.data()
      this.listLoading = false
    },
    async getCommitRelationProject(commitId) {
      const issue_ids = await getCommitRelation(commitId)
      this.issueIds = issue_ids.data.issue_ids
    },
    async getRootProject(projectId) {
      const res = await getRootProjectId(projectId)
      this.rootProjectId = res.root_project_id
    },
    async toggleIssueSingleCommitDialog(commit) {
      this.listLoading = true
      this.commitData = commit
      this.commitId = commit.commit_id
      await this.getCommitRelationProject(this.commitId)
      await this.getRootProject(this.selectedProjectId)
      this.parent = await this.originalParentIssue()
      this.issueSingleCommitDialog.visible = !this.issueSingleCommitDialog.visible
      this.listLoading = false
    },
    async toggleSaveSingleCommitDialog() {
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
      this.issueSingleCommitDialog.visible = !this.issueSingleCommitDialog.visible
    },
    async toggleIssueMultiCommitDialog() {
      this.listAllData = await this.getAllGitCommitLogData()
      this.issueMultiCommitDialog.visible = !this.issueMultiCommitDialog.visible
    },
    toggleSaveMultiCommitDialog() {
      this.$refs.IssueSelect.forEach((item) => {
        item.saveIssueLink()
      })
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.issueMultiCommitDialog.visible = !this.issueMultiCommitDialog.visible
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
    async getAllGitCommitLogData() {
      const res = await getIssueGitCommitLog(this.selectedProjectId, parseInt(this.$route.params.issueId))
      res.data.forEach((item, index) => {
        item['id'] = index
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
      })
      return res.data
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
