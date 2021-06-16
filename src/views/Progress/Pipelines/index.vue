<template>
  <el-row class="app-container">
    <el-col>
      <div class="d-flex justify-space-between">
        <project-list-selector />
        <el-input
          v-model="keyword"
          style="width: 250px"
          prefix-icon="el-icon-search"
          :placeholder="$t('ProgressPipelines.SearchCommitMessage')"
        />
      </div>
      <el-divider />
      <div class="text-right text-body-1 mb-2 text-info">{{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}</div>
      <el-table v-loading="isLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit>
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
            <div class="text-subtitle-2 font-weight-bold">{{ scope.row.commit_message }}</div>
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
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
      <test-detail
        ref="testDetail"
        :pipeline-id="focusPipeline.id"
        :pipeline-commit="focusPipeline.commit"
        @loaded="isLoading = false"
        @close="setTimer"
      />
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

export default {
  name: 'ProgressPipelinesSocket',
  components: { ElTableColumnTime, TestDetail, ProjectListSelector, Pagination },
  data() {
    return {
      isLoading: false,
      rowHeight: 90,
      lastUpdateTime: '',
      timer: null,
      focusPipeline: { id: 0, commit: null },
      listData: [],
      listQuery: {
        page: 1,
        limit: 10
      },
      searchKeys: ['commit_message'],
      keyword: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'selectedProjectId', 'userId']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return this.filteredData.slice(start, end)
    },
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
      this.loadData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    keyword() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.loadData()
    this.setTimer()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async loadData() {
      this.isLoading = true
      this.listData = []
      await this.fetchData()
      this.isLoading = false
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      try {
        const pipe = await getPipelines(this.selectedRepositoryId)
        this.lastUpdateTime = this.$dayjs(pipe.datetime)
          .utcOffset(16)
          .format('YYYY-MM-DD HH:mm:ss')
        pipe.data.forEach((item, idx) => {
          const result = { ...item }
          if (result.execution_state === 'Success') result.execution_state = 'Finished'
          this.$set(this.listData, idx, result)
        })
      } catch (error) {
        console.error(error)
      }
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
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
      this.isLoading = true
      this.focusPipeline.id = row.id
      this.focusPipeline.commit = row.commit_message
      this.$refs.testDetail.pipelinesExecRun = row.id
      this.$refs.testDetail.fetchStages()
      this.clearTimer()
    },
    isAllowStop(status) {
      const allowStatus = ['Waiting', 'Building', 'Queueing']
      return allowStatus.includes(status)
    },
    setTimer() {
      this.timer = setInterval(() => this.fetchData(), 10000)
    },
    clearTimer() {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
</script>
