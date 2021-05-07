<template>
  <div class="app-container">
    <div class="clearfix">
      <!-- <project-list-selector /> -->
      <span class="newBtn">
        <el-button type="success" style="float: right; margin-bottom: 5px" @click="showUserDialog('', 'Add User')">
          <i class="el-icon-plus" />
          {{ $t('User.AddUser') }}
        </el-button>
      </span>
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
      border
      fit
      highlight-current-row
      height="100%"
    >
      <el-table-column align="center" :label="$t('User.Account')" min-width="170" prop="login" />
      <el-table-column align="center" :label="$t('general.Name')" min-width="200" prop="name" />
      <el-table-column align="center" label="Email" prop="email" min-width="250" />
      <el-table-column-time :label="$t('general.CreateTime')" prop="create_at" />
      <el-table-column align="center" :label="$t('User.Phone')" width="160" prop="phone" />
      <el-table-column align="center" :label="$t('general.Status')" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'enable'" class="el-tag--circle" type="finish" size="small" effect="dark">
            {{ scope.row.status }}
          </el-tag>
          <el-tag
            v-else-if="scope.row.status === 'disable'"
            class="el-tag--circle"
            type="danger"
            size="small"
            effect="dark"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')" width="210">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="showUserDialog(scope.row, 'Edit User')">
            <i class="el-icon-edit" />
            {{ $t('general.Edit') }}
          </el-button>
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(scope.row.id)"
          >
            <el-button slot="reference" size="mini" type="danger">
              <i class="el-icon-delete" /> {{ $t('general.Delete') }}
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
import { deleteUser, getUser, getInfo } from '@/api/user'
import UserDialog from './components/UserDialog'
import MixinAccountManageTable from '@/mixins/MixinAccountManageTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'AccountManage',
  components: {
    UserDialog,
    ElTableColumnTime
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
      this.listQuery = allUser.data.page
      return allUser.data.user_list.filter(item => item.id !== this.userId)
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
        const userData = await getInfo(this.editUserId)
        this.editUserData = userData['data']
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
    }
  }
}
</script>
