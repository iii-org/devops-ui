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
      userList: [
        {
          id: 2,
          name: 'becky',
          usernmae: 'beckywu',
          email: 'hubert@iii.org.tw',
          phone: '933333666',
          login: 'becky',
          create_at: '2020-06-18T02:59:12.408067',
          status: '運行中'
        },
        {
          id: 4,
          name: 'hubert',
          usernmae: 'hubert',
          email: 'hubert@iii.org.tw',
          phone: '933333666',
          login: 'hubert',
          create_at: '2020-08-06T02:59:41.834495',
          status: '運行中'
        }
      ],
      userDialogVisible: false,
      dialogTitle: '',
      search: '',
      editUserId: 0,
      editUserData: {},
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  computed: {
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.userList.slice(start, end)
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
      if (refresh === 'refresh') { this.fetchData() }
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
          enable: true
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
    <div class="filter-container">
      <!-- <el-input v-model="search" placeholder="Filter Name" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search">
        Search
      </el-button> -->
      <el-button type="success" style="float: right;margin-bottom:5px" @click="showUserDialog('', 'Add User')">
        <i class="el-icon-plus" />
        Add User
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border>
      <el-table-column align="center" label="Account">
        <template slot-scope="scope">
          {{ scope.row.login }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Email">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Create Time" width="150">
        <template slot-scope="scope">
          {{ scope.row.create_at.split('T')[0] }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Phone" width="150">
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Disabled" width="100">
        <template slot-scope="scope">
          {{ scope.row.disabled }}
        </template>
      </el-table-column> -->
      <el-table-column label="Actions" align="center" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="showUserDialog(scope.row, 'Edit User')">
            <i class="el-icon-edit" />
            Edit
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="userList.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[10]"
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
