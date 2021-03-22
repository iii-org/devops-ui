<template>
  <div>
    <el-card>
      <div slot="header" class="d-flex justify-space-between">
        <span>{{ $t('Member.Manage') }}</span>
        <el-button type="success" icon="el-icon-plus" size="small" @click="handleAdding">
          {{ $t('Member.AddMember') }}
        </el-button>
      </div>
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        border
        fit
        height="25vh"
      >
        <el-table-column align="center" :label="$t('Member.Id')" min-width="40">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('Member.Account')" min-width="70">
          <template slot-scope="scope">
            {{ scope.row.login }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Name')" min-width="70">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('Member.Phone')" min-width="80">
          <template slot-scope="scope">
            {{ scope.row.phone }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('Member.Role')" min-width="80">
          <template slot-scope="scope">
            {{ scope.row.role_name }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Actions')" align="center" min-width="50">
          <template slot-scope="scope">
            <span v-if="false">
              <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
                <i class="el-icon-edit" />
                {{ $t('general.Edit') }}
              </el-button>
            </span>
            <el-popconfirm
              confirm-button-text="Delete"
              cancel-button-text="Cancel"
              icon="el-icon-info"
              icon-color="red"
              title="Are you sure?"
              @onConfirm="handleDelete(scope.$index, scope.row)"
            >
              <el-button slot="reference" size="mini" type="danger" :disabled="scope.row.id == userId">
                <i class="el-icon-delete" /> {{ $t('general.Delete') }}
              </el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <pagination
      :total="listData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog
      :title="$t(`Member.${dialogStatusText}Member`)"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @closed="onDialogClosed"
    >
      <el-form ref="thisForm" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item :label="$t('general.Name')" prop="id">
              <el-select
                v-model="form.id"
                :placeholder="$t('Member.SelectMember')"
                style="width: 100%"
                filterable
                :filter-method="filterMethod"
                @visible-change="handleVisibleChange"
              >
                <el-option v-for="user in filteredOptions" :key="user.id" :label="user.name" :value="user.id">
                  <span style="float: left">{{ user.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ user.login }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('Member.Role')" prop="role_name">
              <el-input :value="roleName" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <el-form-item label="Duration">
          <el-col :span="11">
            <el-form-item prop="start_date">
              <el-date-picker type="date" placeholder="Start Date" v-model="form.start_date" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"> - </el-col>
          <el-col :span="11">
            <el-form-item prop="end_date">
              <el-date-picker type="date" placeholder="End Date" v-model="form.end_date" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-form-item> -->
        <!-- <el-form-item label="Authorization">
          <el-switch v-model="form.authorization"></el-switch>
        </el-form-item> -->
        <!-- <el-form-item label="Status" prop="status">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item> -->
        <!-- <el-form-item label="Description" prop="desc">
          <el-input type="textarea" v-model="form.desc"></el-input>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" :loading="memberConfirmLoading" @click="handleConfirm">{{
          $t('general.Confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { addProjectMember, deleteProjectMember, getNotInProject, getProjectUserList } from '@/api/projects'
import i18n from '@/lang'
import Pagination from '@/components/Pagination'

const formTemplate = {
  // role_name: 'Engineer',
  // status: false,
  id: ''
}

export default {
  name: 'ProjectMembers',
  components: { Pagination },
  data: () => ({
    dialogVisible: false,
    assignableUsers: [],
    dialogStatus: 1,
    memberConfirmLoading: false,
    form: formTemplate,
    roleName: '',
    userInfo: {},
    rules: {
      id: [{ required: true, message: i18n.t('RuleMsg.PleaseInput') + i18n.t('RuleMsg.Member'), trigger: 'change' }]
    },
    query: '',

    listData: [],
    listLoading: true,
    listQuery: {
      page: 1,
      limit: 10
    }
  }),
  computed: {
    ...mapGetters(['userId', 'selectedProject']),
    dialogStatusText() {
      switch (this.dialogStatus) {
        case 1:
          return 'Add'
        case 2:
          return 'Edit'
        default:
          return 'Null'
      }
    },
    filteredOptions() {
      if (this.query) {
        return this.assignableUsers.filter(user => user.name.includes(this.query) || user.login.includes(this.query))
      } else {
        return this.assignableUsers
      }
    },

    selectedProjectId() {
      return this.selectedProject.id
    },
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return this.listData.slice(start, end)
    }
  },
  watch: {
    'form.id'(value) {
      this.roleName = this.userInfo[this.form.id]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      try {
        const res = await getProjectUserList(this.selectedProjectId)
        const res_assignable = await getNotInProject(this.selectedProjectId)
        const userList = res.data.user_list
        this.assignableUsers = res_assignable.data.user_list
        for (const i in this.assignableUsers) {
          this.userInfo[this.assignableUsers[i].id] = this.assignableUsers[i].role_name
        }
        this.listData = userList
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    handleAdding() {
      this.dialogVisible = true
      this.dialogStatus = 1
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.dialogStatus = 2
      this.form = Object.assign({}, this.form, row)
    },
    async handleConfirm() {
      this.$refs.thisForm.validate(async valid => {
        if (valid) {
          try {
            this.memberConfirmLoading = true
            await addProjectMember(this.selectedProjectId, { user_id: this.form.id })
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Added'),
              type: 'success'
            })
            await this.fetchData()
            this.dialogVisible = false
          } catch (error) {
            console.error(error)
          }
          this.memberConfirmLoading = false
        }
      })
    },
    async handleDelete(id, row) {
      this.listLoading = true
      try {
        await deleteProjectMember(this.selectedProjectId, row.id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.fetchData()
      } catch (error) {
        console.error(error)
      }
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['thisForm'].resetFields()
        this.form = formTemplate
      })
    },
    filterMethod(query) {
      this.query = query
    },
    handleVisibleChange(status) {
      if (status) this.query = ''
    },

    onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
</script>
