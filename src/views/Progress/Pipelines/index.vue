<template>
  <el-row class="app-container">
    <el-col>
      <project-list-selector>
        <el-input
          v-model="keyword"
          style="width: 250px"
          prefix-icon="el-icon-search"
          :placeholder="$t('ProgressPipelines.SearchCommitMessage')"
        />
      </project-list-selector>
      <el-divider />
      <div class="text-right text-base mb-2 text-info">{{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}</div>
      <el-table v-loading="isLoading" :element-loading-text="$t('Loading')" :data="filteredData" border fit>
        <el-table-column :label="$t('ProgressPipelines.Id')" align="center" width="80" prop="id" />
        <el-table-column
          :label="`${$t('ProgressPipelines.Status')} / ${$t('ProgressPipelines.TestItems')}`"
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
              <i
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
            <el-link type="primary" target="_blank" style="font-size: 16px" :href="scope.row.commit_url">
              <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
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
        <el-table-column-time prop="last_test_time" :label="$t('general.LastUpdateTime')" width="140" />
        <el-table-column :label="$t('general.Actions')" header-align="center" width="230">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-document" plain @click="onDetailsClick(scope.row)">
              {{ $t('general.Detail') }}
            </el-button>
            <el-button
              v-if="isAllowStop(scope.row.execution_state)"
              size="mini"
              type="danger"
              plain
              icon="el-icon-circle-close"
              @click="onActionClick(scope.row.id, 'stop')"
            >
              {{ $t('general.Stop') }}
            </el-button>
            <el-button
              v-else
              size="mini"
              type="primary"
              plain
              icon="el-icon-refresh-left"
              @click="onActionClick(scope.row.id, 'rerun')"
            >
              {{ $t('general.Rerun') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="listQuery.total"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
      <test-detail ref="testDetail" :pipeline-infos="focusPipeline" @loaded="isLoading = false" />
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { changePipelineByAction, getPipelines } from '@/api/cicd'
import TestDetail from './components/TestDetail'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { CancelRequest } from '@/newMixins'

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
  name: 'ProgressPipelinesSocket',
  components: { ElTableColumnTime, TestDetail, ProjectListSelector, Pagination },
  mixins: [CancelRequest],
  data() {
    return {
      isLoading: false,
      isUpdating: false,
      rowHeight: 90,
      lastUpdateTime: '',
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
      return listData.filter(data => {
        let result = false
        for (let i = 0; i < searchKeys.length; i++) {
          const columnValue = data[searchKeys[i]].toLowerCase()
          result = result || columnValue.includes(keyword)
          if (result) break
        }
        return result
      })
    },
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
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
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    onPagination(listQuery) {
      this.clearTimer()
      const { first, limit } = this.listQuery
      const startId = first - (listQuery.page - 1) * limit
      this.listQuery.start = startId
      this.loadData(10, startId)
    },
    async loadData(limit, startId) {
      this.isLoading = true
      await this.fetchData(limit, startId)
    },
    async fetchData(limit = 10, startId = this.listQuery.start) {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      if (this.isUpdating) this.cancelRequest()
      this.isUpdating = true
      try {
        const res = await getPipelines(this.selectedRepositoryId, { limit, start: startId }, { cancelToken: this.cancelToken })
        this.lastUpdateTime = this.$dayjs()
          .utc(res.datetime)
          .format('YYYY-MM-DD HH:mm:ss')
        this.updatePipeExecs(res.data)
        this.listQuery = res.data.pagination
        this.listQuery.page = 1
        this.isLoading = false
        this.isUpdating = false
        this.setTimer()
      } catch (error) {
        console.error('error ========>', error)
      }
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    },
    updatePipeExecs(resData) {
      if (resData.pipe_execs.length > 0) {
        this.listData = resData.pipe_execs.map(item => {
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
        .then(_ => {
          this.loadData()
        })
        .catch(err => {
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
    }
  }
}
</script>
