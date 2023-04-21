<template>
  <div class="app-container account-manage-table">
    <div class="flex justify-between">
      <el-button
        class="buttonSecondary"
        @click="showUserDialog('', 'Add User')"
      >
        <em class="el-icon-plus" />
        {{ $t('User.AddUser') }}
      </el-button>
      <el-input
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('User.SearchAccount')"
        style="width: 250px; float: right"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="userList"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      @row-click="clickEvent"
    >
      <el-table-column
        align="center"
        :label="$t('User.Account')"
        min-width="170"
        prop="login"
      />
      <el-table-column
        align="center"
        :label="$t('general.Name')"
        min-width="200"
        prop="name"
      />
      <el-table-column
        align="center"
        label="Email"
        prop="email"
        min-width="280"
      />
      <ElTableColumnTime
        :label="$t('general.CreateTime')"
        prop="create_at"
      />
      <el-table-column
        align="center"
        :label="$t('User.Phone')"
        width="160"
        prop="phone"
      />
      <ElTableColumnTag
        prop="status"
        min-width="120"
        size="small"
        location="accountManage"
      />
      <ElTableColumnTime
        align="center"
        :label="$t('User.LastLogin')"
        prop="last_login"
      />
      <el-table-column
        align="center"
        :label="$t('general.Actions')"
        width="250"
      >
        <template slot-scope="scope">
          <el-tooltip
            placement="bottom"
            :content="$t('general.Participate')"
          >
            <em
              class="ri-file-edit-line finished operate-button"
              @click="handleParticipateDialog(scope.row.id)"
            />
          </el-tooltip>
          <el-tooltip
            placement="bottom"
            :content="$t('general.Delete')"
          >
            <el-popconfirm
              :title="$t('Notify.confirmDelete')"
              :confirm-button-text="$t('general.Delete')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              @confirm="handleDelete(scope.row.id)"
            >
              <em
                slot="reference"
                class="ri-delete-bin-2-line danger operate-button"
              />
            </el-popconfirm>
          </el-tooltip>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="listQuery.total"
      :page="listQuery.current"
      :limit="listQuery.per_page"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
    <UserDialog
      :dialog-title="dialogTitle"
      :user-id="editUserId"
      :user-data="editUserData"
      :dialog-visible="userDialogVisible"
      @add-user-visible="emitAddUserDialogVisible"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { deleteUser, getUser, getUserInfo } from '@/api/user'
import { BasicData, SearchBar, Pagination } from '@/mixins'
import { ElTableColumnTime, ElTableColumnTag } from '@/components'
import UserDialog from './components/UserDialog'

export default {
  name: 'AccountManage',
  components: {
    ElTableColumnTime,
    ElTableColumnTag,
    UserDialog
  },
  mixins: [BasicData, SearchBar, Pagination],
  data() {
    return {
      storageName: 'participate',
      storageType: ['SearchBar'],
      userDialogVisible: false,
      dialogTitle: '',
      editUserId: 0,
      editUserData: {},
      params: {
        page: 1,
        per_page: 10,
        search: this.keyword
      },
      userList: []
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  watch: {
    async keyword(value) {
      this.params.search = value
      this.params.page = 1
      this.storeKeyword()
      await this.loadData()
    }
  },
  methods: {
    async fetchData() {
      const allUser = await getUser(this.params)
      this.listQuery = allUser.page
      this.userList = allUser.user_list.filter(item => item.id !== this.userId)
    },
    async onPagination(query) {
      const { page, limit } = query
      this.params.page = page
      this.params.per_page = limit
      await this.loadData()
    },
    emitAddUserDialogVisible(visible, refresh, edit) {
      this.userDialogVisible = visible
      if (refresh === 'refresh') {
        if (!edit) {
          this.params.page = 1
          this.clearKeyword()
        }
        this.loadData()
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
        this.editUserData = await getUserInfo(this.editUserId)
      }
      this.dialogTitle = title
      this.userDialogVisible = true
    },
    async handleDelete(userId) {
      try {
        await deleteUser(userId)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        this.loadData()
      } catch (error) {
        console.error(error)
      }
    },
    clickEvent(row, column) {
      if (column.label !== this.$t('general.Actions')) this.showUserDialog(row, 'Edit User')
    },
    handleParticipateDialog(user_id) {
      this.$router.push({
        name: 'ParticipateProject',
        params: { userId: user_id }
      })
    }
  }
}
</script>
