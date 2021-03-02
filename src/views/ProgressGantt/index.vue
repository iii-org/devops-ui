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
          desc: '開發階段1',
          status: '完成',
          start_time: '2020-05-25T07:20:11Z',
          end_time: '2020-07-25T07:20:11Z'
        },
        {
          order: 2,
          desc: '版本1',
          status: '進行中',
          start_time: '2020-07-25T07:20:11Z',
          end_time: '2020-07-30T07:20:11Z'
        },
        {
          order: 3,
          desc: '開發階段2',
          status: '進行中',
          start_time: '2020-07-30T07:20:11Z',
          end_time: '2020-08-25T07:20:11Z'
        },
        {
          order: 4,
          desc: '開發階段3',
          status: '進行中',
          start_time: '2020-08-25T07:20:11Z',
          end_time: '2020-09-25T07:20:11Z'
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
      if (columnIndex === 3) {
        if (rowIndex === 0) return [this.listQuery.limit, 1]
        return [0, 0]
      }
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
      :data="pagedData"
      :span-method="objectSpanMethod"
      :element-loading-text="$t('Loading')"
      border
      style="width: 100%"
    >
      <el-table-column align="center" label="No" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.order }}
        </template>
      </el-table-column>
      <el-table-column label="Desc" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          {{ scope.row.desc }}
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
