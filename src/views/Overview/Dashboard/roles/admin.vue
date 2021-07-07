<template>
  <el-row class="app-container">
    <el-row type="flex" :gutter="10" class="flex-wrap">
      <el-col class="text-right update">
        *本表每小時更新一次
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
          <div slot="header" class="pointer" @click="$refs['projectMember'].detailDialog=true">
            <span class="font-bold">{{ $t('Dashboard.ADMIN.ProjectMembers.NAME') }}
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" width="1em" height="1em"
                   style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
                   preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"
              ><path
                d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"
                fill="#626262"
              /></svg>
            </span>
          </div>
          <admin-project-member ref="projectMember" :data="getProjectMembersData" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="7">
        <el-card>
          <template slot="header">
            <span class="font-bold">{{ $t('Dashboard.ADMIN.CommitLog.NAME') }}
            </span>
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
          <div slot="header" class="pointer" @click="$refs['passingRate'].detailDialog=true">
            <span class="font-bold">{{ $t('Dashboard.ADMIN.PassingRate.NAME') }}
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" width="1em" height="1em"
                   style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
                   preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"
              ><path
                d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"
                fill="#626262"
              /></svg>
            </span>
          </div>
          <admin-passing-rate ref="passingRate" :data="getPassingRateData" />
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" class="flex-wrap" :gutter="10">
      <el-col :xs="24" :sm="24" :md="24">
        <el-card>
          <div slot="header" class="pointer" @click="$refs['projectList'].detailDialog=true">
            <el-row type="flex" align="center" class="no-margin">
              <el-col :span="12" class="font-bold">{{ $t('Dashboard.ADMIN.ProjectList.NAME') }}
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" width="1em" height="1em"
                     style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
                     preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"
                >
                  <path
                    d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"
                    fill="#626262"
                  />
                </svg>
              </el-col>
              <el-col :span="12" class="text-right">{{ $t('Dashboard.ADMIN.sync_date', [lastUpdate]) }}
              </el-col>
            </el-row>
          </div>
          <admin-project-list ref="projectList" :data="getProjectListData" @update="getlastUpdate" />
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
import { UTCtoLocalTime } from '@/filters'
import AdminProjectList from '../components/AdminProjectList'
import AdminProjectMember from '../components/AdminProjectMember'
import AdminIssueRank from '../components/AdminIssueRank'
import AdminPassingRate from '../components/AdminPassingRate'
import AdminOverview from '../components/AdminOverview'
import AdminCommitLog from '../components/AdminCommitLog'

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
          this.requestGitLabLastTime = (new Date()).valueOf()
        }
        await this.sleep(refreshCommitLog)
        const nowTime = (new Date()).valueOf()
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
    getProjectOverviewData() {
      return getProjectOverview()
        .then((res) => {
          const result = []
          res.data.forEach((item) => {
            result.push({
              ...item,
              class: overview[item['project_status']]['class'],
              database: overview[item['project_status']]['database']
            })
          })
          return Promise.resolve(result)
        })
    },
    getProjectMembersData() {
      return getProjectMembers()
        .then((res) => {
          // const result = res.data.map((item) => ({ id: item['project_id'], name: item['project_name'], value: item['member_count'] }))
          return Promise.resolve(res.data)
        })
    },
    getGitCommitLogData() {
      const params = {
        show_commit_rows: commitLimit
      }
      return getGitCommitLog(params)
        .then((res) => {
          res.data.forEach((item, index) => {
            item['id'] = index
            item['commit_time'] = UTCtoLocalTime(item['commit_time'])
          })
          return Promise.resolve(res.data)
        })
    },
    getIssueRankData() {
      return getIssueRank()
        .then((res) => {
          return Promise.resolve(res.data)
        })
    },
    getPassingRateData() {
      return getPassingRate()
        .then((res) => {
          const result = res.data.map((item) => ({
            name: item['project_name'],
            value: [item['total'], item['passing_rate'] * 100, item['count']]
          }))
          return Promise.resolve(result)
        })
    },
    getProjectListData() {
      return getProjectList()
        .then((res) => {
          return Promise.resolve(res.data)
        })
    },
    getlastUpdate(value) {
      this.lastUpdate = value
    },
    sleep(ms) {
      return new Promise((resolve) => (setTimeout(resolve, ms)))
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
@import '~element-ui/lib/theme-chalk/display.css';

.update{
  font-size: 0.875em;
}

.overview {
  height: 90%;

  > > > .el-row {
    height: 100%;

    .el-col {
      margin-bottom: 0;
    }
  }

}

> > > .el-dialog {
  width: 80%;

  &__header {
    padding-bottom: 20px;
    border-bottom: 1px solid #EBEEF5;
  }
}

> > > .el-row, .el-row .el-col {
  margin-bottom: 1em;
}

> > > .el-card {
  height: 100%;

  .el-card__body {
    height: 85%;
  }
}

> > > .items-center {
  text-align: center;
}

.chart {
  height: 100%;
  min-height: 250px;
}

> > > .el-table {
  .danger-row {
    background: $danger-4;
  }
}

.no-margin {
  margin: 0;
}

.pointer {
  cursor: pointer;
}

</style>
