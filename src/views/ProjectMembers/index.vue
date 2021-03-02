<script>
import { mapGetters } from 'vuex'
import { Message } from 'element-ui'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { getProjectUserList, getNotInProject, addProjectMember, deleteProjectMember } from '@/api/projects'

const formTemplate = {
  // role_name: 'Engineer',
  // status: false,
  id: ''
}

export default {
  name: 'ProjectMembers',
  components: { Pagination, ProjectListSelector },
  data: () => ({
    listLoading: true,
    dialogVisible: false,
    userList: [],
    assignableUsers: [],
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',
    dialogStatus: 1,
    memberConfirmLoading: false,
    form: formTemplate,
    roleName: '',
    userInfo: {},
    rules: { id: [{ required: true, message: 'Please select a member', trigger: 'change' }] }
  }),
  computed: {
    ...mapGetters(['projectSelectedId', 'userId']),
    pagedData() {
      // const start = (this.listQuery.page - 1) * this.listQuery.limit
      // const end = start + this.listQuery.limit - 1
      // return this.userList.slice(start, end)
      const listData = this.userList.filter(data => {
        if (this.searchData === '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    },
    dialogStatusText() {
      switch (this.dialogStatus) {
        case 1:
          return 'Add'
        case 2:
          return 'Edit'
        default:
          return 'Null'
      }
    }
  },
  watch: {
    projectSelectedId(projectId) {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    'form.id'(value) {
      this.roleName = this.userInfo[this.form.id]
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      try {
        const res = await getProjectUserList(this.projectSelectedId)
        const res_assignable = await getNotInProject(this.projectSelectedId)
        this.userList = res.data.user_list
        this.assignableUsers = res_assignable.data.user_list
        for (const i in this.assignableUsers) {
          this.userInfo[this.assignableUsers[i].id] = this.assignableUsers[i].role_name
        }
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
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
            await addProjectMember(this.projectSelectedId, { user_id: this.form.id })
            Message({
              message: 'Member added successfully',
              type: 'success'
            })
            this.fetchData()
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
        await deleteProjectMember(this.projectSelectedId, row.id)
        Message({
          message: 'Member deleted',
          type: 'success'
        })
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['thisForm'].resetFields()
        this.form = formTemplate
      })
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          {{ $t('Member.AddMember') }}
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit>
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
      <!-- <el-table-column label="Status" >
        <template slot-scope="scope">
          {{ scope.row.status ? '啟用' : '停用' }}
        </template>
      </el-table-column> -->
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
    <pagination
      :total="listTotal"
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
        <el-form-item :label="$t('general.Name')" prop="id">
          <el-select v-model="form.id" :placeholder="$t('Member.SelectMember')" filterable>
            <el-option v-for="item in assignableUsers" :key="item.id" :label="item.login" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Member.Role')" prop="role_name">
          <!-- <el-select v-model="form.role_name" placeholder="Select a role" style="width:100%">
            <el-option label="Engineer" value="Engineer"></el-option>
            <el-option label="Project Manager" value="Project Manager"></el-option>
          </el-select> -->
          <div>
            {{ roleName }}
          </div>
        </el-form-item>
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

<style lang="scss">
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
</style>
