<template>
  <div class="app-container">
    <el-row v-show="isLoading||projectCount>0">
      <el-col>
        <el-row
          type="flex"
          class="flex-wrap"
          :gutter="10"
        >
          <el-col class="text-right">
            <span class="text-sm ml-3">
              *本表每小時更新一次 {{ $t('Dashboard.ADMIN.sync_date', [UTCtoLocalTime(status.sync_date)]) }}</span>
            <el-button
              size="small"
              icon="el-icon-refresh"
              class="buttonPrimaryReverse"
              :disabled="status.is_lock"
              @click="getSyncRedmine"
            >
              {{ $t('Dashboard.ADMIN.UpdateNow') }}
            </el-button>
          </el-col>
          <el-col v-if="status.is_lock">
            <el-alert
              type="warning"
              class="mb-4 loading"
              :closable="false"
            >
              <h2 slot="title">
                <em class="el-icon-loading" /> {{ $t('Dashboard.ADMIN.syncing') }}
              </h2>
            </el-alert>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="(userRole==='QA')? 12: 10"
          >
            <el-card class="overview">
              <template slot="header">
                <span class="font-bold">{{ $t('Dashboard.ADMIN.Overview.NAME') }}</span>
              </template>
              <AdminOverview
                :data="getProjectOverviewData"
                @total-count="getTotalCount"
                @loading="getLoadingStatus"
              />
            </el-card>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="(userRole==='QA')? 12: 7"
          >
            <el-card>
              <div
                slot="header"
                class="cursor-pointer"
                @click="onChangeDialogVisible({key: 'projectMember', value: true})"
              >
                <span class="font-bold">
                  {{ $t('Dashboard.ADMIN.ProjectMembers.NAME') }}
                  <em class="ri-external-link-line" />
                </span>
              </div>
              <AdminProjectMember
                :data="getProjectMembersData"
                :dialog-visible="dialogVisible.projectMember"
                @dialog-visible="onChangeDialogVisible"
              />
            </el-card>
          </el-col>
          <el-col
            v-if="userRole!=='QA'"
            :xs="24"
            :sm="24"
            :md="7"
          >
            <el-card>
              <template slot="header">
                <span class="font-bold">{{ $t('Dashboard.ADMIN.CommitLog.NAME') }} </span>
              </template>
              <AdminCommitLog :get-data="getGitCommitLogData" />
            </el-card>
          </el-col>
        </el-row>
        <el-row
          type="flex"
          class="flex-wrap"
          :gutter="10"
        >
          <el-col
            :xs="24"
            :sm="24"
            :md="12"
          >
            <el-card>
              <template slot="header">
                <span class="font-bold">{{ $t('Dashboard.ADMIN.IssueRank.NAME') }}</span>
              </template>
              <AdminIssueRank :data="getIssueRankData" />
            </el-card>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="12"
          >
            <el-card>
              <div
                slot="header"
                class="cursor-pointer"
                @click="onChangeDialogVisible({key: 'passingRate', value: true})"
              >
                <span class="font-bold">{{ $t('Dashboard.ADMIN.PassingRate.NAME') }}
                  <em class="ri-external-link-line" />
                </span>
              </div>
              <AdminPassingRate
                :data="getPassingRateData"
                :dialog-visible="dialogVisible.passingRate"
                @dialog-visible="onChangeDialogVisible"
              />
            </el-card>
          </el-col>
        </el-row>
        <el-row
          type="flex"
          class="flex-wrap"
          :gutter="10"
        >
          <el-col
            :xs="24"
            :sm="24"
            :md="24"
          >
            <el-card>
              <div
                slot="header"
                class="cursor-pointer"
                @click="onChangeDialogVisible({key: 'projectList', value: true})"
              >
                <div class="flex justify-between items-center">
                  <span class="font-bold">
                    {{ $t('Dashboard.ADMIN.ProjectList.NAME') }}
                    <em class="ri-external-link-line" />
                  </span>
                  <span class="text-right">{{ $t('Dashboard.ADMIN.sync_date', [UTCtoLocalTime(lastUpdate)]) }} </span>
                </div>
              </div>
              <AdminProjectList
                :data="getProjectListData"
                :dialog-visible="dialogVisible.projectList"
                @update="getLastUpdate"
                @dialog-visible="onChangeDialogVisible"
              />
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <div v-if="!isLoading&&projectCount<=0">
      <el-empty :description="$t('general.NoData')">
        <el-button
          class="buttonSecondary"
          icon="el-icon-plus"
          @click="handleAdding"
        >
          {{ $t('Project.AddProject') }}
        </el-button>
      </el-empty>
      <CreateProjectDialog
        ref="createProjectDialog"
        @update="$router.push({name: 'ProjectList'})"
      />
    </div>
  </div>
