<script>
import { getInfo, getAllUser } from '@/api/user'
import Pagination from '@/components/Pagination'
import UserDialog from './components/UserDialog'

export default {
  components: {
    UserDialog,
    Pagination
  },
  data() {
    return {
      userList: [],
      userDialogVisible: false,
      dialogTitle: '',
      search: '',
      editUserId: 0,
      editUserData: {},
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, //總筆數
      searchData: ''
    }
  },
  computed: {
    pagedData() {
      const listData = this.userList.filter((data) => {
        if (this.searchData == '' || data.login.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const allUser = await getAllUser()
      this.userList = allUser.data.user_list
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    emitAddUserDialogVisible(visible, refresh) {
      this.userDialogVisible = visible
      if (refresh === 'refresh') {
        this.fetchData()
      }
    },
    async showUserDialog(user, title) {
      if (user === '') {
        this.editUserId = 0
        this.editUserData = {
          login: '',
          name: '',
          email: '',
          phone: '',
          role: { id: 1 },
          enable: true,
          status: 'enable'
        }
      } else {
        this.editUserId = user.id
        const userData = await getInfo(this.editUserId)
        this.editUserData = userData['data']
      }
      this.dialogTitle = title
      this.userDialogVisible = true
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" style="float: right; margin-bottom: 5px" @click="showUserDialog('', 'Add User')">
          <i class="el-icon-plus" />
          {{ $t('User.AddUser') }}
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('User.SearchAccount')"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"></i
      ></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border>
      <el-table-column align="center" :label="$t('User.Account')">
        <template slot-scope="scope">
          {{ scope.row.login }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Email">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.CreateTime')" width="150">
        <template slot-scope="scope">
          {{ scope.row.create_at.split('T')[0] }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('User.Phone')" width="150">
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Status')" width="100">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="showUserDialog(scope.row, 'Edit User')">
            <i class="el-icon-edit" />
            {{ $t('general.Edit') }}
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
    <user-dialog
      :dialog-title="dialogTitle"
      :user-id="editUserId"
      :user-data="editUserData"
      :dialog-visible="userDialogVisible"
      @add-user-visible="emitAddUserDialogVisible"
    />
  </div>
</template>
<style lang="scss">
.filter-container {
  margin-bottom: 5px;
}
</style>
