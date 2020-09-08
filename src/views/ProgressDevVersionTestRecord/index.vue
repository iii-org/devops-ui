<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import TestDetail from './components/TestDetail'
import { getPipelines, getPipelinesLogs } from '@/api/cicd'
import ProjectListSelector from '../../components/ProjectListSelector'
import { formatTime } from '../../utils/index.js'

export default {
  components: { Pagination, ProjectListSelector, TestDetail },
  data() {
    return {
      isLoading: false,
      projectList: [
        {
          project_name: '專科A'
        }
      ],
      projectValue: '專科A',
      listLoading: true,
      testList: [],
      detailData: [],
      testDetailVisible: false,
      addDocumentDialogVisible: false,
      search: '',
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  computed: {
    ...mapGetters(['projectSelectedObject']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.testList.slice(start, end)
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
      const res = await getPipelines(rid)
      const { data } = res
      this.testList = data
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
      const res = await getPipelinesLogs(params)
      const { data } = res
      this.detailData = data
      this.isLoading = false
      this.emitTestDetailVisible(true)
    }
  }
}
</script>

<template>
  <div v-loading="isLoading" class="app-container">
    <div>
      <project-list-selector />
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column label="Index" :show-overflow-tooltip="true" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="Branch" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_branch }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="100">
        <template slot-scope="scope">
          <i v-if="statusBoo(scope.row.status)" class="el-icon-success" style="color:#67C23A" />
          <i v-else class="el-icon-success" style="color:#909399" />
        </template>
      </el-table-column>
      <el-table-column label="Commit Message" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_message }}
        </template>
      </el-table-column>
      <el-table-column label="Last Update Time">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.last_test_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="200" align="center">
        <template slot-scope="scope">
          <span @click="onDetailsClick(scope.row)" style="color: #409EFF;cursor: pointer;text-decoration: underline">
            Detail
          </span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="testList.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
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

<style lang="scss"></style>
