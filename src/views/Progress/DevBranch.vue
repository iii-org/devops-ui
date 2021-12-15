<template>
  <el-row class="app-container" style="overflow: hidden;">
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
      fit
      height="100%"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-timeline>
            <el-timeline-item
              v-for="commit in props.row.gitCommitLog"
              :key="commit.id"
              :hide-timestamp="true"
            >
              <el-card class="timeline-item-card w-3/5">
                <h4>
                  <div>
                    <span style="color: #409eff" class="cursor-pointer" :underline="false">
                      <svg-icon icon-class="ion-git-commit-outline" />
                      {{ commit.commit_id }}
                    </span>
                    <span>@ {{ commit.author_name }} -</span>
                    <span
                      v-for="(item, index) in commit.issue_id"
                      :key="index"
                      style="color: #67C23A"
                      class="cursor-pointer"
                      @click="toIssueDetail(item)"
                    >
                      {{ item }}&nbsp;
                    </span>
                    <template v-if="commit.issue_id.length > 0">{{ commit.issue_title }}</template>
                    <template v-else>{{ commit.commit_title }}</template>
                  </div>
                  <div>{{ relativeTime(commit.commit_time) }}</div>
                </h4>
                <ul
                  v-for="item in commit.issues"
                  :key="item.id"
                  class="cursor-pointer"
                  @click="toIssueDetail(item.id)"
                >
                  <li class="mt-2">
                    <span>-&nbsp;</span>
                    <span style="color: #67C23A">#{{ item.id }}</span>
                    <Status
                      v-if="item.status.name"
                      class="ml-2"
                      size="mini"
                      :name="$t(`Issue.${item.status.name}`)"
                      :type="item.status.name"
                    />
                    <el-tag v-if="item.assigned_to" class="ml-1" type="info" size="mini">
                      {{ item.assigned_to.name }}
                    </el-tag>
                    <span class="ml-2">
                      {{ item.name }}
                    </span>
                  </li>
                </ul>
              </el-card>
            </el-timeline-item>
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
  </el-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { UTCtoLocalTime } from '@/filters'
import { getGitCommitLog } from '@/api/dashboard'
import { getIssue } from '@/api/issue'
import { Status } from '@/components/Issue'

const commitLimit = 10
const reg_pound_sign = RegExp(/#/)
const reg_english_alphabets = RegExp(/[a-zA-Z]/)

export default {
  name: 'ProgressDevBranch',
  components: { ElTableColumnTime, Status },
  mixins: [MixinElTableWithAProject],
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
      this.gitCommitLog = await this.getGitCommitLogData()
      if (this.gitCommitLog.length === 0) return this.branchList
      const master_index = this.branchList.findIndex(item => item.name === 'master')
      this.branchList[master_index].gitCommitLog = this.gitCommitLog
      return this.branchList
    },
    async getGitCommitLogData() {
      const params = { show_commit_rows: commitLimit, git_repository_id: this.selectedRepositoryId }
      const res = await getGitCommitLog(params)
      res.data.forEach(async (item, index) => {
        item['issue_id'] = this.getIssueId(item['commit_title'])
        item['issue_title'] = this.getIssueTitle(item['commit_title'])
        item['issues'] = await this.getIssues(item['issue_id'])
        item['id'] = index
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
      })
      return res.data
    },
    getIssueId(title) {
      const splitArray = title.split(' ')
      const issue_id = []
      splitArray.forEach(item => {
        if (item.match(reg_pound_sign) && !item.match(reg_english_alphabets)) {
          issue_id.push(item)
        }
      })
      return issue_id
    },
    getIssueTitle(title) {
      const splitArray = title.split(' ')
      return splitArray.filter(item => !item.match(reg_pound_sign)).join(' ')
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
      const issueId = tag.toString().match(reg_pound_sign) ? tag.split('#')[1] : tag
      this.$router.push({ name: 'issue-detail', params: { issueId }})
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
