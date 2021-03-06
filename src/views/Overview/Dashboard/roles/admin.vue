<template>
  <el-row class="app-container">
    <el-row type="flex" class="flex-wrap" :gutter="10">
      <el-col class="text-right">
        <span class="text-sm ml-3">*本表每小時更新一次</span>
      </el-col>
      <el-col :xs="24" :sm="24" :md="10">
        <el-card class="overview">
          <template slot="header">
            <span class="font-bold">{{ $t('Dashboard.ADMIN.Overview.NAME') }}</span>
          </template>
          <admin-overview :data="getProjectOverviewData" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="7">
        <el-card>
          <div slot="header" class="cursor-pointer" @click="$refs['projectMember'].detailDialog = true">
            <span class="font-bold">
              {{ $t('Dashboard.ADMIN.ProjectMembers.NAME') }}
              <svg-icon icon-class="link-external" />
            </span>
          </div>
          <admin-project-member ref="projectMember" :data="getProjectMembersData" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="7">
        <el-card>
          <template slot="header">
            <span class="font-bold">{{ $t('Dashboard.ADMIN.CommitLog.NAME') }} </span>
          </template>
          <admin-commit-log :data="getGitCommitLogData" />
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" class="flex-wrap" :gutter="10">
      <el-col :xs="24" :sm="24" :md="10">
        <el-card>
          <template slot="header">
            <span class="font-bold">{{ $t('Dashboard.ADMIN.IssueRank.NAME') }}</span>
          </template>
          <admin-issue-rank :data="getIssueRankData" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="14">
        <el-card>
          <div slot="header" class="cursor-pointer" @click="$refs['passingRate'].detailDialog = true">
            <span class="font-bold">{{ $t('Dashboard.ADMIN.PassingRate.NAME') }}
              <svg-icon icon-class="link-external" />
            </span>
          </div>
          <admin-passing-rate ref="passingRate" :data="getPassingRateData" />
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" class="flex-wrap" :gutter="10">
      <el-col :xs="24" :sm="24" :md="24">
        <el-card>
          <div slot="header" class="cursor-pointer" @click="$refs['projectList'].detailDialog = true">
            <div class="flex justify-between items-center">
              <span class="font-bold">
                {{ $t('Dashboard.ADMIN.ProjectList.NAME') }}
                <svg-icon icon-class="link-external" />
              </span>
              <span class="text-right">{{ $t('Dashboard.ADMIN.sync_date', [lastUpdate]) }} </span>
            </div>
          </div>
          <admin-project-list ref="projectList" :data="getProjectListData" @update="getLastUpdate" />
        </el-card>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import {
  getGitCommitLog,
  getIssueRank,
  getPassingRate,
  getProjectList,
  getProjectMembers,
  getProjectOverview
} from '@/api/dashboard'
import {
  AdminProjectList,
  AdminProjectMember,
  AdminIssueRank,
  AdminPassingRate,
  AdminOverview,
  AdminCommitLog
} from '../components'
import { UTCtoLocalTime } from '@/filters'

const overview = {
  projects: { class: 'primary', database: '' },
  overdue: { class: 'danger', database: 'overdue' },
  not_started: { class: 'info', database: 'not_started' }
}
const commitLimit = 10
const refreshCommitLog = 300000 // ms
export default {
  name: 'DashboardAdmin',
  components: {
    AdminCommitLog,
    AdminOverview,
    AdminIssueRank,
    AdminProjectMember,
    AdminProjectList,
    AdminPassingRate
  },
  data() {
    return {
      lastUpdate: '',
      overview: [],
      gitCommitLog: [],
      init: true,
      requestGitLabLastTime: null
    }
  },
  watch: {
    gitCommitLog: {
      deep: true,
      async handler() {
        if (!this.requestGitLabLastTime) {
          this.requestGitLabLastTime = new Date().valueOf()
        }
        await this.sleep(refreshCommitLog)
        const nowTime = new Date().valueOf()
        const gap = nowTime - this.requestGitLabLastTime
        if (gap >= refreshCommitLog) {
          this.gitCommitLog = await this.getGitCommitLogData()
        }
      }
    }
  },
  mounted() {
    this.initDashboard()
  },
  methods: {
    async initDashboard() {
      this.gitCommitLog = await this.getGitCommitLogData()
    },
    async getProjectOverviewData() {
      const res = await getProjectOverview()
      const result = []
      res.data.forEach(item => {
        result.push({
          ...item,
          class: overview[item['project_status']]['class'],
          database: overview[item['project_status']]['database']
        })
      })
      return await Promise.resolve(result)
    },
    async getProjectMembersData() {
      const res = await getProjectMembers()
      return await Promise.resolve(res.data)
    },
    async getGitCommitLogData() {
      const params = { show_commit_rows: commitLimit }
      const res = await getGitCommitLog(params)
      res.data.forEach((item, index) => {
        item['id'] = index
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
      })
      return await Promise.resolve(res.data)
    },
    async getIssueRankData() {
      const res = await getIssueRank()
      return await Promise.resolve(res.data)
    },
    async getPassingRateData() {
      const res = await getPassingRate()
      const result = res.data.map(item => ({
        name: item['project_name'],
        value: [item['total'], item['passing_rate'] * 100, item['count']]
      }))
      return await Promise.resolve(result)
    },
    async getProjectListData() {
      const res = await getProjectList()
      return await Promise.resolve(res.data)
    },
    getLastUpdate(value) {
      this.lastUpdate = value
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
@import '~element-ui/lib/theme-chalk/display.css';

.overview {
  height: 90%;
  >>> .el-row {
    height: 100%;

    .el-col {
      margin-bottom: 0;
    }
  }
}

>>> .el-dialog {
  width: 80%;
  &__header {
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }
}

>>> .el-row,
.el-row .el-col {
  margin-bottom: 1em;
}

>>> .el-card {
  height: 100%;
  .el-card__body {
    height: 85%;
  }
}

>>> .items-center {
  text-align: center;
}

.chart {
  height: 100%;
  min-height: 250px;
}

>>> .el-table {
  .danger-row {
    background: $danger-4;
  }
}
</style>
