<script>
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  data() {
    return {
      projectList: [
        {
          project_name: '專科A'
        }
      ],
      projectValue: '專科A',
      listLoading: true,
      pagedData: [
        {
          order: 1,
          counts: 5,
          version: 'V_1.2',
          desc: '使用登入',
          status: 'success',
          commit_msg: 'feature',
          last_update_time: '2020-08-10T07:20:11Z'
        },
        {
          order: 2,
          counts: 3,
          version: 'V1.0',
          desc: '建立登入頁面',
          status: 'fail',
          commit_msg: 'Added Jenkins File',
          last_update_time: '2020-08-10T07:20:11Z'
        }
      ],
      addDocumentDialogVisible: false,
      search: '',
      listQuery: {
        page: 1,
        limit: 20,
        totalPage: 1
      }
    }
  },
  mounted() {
    setTimeout(() => (this.listLoading = false), 1000)
  },
  methods: {
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
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div>
      <el-select v-model="projectValue" placeholder="select a project">
        <el-option
          v-for="item in projectList"
          :key="item.project_name"
          :label="item.project_name"
          :value="item.project_name"
        >
        </el-option>
      </el-select>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column label="Counts" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.counts }}
        </template>
      </el-table-column>
      <el-table-column label="Version" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.version }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="100">
        <template slot-scope="scope">
          <i v-if="scope.row.status === 'success'" class="el-icon-success" style="color:#67C23A" />
          <i v-else class="el-icon-success" style="color:#909399" />
        </template>
      </el-table-column>
      <el-table-column label="Commit Message" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_msg }}
        </template>
      </el-table-column>
      <el-table-column label="Last Update Time" width="200">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.last_update_time).toLocaleString() }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="pagedData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<style lang="scss"></style>
