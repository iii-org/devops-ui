<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector>
        <el-input
          v-model="keyword"
          style="width: 250px"
          prefix-icon="el-icon-search"
          :placeholder="$t('ProgressPipelines.SearchCommitMessage')"
        />
      </ProjectListSelector>
      <el-divider />
      <div class="flex justify-between text-base mb-2 text-info">
        <div>{{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}</div>
        <el-popover trigger="click">
          <el-card
            shadow="never"
            body-style="width: 500px"
          >
            <PipelineSettingsTable />
          </el-card>
          <el-link
            slot="reference"
            class="linkTextColor"
            style="font-size: 16px"
            :underline="false"
          >
            <em class="el-icon-s-tools" />
            {{ $t('ProgressPipelines.PipeLineSettings') }}
          </el-link>
        </el-popover>
      </div>
      <el-table
        v-loading="isLoading"
        :element-loading-text="$t('Loading')"
        :data="filteredData"
        fit
      >
        <el-table-column
          :label="$t('ProgressPipelines.Id')"
          align="center"
          width="80"
          prop="id"
        />
        <el-table-column
          :label="`${$t('general.Status')} / ${$t('ProgressPipelines.TestItems')}`"
          align="center"
          width="170"
        >
          <template slot-scope="scope">
            <el-tag
              size="small"
              :type="mapStateType(scope.row.execution_state)"
              :effect="mapStateEffect(scope.row.execution_state)"
            >
              {{ scope.row.execution_state }}
            </el-tag>
            <div class="mt-2">
              {{ `(${scope.row.status.success}/${scope.row.status.total})` }}
              <em
                class="el-icon-circle-check"
                :class="scope.row.status.success === scope.row.status.total ? 'text-success' : ''"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="`${$t('ProgressPipelines.Branch')} / ${$t('ProgressPipelines.Commit')}`"
          align="center"
          width="160"
        >
          <template slot-scope="scope">
            <div>
              {{ scope.row.commit_branch }}
            </div>
            <el-link
              class="linkTextColor"
              target="_blank"
              style="font-size: 16px"
              :href="scope.row.commit_url"
            >
              <svg-icon
                class="mr-1"
                icon-class="ion-git-commit-outline"
              />
              {{ scope.row.commit_id }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          :label="`${$t('ProgressPipelines.CommitMessage')} / ${$t('ProgressPipelines.TransitioningMessage')}`"
          min-width="300"
          prop="commit_message"
          header-align="center"
        >
          <template slot-scope="scope">
            <div class="text-sm font-bold">{{ scope.row.commit_message }}</div>
            <div>{{ scope.row.transitioning_message }}</div>
          </template>
        </el-table-column>
        <el-table-column-time
          prop="last_test_time"
          :label="$t('general.LastUpdateTime')"
          width="140"
        />
        <el-table-column
          :label="$t('general.Actions')"
          align="center"
          width="130"
        >
          <template slot-scope="scope">
            <el-tooltip
              class="item cursor-pointer"
              :content="$t('PipeLines.ExecuteDetail')"
              placement="bottom"
              @click.native="onDetailsClick(scope.row)"
            >
              <em class="ri-terminal-box-fill icon" />
            </el-tooltip>
            <el-tooltip
              v-if="isAllowStop(scope.row.execution_state)"
              class="item cursor-pointer"
              :content="$t('general.Stop')"
              placement="bottom"
              @click.native="onActionClick(scope.row.id, 'stop')"
            >
              <em class="ri-close-circle-fill icon danger" />
            </el-tooltip>
            <el-tooltip
              v-else-if="!isAllowStop(scope.row.execution_state) && scope.row.id === lastData.id"
              class="item cursor-pointer"
              :content="$t('general.Rerun')"
              placement="bottom"
              @click.native="onActionClick(scope.row.id, 'rerun')"
            >
              <em class="ri-refresh-fill icon active" />
            </el-tooltip>
            <el-tooltip
              v-show="scope.row.commit_id"
              class="item cursor-pointer"
              :content="$t('PipeLines.Report')"
              placement="bottom"
              @click.native="handleToTestReport(scope.row)"
            >
              <em class="ri-file-list-2-fill icon" />
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" />
        </template>
      </el-table>
      <Pagination
        :total="listQuery.total"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :layout="'total, sizes, prev, pager, next'"
        @pagination="onPagination"
      />
      <test-detail
        ref="testDetail"
        :pipeline-infos="focusPipeline"
        @loaded="isLoading = false"
      />
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { changePipelineByAction, getPipelines } from '@/api/cicd'
import { CancelRequest } from '@/mixins'
import { getLocalTime } from '@/utils/handleTime'
import {
  ElTableColumnTime,
  ProjectListSelector,
  Pagination
} from '@/components'
import PipelineSettingsTable from '@/views/Plan/Settings/components/PipelineSettingsTable'
import TestDetail from './components/TestDetail'
// import { triggerReport } from '@/utils/triggerReport'

const listQuery = () => ({
  page: 1,
  limit: 10,
  total: 0,
  start: 0,
  first: 0,
  next: 0,
  last: 0
})

export default {
  name: 'Pipelines',
  components: {
    ElTableColumnTime,
    ProjectListSelector,
    Pagination,
    PipelineSettingsTable,
    TestDetail
  },
  mixins: [CancelRequest],
  data() {
    return {
      isLoading: false,
      isUpdating: false,
      rowHeight: 90,
      lastUpdateTime: '-',
      timer: null,
      focusPipeline: {
        id: null,
        commitMessage: ''
      },
      listData: [],
      listQuery: listQuery(),
      searchKeys: ['commit_message'],
      keyword: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'selectedProjectId', 'userId']),
    filteredData() {
      const { listData, searchKeys } = this
      const keyword = this.keyword.toLowerCase()
      return listData.filter((data) => {
        let result = false
        for (const key of searchKeys) {
          const columnValue = data[key].toLowerCase()
          result = result || columnValue.includes(keyword)
          if (result) break
        }
        return result
      })
    },
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
    },
    lastData() {
      return this.listData[0]
    }
  },
  watch: {
    selectedProject() {
      this.listQuery = listQuery()
      this.searchData = ''
      this.clearTimer()
      this.loadData()
    },
    keyword() {
      this.listQuery.page = 1
    }
    // isUpdating() {
    //   this.triggerReport()
    // }
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    // triggerReport() {
    //   this.listData.forEach((item, index) => {
    //     if (item.status.success > 0) {
    //       triggerReport(this.selectedProject, this.listData[index].commit_id)
    //     }
    //   })
    // },
    onPagination(query) {
      this.clearTimer()
      const { first, next } = this.listQuery
      const startId = query.page === 1 ? first : next
      this.listQuery.start = startId
      this.loadData(10, startId)
    },
    async loadData(limit, startId) {
      if (this.selectedProjectId === -1) return
      this.isLoading = true
      await this.fetchData(limit, startId)
    },
    fetchData(limit = 10, startId = this.listQuery.start) {
      if (this.isUpdating) this.cancelRequest()
      this.isUpdating = true
      getPipelines(this.selectedRepositoryId, { limit, start: startId }, { cancelToken: this.cancelToken })
        .then((res) => {
          this.lastUpdateTime = getLocalTime(res.datetime)
          this.updatePipeExecs(res.data)
          this.listQuery = res.data.pagination
          this.listQuery.page = 1
          this.setTimer()
          this.isLoading = false
          this.isUpdating = false
        })
        .catch()
    },
    updatePipeExecs(resData) {
      if (resData.pipe_execs.length > 0) {
        this.listData = resData.pipe_execs.map((item) => {
          const result = { ...item }
          if (result.execution_state === 'Success') result.execution_state = 'Finished'
          return result
        })
      } else {
        this.listData = []
      }
    },
    async onActionClick(id, action) {
      const data = {
        pipelines_exec_run: id,
        action
      }
      this.isLoading = true
      await changePipelineByAction(this.selectedRepositoryId, data)
        .then((_) => {
          this.loadData()
        })
        .catch((err) => {
          this.isLoading = false
          return err
        })
    },
    mapStateType(status) {
      const mapping = {
        Failed: 'danger',
        Finished: 'success',
        Aborted: 'warning',
        Waiting: 'slow',
        Building: 'success'
      }
      return mapping[status] || 'info'
    },
    mapStateEffect(status) {
      const mapping = { Building: 'light' }
      return mapping[status] || 'dark'
    },
    onDetailsClick(row) {
      const { id, commit_message } = row
      this.isLoading = true
      this.focusPipeline.id = id
      this.focusPipeline.commitMessage = commit_message
      this.$refs.testDetail.pipelinesExecRun = id
      this.$refs.testDetail.fetchStages()
    },
    isAllowStop(status) {
      const allowStatus = ['Waiting', 'Building', 'Queueing']
      return allowStatus.includes(status)
    },
    setTimer() {
      this.timer = setTimeout(() => this.fetchData(), 10000)
    },
    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    },
    handleToTestReport(row) {
      const commitId = row.commit_id
      const commitBranch = row.commit_branch
      this.$router.push({
        name: 'TestReports',
        params: {
          commitId,
          commitBranch,
          projectId: this.selectedProject.id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.icon {
  font-size: x-large;
  font-weight: bolder;
  margin-right: 5px;
  color: $info;
  &.active {
    color: $active;
  }
  &.danger {
    color: $danger;
  }
  &:hover {
    color: #66b1ff;
  }
}
</style>
