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
    <NoData v-else />
  </el-col>
</template>

<script>
import { mapGetters } from 'vuex'
import { getRootProjectId } from '@/api/projects'
import { getIssueGitCommitLog } from '@/api/issue'
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
    type: {
      type: String,
      default: 'dashboard'
    },
    getData: {
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
      return function (commitId) {
        return commitId.slice(0, 8)
      }
    }
  },
  watch: {
    issueId(value) {
      if (value) this.loadData()
    }
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.getData()
      this.listLoading = false
    },
    async getRootProject(projectId) {
      const res = await getRootProjectId(projectId)
      this.rootProjectId = res.root_project_id
    },
    async toggleIssueSingleCommitDialog(commit) {
      this.listLoading = true
      this.commitData = commit
      this.issueSingleCommitDialog.visible = !this.issueSingleCommitDialog.visible
      this.listLoading = false
    },
    toggleSaveSingleCommitDialog() {
      this.$refs.IssueSelect.saveIssueLink()
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
    async getAllGitCommitLogData() {
      await this.getRootProject(this.selectedProjectId)
      const res = await getIssueGitCommitLog(this.rootProjectId, parseInt(this.$route.params.issueId))
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
