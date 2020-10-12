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
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, //總筆數
      searchData: ''
    }
  },
  computed: {
    ...mapGetters(['projectSelectedObject']),
    pagedData() {
      const listData = this.testList.filter((data) => {
        if (this.searchData == '' || data.commit_message.toLowerCase().includes(this.searchData.toLowerCase())) {
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
        placeholder="Please input commit message"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"></i
      ></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column label="Index" :show-overflow-tooltip="true" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="Commit short Id" :show-overflow-tooltip="true" width="160">
        <template slot-scope="scope"> c67a224 </template>
      </el-table-column>
      <el-table-column label="Branch" :show-overflow-tooltip="true" width="160">
        <template slot-scope="scope">
          {{ scope.row.commit_branch }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="120">
        <template slot-scope="scope">
          <el-tag v-if="statusBoo(scope.row.status)" type="success" size="big">Success</el-tag>
          <el-tag v-else type="danger" size="big">Fail</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Commit Message" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_message }}
        </template>
      </el-table-column>
      <el-table-column label="Last Update Time" width="240">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.last_test_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="160" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="onDetailsClick(scope.row)">
            <i class="el-icon-document" />
            Detail
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

<style lang="scss"></style>
