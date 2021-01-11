<script>
import { mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import AddDocument from './components/AddDocument'
export default {
  components: {
    AddDocument,
    Pagination
  },
  data() {
    return {
      documentList: [
        {
          type: '需求訪談',
          order: 1,
          desc: '使用者需求訪談',
          status: '已確定',
          last_update_user: '陳聰明',
          last_update_at: '2020-07-25T07:20:11Z'
        },
        {
          type: '手冊',
          order: 2,
          desc: '安裝手冊',
          status: '進行中',
          last_update_user: '陳聰明',
          last_update_at: '2020-07-25T07:20:11Z'
        }
      ],
      addDocumentDialogVisible: false,
      search: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        totalPage: 1
      }
    }
  },
  computed: {
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.documentList.slice(start, end)
    }
  },
  async created() {
    // TODO: get project document list
    this.listLoading = false
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    returnTagType(row) {
      const { success, total } = row.last_test_result
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      return success + ' / ' + total
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    emitAddDocumentDialogVisible(visible) {
      this.addDocumentDialogVisible = visible
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="search" placeholder="Filter Name" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search">
        Search
      </el-button>
      <el-button
        type="primary"
        icon="el-icon-plus"
        circle
        style="float: right"
        @click="addDocumentDialogVisible = true"
      />
    </div>
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Index">
        <template slot-scope="scope">
          {{ scope.row.order }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Description">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last update user">
        <template slot-scope="scope">
          {{ scope.row.last_update_user }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last update time">
        <template slot-scope="scope">
          {{ scope.row.last_update_at | relativeTime }}
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="listQuery.totalPage"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <add-document
      :dialog-visible.sync="addDocumentDialogVisible"
      @add-document-visible="emitAddDocumentDialogVisible"
    />
  </div>
</template>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 5px;
}
</style>
