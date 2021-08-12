<template>
  <div class="app-container account-manage-table" style="overflow: hidden;">
    <div class="flex justify-between">
      <el-button type="success" @click="showUserDialog('', 'Add User')">
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
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      height="100%"
      @row-click="clickEvent"
    >
      <el-table-column align="center" :label="$t('User.Account')" min-width="170" prop="login" />
      <el-table-column align="center" :label="$t('general.Name')" min-width="200" prop="name" />
      <el-table-column align="center" label="Email" prop="email" min-width="250" />
      <el-table-column-time :label="$t('general.CreateTime')" prop="create_at" />
      <el-table-column align="center" :label="$t('User.Phone')" width="160" prop="phone" />
      <el-table-column-tag
        prop="status"
        min-width="120"
        size="small"
        location="accountManage"
      />
      <el-table-column align="center" :label="$t('general.Actions')" width="230">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleParticipateDialog(scope.row.id)">
            <em class="el-icon-edit" />
            {{ $t('general.Participate') }}
          </el-button>
          <el-popconfirm
            :title="$t('Notify.confirmDelete')"
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            @onConfirm="handleDelete(scope.row.id)"
          >
            <el-button slot="reference" size="mini" type="danger">
              <em class="el-icon-delete" /> {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="listQuery.total ? listQuery.total : 1"
      :page="listQuery.current"
      :limit="listQuery.per_page"
      :page-sizes="[listQuery.per_page]"
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

<script>
import { mapGetters } from 'vuex'
import { deleteUser, getUser, getUserInfo } from '@/api/user'
import UserDialog from './components/UserDialog'
import MixinAccountManageTable from '@/mixins/MixinAccountManageTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'

export default {
  name: 'AccountManage',
  components: {
    UserDialog,
    ElTableColumnTime,
    ElTableColumnTag
  },
  mixins: [MixinAccountManageTable],
  data() {
    return {
      userDialogVisible: false,
      dialogTitle: '',
      search: '',
      searchKeys: ['login', 'name'],
      editUserId: 0,
      editUserData: {}
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  methods: {
    async fetchData(page, per_page, search) {
      const allUser = await getUser(page, per_page, search)
      this.listQuery = allUser.page
      return allUser.user_list.filter(item => item.id !== this.userId)
    },
    emitAddUserDialogVisible(visible, refresh) {
      this.userDialogVisible = visible
      if (refresh === 'refresh') {
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
        this.keyword = ''
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
    },
    clickEvent(row, column) {
      if (column.label !== this.$t('general.Actions')) this.showUserDialog(row, 'Edit User')
    },
    handleParticipateDialog(user_id) {
      this.$router.push({ name: 'SystemParticipateProject', params: { user_id }})
    }
  }
}
</script>
