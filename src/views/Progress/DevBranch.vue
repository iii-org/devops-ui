<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-input
        v-model="keyword"
        :placeholder="$t('ProcessDevBranch.SearchBranch')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </ProjectListSelector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      row-key="id"
      fit
      @expand-change="fetchGitCommitLog"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-skeleton v-if="props.row.timelineLoading" v-loading="props.row.timelineLoading" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="commit in props.row.gitCommitLog"
              :key="commit.id"
              class="pb-0 !important"
              :hide-timestamp="true"
            >
              <el-collapse
                class="w-3/5"
                :class="commit.issues ? 'hasArrow' : 'noArrow'"
              >
                <el-collapse-item :name="commit.id">
                  <template slot="title">
                    <div class="flex justify-between text-base cursor-pointer" style="width: 95%">
                      <div>
                        <span class="text-primary">
                          <svg-icon icon-class="ion-git-commit-outline" />
                          {{ commit.commit_id }}
                        </span>
                        <span>@ {{ commit.author_name }} -</span>
                        <span
                          v-for="(item, index) in commit.issue_id"
                          :key="index"
                          class="text-success"
                        >
                          {{ item }}&nbsp;
                        </span>
                        <span v-if="commit.issue_id.length > 0">{{ commit.issue_title }}</span>
                        <span v-else>{{ commit.commit_title }}</span>
                      </div>
                      <div>{{ relativeTime(commit.commit_time) }}</div>
                    </div>
                  </template>
                  <section>
                    <ul
                      v-for="item in commit.issues"
                      :key="item.id"
                      @click="toIssueDetail(item.id)"
                    >
                      <li class="cursor-pointer">
                        <span class="text-success">#{{ item.id }}</span>
                        <Status
                          v-if="item.status.name"
                          class="ml-1"
                          size="mini"
                          :name="$t(`Issue.${item.status.name}`)"
                          :type="item.status.name"
                        />
                        <el-tag
                          v-if="item.assigned_to"
                          class="ml-1"
                          type="info"
                          size="mini"
                          effect="dark"
                        >
                          {{ item.assigned_to.name }}
                        </el-tag>
                        <span class="ml-1">{{ item.name }}</span>
                      </li>
                    </ul>
                  </section>
                </el-collapse-item>
              </el-collapse>
            </el-timeline-item>
            <div class="flex justify-center w-3/5">
              <el-button
                type="primary"
                round
                class="el-icon-bottom"
                @click="toGitlab"
              >
                {{ $t('general.SeeMore') }}
              </el-button>
            </div>
          </el-timeline>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('ProcessDevBranch.Branch')"
        width="200"
        prop="name"
      />
      <el-table-column
        align="center"
        :label="$t('general.Description')"
        min-width="160"
        prop="last_commit_message"
      />
      <el-table-column
        align="center"
        :label="$t('ProcessDevBranch.Commit')"
        width="120"
        prop="short_id"
      >
        <template slot-scope="scope">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.commit_url"
          >
            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ scope.row.short_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-time prop="last_commit_time" width="170" :label="$t('general.LastUpdateTime')" />
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import { Table, BasicData, Pagination, SearchBar } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { UTCtoLocalTime } from '@/filters'
import { getGitCommitLog } from '@/api/dashboard'
import { getIssue } from '@/api/issue'
import { Status } from '@/components/Issue'

const commitLimit = 10
const regExp = {
  pound_sign: RegExp(/#/),
  english_alphabets: RegExp(/[a-zA-Z]/),
  chinese_words: RegExp(/[\u4E00-\u9FFF]/)
}

export default {
  name: 'ProgressDevBranch',
  components: { ProjectListSelector, ElTableColumnTime, Status },
  mixins: [Table, BasicData, Pagination, SearchBar],
  data() {
    return {
      gitCommitLog: []
    }
  },
  computed: {
    ...mapGetters(['branchesByProject']),
    UTCtoLocalTime() {
      return function (value) {
        return UTCtoLocalTime(value)
      }
    },
    relativeTime() {
      return function (dateTime) {
        return dateTime
          ? this.$dayjs(dateTime)
            .utc()
            .local()
            .fromNow()
          : '-'
      }
    },
    getOpenedItem() {
      return function (commit) {
        return commit.map(item => {
          if (item.issues) return item.id
        })
      }
    },
    getIssueId() {
      return function (title) {
        const splitArray = title.split(' ')
        const issue_id = []
        splitArray.forEach(item => {
          if (item.match(regExp.pound_sign) &&
            !item.match(regExp.english_alphabets) &&
            !item.match(regExp.chinese_words)) {
            issue_id.push(item)
          }
        })
        return issue_id
      }
    },
    getIssueTitle() {
      return function (title) {
        const splitArray = title.split(' ')
        return splitArray.filter(item => !item.match(regExp.pound_sign)).join(' ')
      }
    },
    gitlabUrl() {
      const splitUrl = this.selectedProject.git_url.split('/')
      splitUrl.pop()
      splitUrl.push(this.selectedProject.name)
      splitUrl.push('activity')
      return splitUrl.join('/')
    }
  },
  watch: {
    branchesByProject(ary) {
      this.branchList = ary
    }
  },
  methods: {
    ...mapActions('branches', ['getBranchesByProject']),
    async fetchData() {
      await this.getBranchesByProject(this.selectedRepositoryId)
      return this.branchList
    },
    async fetchGitCommitLog(row) {
      if (row.gitCommitLog) return
      this.$set(row, 'timelineLoading', true)
      this.gitCommitLog = await this.getGitCommitLogData(row.name)
      this.listData.forEach((item) => {
        if (item.id === row.id) item.gitCommitLog = this.gitCommitLog
      })
      this.$set(row, 'timelineLoading', false)
    },
    async getGitCommitLogData(branch_name) {
      const params = {
        show_commit_rows: commitLimit,
        git_repository_id: this.selectedRepositoryId,
        branch_name
      }
      const res = await getGitCommitLog(params)
      await res.data.forEach(async (item, index) => {
        item['id'] = index
        item['issue_id'] = this.getIssueId(item['commit_title'])
        item['issue_title'] = this.getIssueTitle(item['commit_title'])
        item['issues'] = await this.getIssues(item['issue_id'])
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
      })
      return res.data
    },
    async getIssues(ids) {
      if (!ids[0]) return
      const issueData = []
      await ids.forEach(async id => {
        const issueId = id.split('#')[1]
        const res = await getIssue(issueId)
        issueData.push(res.data)
      })
      return issueData
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    toIssueDetail(tag) {
      const issueId = tag.toString().match(regExp.pound_sign) ? tag.split('#')[1] : tag
      this.$router.push({ name: 'issue-detail', params: { issueId }})
    },
    toGitlab() {
      window.open(this.gitlabUrl, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
.noArrow {
  >>> .el-collapse-item__arrow {
    display: none;
  }
}
.cursor-pointer:hover {
  @apply bg-gray-100 text-primary font-bold;
}
</style>
