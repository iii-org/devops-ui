<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import { formatTime } from '@/utils/index.js'
import { getPipelines, getPipelinesLogs, changePipelineByAction } from '@/api/cicd'
import TestDetail from './components/TestDetail'

export default {
  name: 'ProgressPipelines',
  components: { Pagination, ProjectListSelector, TestDetail },
  data: () => ({
    isLoading: false,
    listLoading: true,
    testList: [],
    detailData: [],
    testDetailVisible: false,
    addDocumentDialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedObject']),
    pagedData() {
      const listData = this.testList.filter(data => {
        if (this.searchData === '' || data.commit_message.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  watch: {
    projectSelectedObject(obj) {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  async created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const { repository_id: rid } = this.projectSelectedObject
      if (!rid) {
        this.testList = []
        this.listLoading = false
        return
      }
      try {
        const res = await getPipelines(rid)
        const { data } = res
        this.testList = data
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
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
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    statusBoo(obj) {
      if (obj.success === obj.total) return true
      false
    },
    myFormatTime(time) {
      return formatTime(new Date(time))
    },
    emitTestDetailVisible(visible) {
      this.testDetailVisible = visible
    },
    async onDetailsClick(row) {
      this.isLoading = true
      const { repository_id } = this.projectSelectedObject
      const params = {
        repository_id,
        pipelines_exec_run: row.id
      }
      try {
        const res = await getPipelinesLogs(params)
        const { data } = res
        this.detailData = data
        this.emitTestDetailVisible(true)
      } catch (error) {
        console.error(error)
      }

      this.isLoading = false
    },
    async onActionClick(id, action) {
      const { repository_id } = this.projectSelectedObject
      const data = {
        pipelines_exec_run: id,
        action
      }
      this.listLoading = true
      await changePipelineByAction(repository_id, data)
        .then(res => {
          this.fetchData()
        })
        .catch(err => {
          this.listLoading = false
          return err
        })
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
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit>
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
          <el-tag v-if="scope.row.execution_state == 'Failed'" type="danger" size="medium">
            {{ scope.row.execution_state }}
          </el-tag>
          <el-tag v-else-if="scope.row.execution_state == 'Success'" type="success" size="medium">
            {{ scope.row.execution_state }}
          </el-tag>
          <el-tag v-else-if="scope.row.execution_state == 'Waiting'" type="responded" size="medium">
            {{ scope.row.execution_state }}
          </el-tag>
          <el-tag v-else-if="scope.row.execution_state == 'Building'" type="warning" size="medium">
            {{ scope.row.execution_state }}
          </el-tag>
          <el-tag v-else type="close" size="medium">{{ scope.row.execution_state }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevBranchTest.Commit')" align="center" min-width="180">
        <template slot-scope="scope">
          <el-link type="primary" :href="scope.row.commit_url" target="_blank" :underline="false">
            {{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevBranchTest.Branch')" align="center" min-width="90" prop="commit_branch" />
      <el-table-column
        :label="$t('ProcessDevBranchTest.CommitMessage')"
        align="center"
        min-width="170"
        prop="commit_message"
      />
      <el-table-column :label="$t('ProcessDevBranchTest.LastUpdateTime')" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.last_test_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="200">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="onDetailsClick(scope.row)">
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
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <test-detail
      :dialog-visible.sync="testDetailVisible"
      :the-data="detailData"
      @test-detail-visible="emitTestDetailVisible"
    />
  </div>
</template>
