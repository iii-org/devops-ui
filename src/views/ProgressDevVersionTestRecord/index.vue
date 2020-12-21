<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import TestDetail from './components/TestDetail'
import { getPipelines, getPipelinesLogs } from '@/api/cicd'
import ProjectListSelector from '../../components/ProjectListSelector'
import { formatTime } from '../../utils/index.js'

export default {
  name: 'ProgressDevVersionTestRecord',
  components: { Pagination, ProjectListSelector, TestDetail },

  data() {
    return {
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
      listTotal: 0, // 總筆數
      searchData: ''
    }
  },

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

    onStopClick(row) {
      this.isLoading = true

      this.isLoading = false
    },

    onRerunClick(row) {
      this.isLoading = true

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

    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fixed>
      <el-table-column
        :label="$t('ProcessDevBranchTest.Id')"
        :show-overflow-tooltip="true"
        align="center"
        min-width="80"
      >
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('ProcessDevBranchTest.TestItems')"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120"
      >
        <template slot-scope="scope">
          {{ `(${scope.row.status.success}/${scope.row.status.total})` }}
          <i
            class="el-icon-circle-check"
            :class="scope.row.status.success === scope.row.status.total ? 'text-success' : ''"
          />
        </template>
      </el-table-column>

      <el-table-column :label="$t('ProcessDevBranchTest.Status')" align="center" min-width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.execution_state == 'Failed'" type="danger" size="big">
            {{ scope.row.execution_state }}
          </el-tag>

          <el-tag v-else-if="scope.row.execution_state == 'Success'" type="success" size="big">
            {{ scope.row.execution_state }}
          </el-tag>

          <el-tag v-else-if="scope.row.execution_state == 'Waiting'" type="responded" size="big">
            {{ scope.row.execution_state }}
          </el-tag>

          <el-tag v-else-if="scope.row.execution_state == 'Building'" type="warning" size="big">
            {{ scope.row.execution_state }}
          </el-tag>

          <el-tag v-else type="close" size="big">{{ scope.row.execution_state }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('ProcessDevBranchTest.Commit')"
        :show-overflow-tooltip="true"
        align="center"
        min-width="220"
      >
        <template slot-scope="scope">
          {{ scope.row.commit_id }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('ProcessDevBranchTest.Branch')"
        :show-overflow-tooltip="true"
        align="center"
        min-width="90"
      >
        <template slot-scope="scope">
          {{ scope.row.commit_branch }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('ProcessDevBranchTest.CommitMessage')"
        :show-overflow-tooltip="true"
        align="center"
        min-width="170"
      >
        <template slot-scope="scope">
          {{ scope.row.commit_message }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('ProcessDevBranchTest.LastUpdateTime')" align="center" min-width="180">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.last_test_time) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Actions')" align="center" min-width="180">
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
            @click="onStopClick(scope.row)"
          >
            stop
          </el-button>

          <el-button v-else size="mini" type="primary" plain @click="onRerunClick(scope.row)">
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
