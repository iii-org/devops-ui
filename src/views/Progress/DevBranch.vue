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
              v-for="commit in props.row.gitCommitLog"
              :key="commit.id"
              class="pb-0 !important"
              :hide-timestamp="true"
            >
              <el-collapse
                v-model="collapseExpandedRow"
                class="w-75"
                :class="isAbled(commit.issues) ? 'hasArrow' : 'noArrow'"
              >
                <el-collapse-item :name="commit.id">
                  <template slot="title">
                    <div
                      :class="isAbled(commit.issues) ? 'cursor-pointer' : 'initial'"
                      class="flex justify-between text-base"
                      style="width: 95%"
                    >
                      <div class="ellipsis">
                        <span
                          class="linkTextColor hover-underline cursor-pointer"
                          @click.stop="toGitlab(commit.gitlab_url)"
                        >
                          <svg-icon icon-class="ion-git-commit-outline" />
                          {{ commit.commit_short_id }}
                        </span>
                        <span>@ {{ commit.author_name }} -</span>
                        <span
                          v-for="id in commit.issue_id"
                          :key="id"
                          :class="commit.issue_hook[id.split('#')[1]] ? 'text-success hover-underline' : 'text-info'"
                          @click.stop="toIssueDetail(id)"
                        >
                          {{ id }}
                        </span>
                        <el-tooltip
                          class="item"
                          placement="bottom"
                          effect="light"
                          :content="commit.commit_title"
                        >
                          <span>&nbsp;{{ commit.commit_title }}</span>
                        </el-tooltip>
                      </div>
                      <div>
                        <el-tooltip
                          placement="bottom"
                          effect="light"
                          :content="getLocalTime(commit.commit_time)"
                        >
                          <span>{{ getRelativeTime(commit.commit_time) }}</span>
                        </el-tooltip>
                      </div>
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
                round
                class="el-icon-bottom buttonPrimaryReverse"
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
            class="linkTextColor"
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
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { getLocalTime, getRelativeTime } from '@/utils/handleTime'
import { getHookByBranch } from '@/api/dashboard'
import { getIssue } from '@/api/issue'
import { Status } from '@/components/Issue'

const commitLimit = 10

export default {
  name: 'ProgressDevBranch',
  components: { ProjectListSelector, ElTableColumnTime, Status },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      branchList: [],
      gitCommitLog: [],
      collapseExpandedRow: [],
      expandedRow: []
    }
  },
  computed: {
    ...mapGetters(['branchesByProject']),
    getRelativeTime() {
      return (time) => getRelativeTime(time)
    },
    getLocalTime() {
      return (time) => {
        return getLocalTime(time)
      }
    },
    isAbled() {
      return (commitIssues) => commitIssues && commitIssues.length > 0
    },
    getIssueId() {
      return (branch) => {
        let issue_id = []
        if (branch) {
          issue_id = Object.keys(branch).map((id) => `#${id}`)
        }
        return issue_id
      }
    },
    gitlabActivityUrl() {
      const splitUrl = this.selectedProject.git_url.split('/')
      splitUrl.pop()
      splitUrl.push(this.selectedProject.name)
      splitUrl.push('activity')
      return splitUrl.join('/')
    },
    tableExpand() {
      return {
        expandedRow: this.expandedRow,
        collapseExpandedRow: this.collapseExpandedRow
      }
    }
  },
  watch: {
    // selectedProject: {
    //   handler() {
    //     this.initTableExpand()
    //   },
    //   deep: true
    // },
    branchesByProject: {
      handler(ary) {
        this.branchList = JSON.parse(JSON.stringify(ary))
        this.getStoredData()
      },
      deep: true
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
      const { expandedRow, collapseExpandedRow } = storedData
      if (expandedRow === undefined && collapseExpandedRow === undefined) return
      const rowIndex = this.branchList.findIndex((list) => list.name === expandedRow[0])
      const row = this.branchList[rowIndex]
      if (rowIndex === undefined || row === undefined) return
      this.onExpandChange(row, [row])
      this.collapseExpandedRow = collapseExpandedRow
    },
    async fetchData() {
      await this.getBranchesByProject(this.selectedRepositoryId)
      return this.branchList.sort((a, b) => new Date(b.last_commit_time) - new Date(a.last_commit_time))
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
      this.collapseExpandedRow = []
    },
    async fetchGitCommitLog(row) {
      this.$set(row, 'timelineLoading', true)
      this.gitCommitLog = await this.getHookByBranch(row.name)
      this.listData.forEach((item) => {
        if (item.name === row.name) item.gitCommitLog = this.gitCommitLog
      })
      this.$set(row, 'timelineLoading', false)
    },
    async getHookByBranch(branch_name) {
      const params = {
        limit: commitLimit,
        branch_name
      }
      const res = await getHookByBranch(this.selectedProjectId, params)
      await res.data.forEach(async (item, index) => {
        item['id'] = index
        item['issue_id'] = this.getIssueId(item['issue_hook'])
        item['issues'] = await this.getIssue(item['issue_id'], item['issue_hook'])
        item['commit_time'] = getLocalTime(item['commit_time'])
      })
      return res.data
    },
    async getIssue(ids, hooks) {
      if (!ids[0]) return
      const issueData = []
      await ids.forEach(async (id) => {
        const issueId = id.split('#')[1]
        if (!hooks[issueId]) return
        const res = await getIssue(issueId)
        issueData.push(res.data)
      })
      return issueData
    },
    toIssueDetail(tag) {
      const pound = new RegExp(/#/)
      const issueId = tag.toString().match(pound) ? tag.split('#')[1] : tag
      this.$router.push({ name: 'IssueDetail', params: { issueId }})
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
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 75%;
    .text-info {
      pointer-events: none;
    }
  }
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
