<script>
import projectGantt from './components/project_gantt'
import Pagination from '@/components/Pagination'
export default {
  components: { projectGantt, Pagination },
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
          desc: '使用登入',
          status: '進行中',
          start_time: '2020-05-25T07:20:11Z',
          end_time: '2020-07-25T07:20:11Z',
          last_test_result: {
            success: 3,
            total: 12
          },
          children: [
            {
              order: 2,
              desc: '建立登入頁面',
              status: '已完成',
              start_time: '2020-05-25T07:20:11Z',
              end_time: '2020-07-25T07:20:11Z',
              last_test_result: {
                success: 2,
                total: 2
              }
            },
            {
              order: 3,
              desc: '建立忘記密碼頁面',
              status: '進行中',
              start_time: '2020-05-25T07:20:11Z',
              end_time: '2020-07-25T07:20:11Z',
              last_test_result: {
                success: 1,
                total: 10
              }
            }
          ]
        },
        {
          order: 4,
          desc: '建立專案工作',
          status: '進行中',
          start_time: '2020-07-25T07:20:11Z',
          end_time: '2020-07-30T07:20:11Z',
          last_test_result: {
            success: 2,
            total: 5
          },
          children: [
            {
              order: 5,
              desc: '工作列表頁面',
              status: '已完成',
              start_time: '2020-05-25T07:20:11Z',
              end_time: '2020-07-25T07:20:11Z',
              last_test_result: {
                success: 2,
                total: 5
              }
            }
          ]
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
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 6) {
        if (rowIndex === 0) return [this.listQuery.limit, 1]
        return [0, 0]
      }
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'warning'
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
    <el-table
      v-loading="listLoading"
      row-key="order"
      :data="pagedData"
      :span-method="objectSpanMethod"
      element-loading-text="Loading"
      border
      style="width: 100%"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column align="center" label="No" :show-overflow-tooltip="true" width="100" fixed="left">
        <template slot-scope="scope">
          {{ scope.row.order }}
        </template>
      </el-table-column>
      <el-table-column label="Desc" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column label="Start Date" width="200">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.start_time).toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="End Date" width="200">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.end_time).toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Test Result" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          <el-tag :type="returnTagType(scope.row)" size="large" effect="dark">
            <i v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <i v-else-if="returnTagType(scope.row) === 'danger'" class="el-icon-error" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="Gantt" fixed="right" width="800">
        <project-gantt :data-list="pagedData" />
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
