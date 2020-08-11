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
          version: 'Release',
          desc: '使用登入',
          status: '10|0',
          commit_id: '8a6d1c',
          last_update_time: '2020-08-10T07:20:11Z',
          last_test_result: {
            success: 3,
            total: 12
          }
        },
        {
          order: 2,
          version: 'Develop',
          desc: '建立登入頁面',
          status: '10|0',
          commit_id: '8a6d1x',
          last_update_time: '2020-08-10T07:20:11Z',
          last_test_result: {
            success: 10,
            total: 10
          }
        },
        {
          order: 3,
          version: 'Branch_1',
          desc: '建立忘記密碼頁面',
          status: '10|0',
          commit_id: '7a6d1c',
          last_update_time: '2020-08-10T07:20:11Z',
          last_test_result: {
            success: 3,
            total: 12
          }
        },
        {
          order: 4,
          version: 'Branch_2',
          desc: '密碼重設信不能正確寄送',
          status: '10|0',
          commit_id: '6a6d1c',
          last_update_time: '2020-08-10T07:20:11Z',
          last_test_result: {
            success: 3,
            total: 12
          }
        },
        {
          order: 5,
          version: 'Branch_3',
          desc: '第一版釋出',
          status: '10|0',
          commit_id: '3a6d1f',
          last_update_time: '2020-08-10T07:20:11Z',
          last_test_result: {
            success: 3,
            total: 12
          }
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
      <el-table-column label="Version" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          {{ scope.row.version }}
        </template>
      </el-table-column>
      <el-table-column label="Desc" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column label="Status" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="Last Update Time" width="200">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.last_update_time).toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Version ID" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Test Result" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          <el-tag :type="returnTagType(scope.row)" size="large">
            <i v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <i v-else-if="returnTagType(scope.row) === 'danger'" class="el-icon-error" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
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
