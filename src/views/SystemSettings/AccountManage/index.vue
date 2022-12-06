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
        @input="onSearch"
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
          <el-button
            size="mini"
            class="buttonPrimaryReverse"
            @click="handleParticipateDialog(scope.row.id)"
          >
            <em class="el-icon-edit" />
            {{ $t('general.Participate') }}
          </el-button>
          <el-popconfirm
            :title="$t('Notify.confirmDelete')"
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            @confirm="handleDelete(scope.row.id)"
          >
            <el-button slot="reference" size="mini" type="danger">
              <em class="el-icon-delete" /> {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
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
import { BasicData, Pagination } from '@/mixins'
import { deleteUser, getUser, getUserInfo } from '@/api/user'
import UserDialog from './components/UserDialog'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'

export default {
  name: 'AccountManage',
  components: {
    UserDialog,
    ElTableColumnTime,
    ElTableColumnTag
  },
  mixins: [BasicData, Pagination],
  data() {
    return {
      userDialogVisible: false,
      dialogTitle: '',
      editUserId: 0,
      editUserData: {},
      keyword: '',
      params: {
        page: 1,
        per_page: 10,
        search: ''
      },
      userList: []
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'ParticipateProject') {
      next((vm) => {
        vm.keyword = sessionStorage.getItem('accountKeyword')
        sessionStorage.removeItem('accountKeyword')
      })
    } else {
      next()
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'ParticipateProject') {
      sessionStorage.setItem('accountKeyword', this.keyword)
    }
    next()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const allUser = await getUser(this.params)
      this.listQuery = allUser.page
      this.userList = allUser.user_list.filter(item => item.id !== this.userId)
      this.listLoading = false
    },
    async onSearch(keyword) {
      this.params.search = keyword
      this.params.page = 1
      await this.fetchData()
    },
    async onPagination(query) {
      const { page, limit } = query
      this.params.page = page
      this.params.per_page = limit
      await this.fetchData()
    },
    emitAddUserDialogVisible(visible, refresh, edit) {
      this.userDialogVisible = visible
      if (refresh === 'refresh') {
        if (edit) {
          this.fetchData()
        } else {
          this.params.page = 1
          this.fetchData()
        }
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
        this.fetchData()
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
