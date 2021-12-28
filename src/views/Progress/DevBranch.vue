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
      ref="table"
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      row-key="name"
      fit
      @expand-change="onExpandChange"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-skeleton v-if="props.row.timelineLoading" v-loading="props.row.timelineLoading" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="(commit, commit_index) in props.row.gitCommitLog"
              :key="commit.id"
              class="pb-0 !important"
              :hide-timestamp="true"
            >
              <el-collapse
                v-model="collapseActiveValue"
                class="w-75"
                :class="commit.issues ? 'hasArrow' : 'noArrow'"
              >
                <el-collapse-item :name="commit.id">
                  <template slot="title">
                    <div class="flex justify-between text-base cursor-pointer" style="width: 95%">
                      <div>
                        <span
                          class="text-primary hover-underline"
                          @click.stop="toGitlab(gitlabCommitUrl(props.row, commit_index))"
                        >
                          <svg-icon icon-class="ion-git-commit-outline" />
                          {{ commit.commit_id }}
                        </span>
                        <span>@ {{ commit.author_name }} -</span>
                        <span
                          v-for="(id, id_index) in commit.issue_id"
                          :key="id_index"
                          class="text-success hover-underline"
                          @click.stop="toIssueDetail(id)"
                        >
                          {{ id }}
                        </span>
                        <span>&nbsp;{{ commit.commit_title }}</span>
                      </div>
                      <div>{{ relativeTime(commit.commit_time) }}</div>
                    </div>
                  </template>
                  <section>
                    <ul
                      v-for="issue in commit.issues"
                      :key="issue.id"
                      @click="toIssueDetail(issue.id)"
                    >
                      <li v-show="issue" class="cursor-pointer">
                        <span class="text-success">#{{ issue.id }}</span>
                        <Status
                          v-if="issue.status.name"
                          class="ml-1"
                          size="mini"
                          :name="$t(`Issue.${issue.status.name}`)"
                          :type="issue.status.name"
                        />
                        <el-tag
                          v-if="issue.assigned_to"
                          class="ml-1"
                          type="info"
                          size="mini"
                          effect="dark"
                        >
                          {{ issue.assigned_to.name }}
                        </el-tag>
                        <span class="ml-1">{{ issue.name }}</span>
                      </li>
                    </ul>
                  </section>
                </el-collapse-item>
              </el-collapse>
            </el-timeline-item>
            <div class="flex justify-center w-75">
              <el-button
                type="primary"
                round
                class="el-icon-bottom"
                @click="toGitlab(gitlabActivityUrl)"
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
  pound_sign: new RegExp(/#/),
  english_alphabets: new RegExp(/[a-zA-Z]/),
  chinese_words: new RegExp(/[\u4E00-\u9FFF]/),
  numbers: new RegExp(/[^\d.]/g)
}

export default {
  name: 'ProgressDevBranch',
  components: { ProjectListSelector, ElTableColumnTime, Status },
  mixins: [Table, BasicData, Pagination, SearchBar],
  data() {
    return {
      gitCommitLog: [],
      collapseActiveValue: [],
      expandedRow: []
    }
  },
  computed: {
    ...mapGetters(['branchesByProject']),
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
    getIssueId() {
      return function (title) {
        const splitArray = title.split(' ')
        const issue_id = []
        splitArray.forEach((item) => {
          if (this.checkRegExp(item)) {
            const id = item.replace(regExp.numbers, '')
            if (id) issue_id.push(`#${id}`)
          }
        })
        return issue_id
      }
    },
    checkRegExp() {
      return function (item) {
        return item.match(regExp.pound_sign) &&
          !item.match(regExp.english_alphabets) &&
          !item.match(regExp.chinese_words)
      }
    },
    // getIssueTitle() {
    //   return function (title) {
    //     const splitArray = title.split(' ')
    //     return splitArray.filter((item) => !item.match(regExp.pound_sign)).join(' ')
    //   }
    // },
    gitlabActivityUrl() {
      const splitUrl = this.selectedProject.git_url.split('/')
      splitUrl.pop()
      splitUrl.push(this.selectedProject.name)
      splitUrl.push('activity')
      return splitUrl.join('/')
    },
    gitlabCommitUrl() {
      return function (row, index) {
        const splitUrl = row.commit_url.split('/')
        splitUrl.pop()
        splitUrl.push(row.gitCommitLog[index].commit_id)
        return splitUrl.join('/')
      }
    },
    tableExpand() {
      return {
        expandedRow: this.expandedRow,
        collapseActiveValue: this.collapseActiveValue
      }
    }
  },
  watch: {
    selectedProject: {
      handler() {
        this.initTableExpand()
      },
      deep: true
    },
    branchesByProject(ary) {
      this.branchList = ary
    },
    listLoading(val) {
      if (!val) this.getStoredData()
    },
    tableExpand: {
      handler(val) {
        this.setTableExpand(val)
      },
      deep: true
    }
  },
  methods: {
    ...mapActions('branches', ['getBranchesByProject']),
    ...mapActions('projects', ['getTableExpand', 'setTableExpand']),
    async getStoredData() {
      const storedData = await this.getTableExpand()
      const { expandedRow, collapseActiveValue } = storedData
      const rowIndex = this.branchList.findIndex((list) => list.name === expandedRow[0])
      const row = this.branchList[rowIndex]
      if (rowIndex === undefined || row === undefined) return
      this.onExpandChange(row, [row])
      this.collapseActiveValue = collapseActiveValue
    },
    async fetchData() {
      await this.getBranchesByProject(this.selectedRepositoryId)
      return this.branchList
    },
    async onExpandChange(row, expandedRows) {
      this.handleExpanded(row, expandedRows)
      if (row.gitCommitLog || row.timelineLoading) return
      await this.fetchGitCommitLog(row)
    },
    handleExpanded(row, expandedRows) {
      this.initTableExpand()
      this.expandedRow.push(row.name)
      expandedRows.forEach((expandedRow) => {
        this.$refs.table.toggleRowExpansion(expandedRow, row.name === expandedRow.name)
      })
    },
    initTableExpand() {
      this.expandedRow = []
      this.collapseActiveValue = []
    },
    async fetchGitCommitLog(row) {
      this.$set(row, 'timelineLoading', true)
      this.gitCommitLog = await this.getGitCommitLog(row.name)
      this.listData.forEach((item) => {
        if (item.name === row.name) item.gitCommitLog = this.gitCommitLog
      })
      this.$set(row, 'timelineLoading', false)
    },
    async getGitCommitLog(branch_name) {
      const params = {
        show_commit_rows: commitLimit,
        git_repository_id: this.selectedRepositoryId,
        branch_name
      }
      const res = await getGitCommitLog(params)
      await res.data.forEach(async (item, index) => {
        item['id'] = index
        item['issue_id'] = this.getIssueId(item['commit_title'])
        // item['issue_title'] = this.getIssueTitle(item['commit_title'])
        item['issues'] = await this.getIssue(item['issue_id'])
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
      })
      return res.data
    },
    async getIssue(ids) {
      if (!ids[0]) return
      const issueData = []
      await ids.forEach(async (id) => {
        if (id === '#') return
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
    toGitlab(url) {
      window.open(url, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
.w-75 {
  width: 75%;
}
.noArrow {
  >>> .el-collapse-item__arrow {
    display: none;
  }
}
.cursor-pointer:hover {
  @apply bg-gray-100 text-primary font-bold;
}
.hover-underline:hover {
  @apply underline font-bold;
}
</style>
