<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
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
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        border
        fit
        :style="{ height: 'calc(100vh - 310px)', overflow: 'auto' }"
      >
        <el-table-column :label="$t('ProgressPipelines.Id')" align="center" width="80" prop="id" />
        <el-table-column
          :label="`${$t('ProgressPipelines.Status')} / ${$t('ProgressPipelines.TestItems')}`"
          align="center"
          width="170"
        >
          <template slot-scope="scope">
            <el-tag
              size="small"
              :type="getTagType(scope.row.execution_state)"
              :effect="getTagEffect(scope.row.execution_state)"
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
            <el-link
              type="primary"
              target="_blank"
              style="font-size: 16px"
              :underline="false"
              :href="scope.row.commit_url"
            >
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
            <el-button size="mini" type="primary" icon="el-icon-document" plain @click="onDetailsClick(scope.row.id)">
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
      <test-detail ref="testDetail" :pipeline-id="focusPipelineId" />
    </el-col>
  </el-row>
</template>

<script>
import { changePipelineByAction, getPipelines } from '@/api/cicd'
import TestDetail from './components/TestDetail'
import MixinBasicTableWithProject from '@/mixins/MixinBasicTableWithProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ProgressPipelinesSocket',
  components: { ElTableColumnTime, TestDetail },
  mixins: [MixinBasicTableWithProject],
  data() {
    return {
      isLoading: false,
      rowHeight: 90,
      lastUpdateTime: '',
      timer: null,
      focusPipelineId: 0,
      searchKeys: ['commit_message']
    }
  },
  mounted() {
    this.setTimer()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      const rid = this.selectedProject.repository_id
      try {
        const pipe = await getPipelines(rid)
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
    async loadData() {
      this.listLoading = true
      this.listData = []
      await this.fetchData()
      this.listLoading = false
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    },
    async onActionClick(id, action) {
      const { repository_id } = this.selectedProject
      const data = {
        pipelines_exec_run: id,
        action
      }
      this.listLoading = true
      await changePipelineByAction(repository_id, data)
        .then(_ => {
          this.loadData()
        })
        .catch(err => {
          this.listLoading = false
          return err
        })
    },
    getTagType(status) {
      switch (status) {
        case 'Failed':
          return 'danger'
        case 'Finished':
          return 'success'
        case 'Aborted':
          return 'warning'
        case 'Waiting':
          return 'slow'
        case 'Building':
          return 'success'
        default:
          return 'info'
      }
    },
    getTagEffect(status) {
      switch (status) {
        case 'Building':
          return 'light'
        default:
          return 'dark'
      }
    },
    onDetailsClick(id) {
      this.$refs.testDetail.pipelinesExecRun = id
      this.$refs.testDetail.fetchStages()
    },
    isAllowStop(status) {
      if (status === 'Waiting' || status === 'Building' || status === 'Queueing') {
        return true
      } else {
        return false
      }
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
