<script>
import { mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ValidateDialog from './components/ValidateDialog'
import MixinElTable from '@/components/MixinElTable'

export default {
  components: {
    ValidateDialog,
    Pagination
  },
  mixins: [MixinElTable],
  data() {
    return {
      userList: [
        {
          id: 1,
          account: 'david',
          name: 'David Huang',
          organization: '智慧系統研究所/物聯雲平台中心/交通分析組/工程師',
          email: 'david@iii.org.tw',
          apply_at: '2020-07-25T07:20:11Z',
          phone: '02-8654936'
        },
        {
          id: 1,
          account: 'cindywang',
          name: 'Cindy Wang',
          organization: '數位轉型研究所/數位平台中心/開源平台組/組長',
          email: 'david@iii.org.tw',
          apply_at: '2020-02-20T07:20:11Z',
          phone: '02-8654936'
        }
      ],
      validateDialogVisible: false,
      dialogTitle: '',
      search: '',
      editUserId: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        totalPage: 1
      },
      multipleSelection: []
    }
  },
  computed: {
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.userList.slice(start, end)
    }
  },
  async created() {
    // TODO: get project user list
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
    emitAddValidateDialogVisible(visible) {
      this.validateDialogVisible = visible
    },
    showValidateDialog() {
      this.validateDialogVisible = true
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="search" placeholder="Filter Name" style="width: 200px;"
                class="filter-item"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search">
        Search
      </el-button>
      <el-button type="danger" style="float: right" @click="showValidateDialog()">
        <i class="el-icon-close" />
        Reject
      </el-button>
      <el-button type="success" style="float: right">
        <i class="el-icon-check" />
        Approve
      </el-button>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      tooltip-effect="dark"
      height="100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" label="Account" width="120">
        <template slot-scope="scope">
          {{ scope.row.account }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Name" width="120">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Organization">
        <template slot-scope="scope">
          {{ scope.row.organization }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Email" width="200">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Apply Time" width="150">
        <template slot-scope="scope">
          {{ scope.row.apply_at.split('T')[0] }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Phone" width="150">
        <template slot-scope="scope">
          {{ scope.row.phone }}
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
    <validate-dialog
      :dialog-title="dialogTitle"
      :user-id="editUserId"
      :dialog-visible="validateDialogVisible"
      @validation-dialog-visible="emitAddValidateDialogVisible"
    />
  </div>
</template>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 5px;
}
</style>