</template>

<script>
import {
  getGitCommitLog,
  getIssueRank,
  getPassingRate,
  getProjectList,
  getProjectMembers,
  getProjectOverview,
  getSyncRedmine,
  getSyncRedmineStatus
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
import { mapGetters } from 'vuex'
import { CreateProjectDialog } from '@/views/Overview/ProjectList/components'

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
    AdminPassingRate,
    CreateProjectDialog
  },
  data() {
    return {
      isLoading: true,
      lastUpdate: '',
      projectCount: 0,
      overview: [],
      gitCommitLog: [],
      requestGitLabLastTime: null,
      status: { is_lock: false, sync_date: '' },
      dialogVisible: {
        projectMember: false,
        passingRate: false,
        projectList: false
      }
    }
  },
  computed: {
    ...mapGetters(['userRole'])
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
    this.loadSyncStatus()
  },
  methods: {
    async initDashboard() {
      this.gitCommitLog = await this.getGitCommitLogData()
    },
    async getSyncRedmine() {
      this.status.is_lock = true
      await getSyncRedmine()
      await this.sleep(1000)
      await this.loadSyncStatus()
    },
    async loadSyncStatus() {
      await this.getSyncStatus()
      if (!this.status.is_lock) {
        if (this.intervalTimer) {
          window.clearInterval(this.intervalTimer)
          this.intervalTimer = null
        }
      } else if (!this.intervalTimer) {
        this.intervalTimer = window.setInterval(this.loadSyncStatus, 5000)
      }
      return Promise.resolve()
    },
    async getSyncStatus() {
      try {
        const res = await getSyncRedmineStatus()
        this.status = res.data
        return Promise.resolve(res.data)
      } catch (e) {
        console.error(e)
        return Promise.reject(e)
      }
    },
    async getProjectOverviewData() {
      const res = await getProjectOverview()
      const result = []
      res.data.forEach((item) => {
        result.push({
          ...item,
          class: overview[item['project_status']]['class'],
          database: overview[item['project_status']]['database']
        })
      })
      return Promise.resolve(result)
    },
    async getProjectMembersData() {
      const res = await getProjectMembers()
      return Promise.resolve(res.data)
    },
    async getGitCommitLogData() {
      const params = { show_commit_rows: commitLimit }
      const res = await getGitCommitLog(params)
      res.data.forEach((item, index) => {
        item['id'] = index
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
      })
      return Promise.resolve(res.data)
    },
    async getIssueRankData() {
      const res = await getIssueRank()
      return Promise.resolve(res.data)
    },
    async getPassingRateData() {
      const res = await getPassingRate()
      const result = res.data.map((item) => ({
        name: item['project_name'],
        value: [item['total'], item['passing_rate'] * 100, item['count']]
      }))
      return Promise.resolve(result)
    },
    async getProjectListData() {
      const res = await getProjectList()
      return Promise.resolve(res.data)
    },
    getLastUpdate(value) {
      this.lastUpdate = value
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    UTCtoLocalTime(value) {
      return UTCtoLocalTime(value)
    },
    handleAdding() {
      this.$refs.createProjectDialog.showDialog = true
      this.$refs.createProjectDialog.refreshTemplate()
    },
    onChangeDialogVisible(value) {
      this.$set(this.dialogVisible, value['key'], value['value'])
    },
    getTotalCount(value) {
      this.projectCount = value.count
    },
    getLoadingStatus(value) {
      this.isLoading = value
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';
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
