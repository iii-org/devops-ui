<script>
import { changePipelineByAction, getPipelines, getPipelinesConfig } from '@/api/cicd'
import TestDetail from './components/TestDetail'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ProgressPipelines',
  components: { ElTableColumnTime, TestDetail },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    isLoading: false,
    detailData: [],
    testDetailVisible: false,
    addDocumentDialogVisible: false,
    rowHeight: 90,
    searchKey: 'commit_message',
    pipelinesExecRun: 0
  }),
  methods: {
    async fetchData() {
      const rid = this.selectedProject.repository_id
      try {
        return (await getPipelines(rid)).data
      } catch (error) {
        console.error(error)
        return []
      }
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'No Test'
      return success + ' / ' + total
    },
    statusBoo(obj) {
      if (obj.success === obj.total) return true
    },
    emitTestDetailVisible(visible) {
      this.testDetailVisible = visible
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
    getStatusTagType(status) {
      switch (status) {
        case 'Failed':
          return 'danger'
        case 'Success':
          return 'success'
        case 'Aborted':
          return 'warning'
        case 'Waiting':
          return 'slow'
        case 'Building':
          return 'warning'
        default:
          return 'slow'
      }
    },
    async onDetailsClick(id) {
      this.isLoading = true
      const { repository_id } = this.selectedProject
      try {
        const res = await getPipelinesConfig(repository_id, { pipelines_exec_run: id })
        this.pipelinesExecRun = id
        this.detailData = res.map(data => {
          const stage = data
          stage['isLoading'] = true
          stage.steps.forEach(step => (step['message'] = 'Loading...'))
          return stage
        })
        this.emitTestDetailVisible(true)
      } catch (error) {
        console.error(error)
      }
      this.isLoading = false
    }
  }
}
</script>

<template>
  <div v-loading="isLoading" class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('ProcessDevBranchTest.SearchCommitMessage')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <div class="text-right mb-3">
      <el-button id="btn-reload" type="primary" icon="el-icon-refresh" size="mini" plain @click="loadData">
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      height="100%"
      :cell-style="{ height: rowHeight + 'px' }"
    >
      <el-table-column :label="$t('ProcessDevBranchTest.Id')" align="center" width="80" prop="id" />
      <el-table-column :label="$t('ProcessDevBranchTest.TestItems')" align="center" width="120">
        <template slot-scope="scope">
          {{ `(${scope.row.status.success}/${scope.row.status.total})` }}
          <i
            class="el-icon-circle-check"
            :class="scope.row.status.success === scope.row.status.total ? 'text-success' : ''"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevBranchTest.Status')" align="center" width="110">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.execution_state)" size="medium" effect="dark">
            {{ scope.row.execution_state }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevBranchTest.Commit')" align="center" min-width="180">
        <template slot-scope="scope">
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
      <el-table-column :label="$t('ProcessDevBranchTest.Branch')" align="center" min-width="130" prop="commit_branch" />
      <el-table-column
        :label="$t('ProcessDevBranchTest.CommitMessage')"
        align="center"
        min-width="200"
        prop="commit_message"
      />
      <el-table-column
        :label="$t('ProcessDevBranchTest.TransitioningMessage')"
        align="center"
        min-width="220"
        prop="transitioning_message"
      />
      <el-table-column-time prop="last_test_time" />
      <el-table-column :label="$t('general.Actions')" align="center" width="200">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="onDetailsClick(scope.row.id)">
            <i class="el-icon-document" />
            Detail
          </el-button>

          <el-button
            v-if="scope.row.execution_state === 'Waiting' || scope.row.execution_state === 'Building'"
            size="mini"
            type="danger"
            plain
            @click="onActionClick(scope.row.id, 'stop')"
          >
            <i class="el-icon-circle-close" />
            stop
          </el-button>

          <el-button v-else size="mini" type="primary" plain @click="onActionClick(scope.row.id, 'rerun')">
            <i class="el-icon-refresh-left" />
            rerun
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
      :dialog-visible.sync="testDetailVisible"
      :the-data="detailData"
      :pipelines-exec-run="pipelinesExecRun"
      @test-detail-visible="emitTestDetailVisible"
    />
  </div>
</template>
