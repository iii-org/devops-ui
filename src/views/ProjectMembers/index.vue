<script>
import { mapGetters, mapActions } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { getProjectUserList, getNotInProject, addProjectMember, deleteProjectMember } from '@/api/projects'
import { Message } from 'element-ui'

const formTemplate = {
  role_name: 'Engineer',
  status: false,
  id: ''
}

export default {
  components: { Pagination, ProjectListSelector },
  data() {
    return {
      listLoading: true,
      dialogVisible: false,
      userList: [],
      assignableUsers: [],
      listQuery: {
        page: 1,
        limit: 10,
        totalPage: 1
      },
      dialogStatus: 1,
      memberConfirmLoading: false,
      form: formTemplate
    }
  },
  watch: {
    projectSelectedId(projectId) {
      this.fetchData()
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.userList.slice(start, end)
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
      console.log(this.form)
      try {
        this.memberConfirmLoading = true
        await addProjectMember(this.projectSelectedId, { user_id: this.form.id })
        Message({
          message: 'Member added successfully',
          type: 'success',
          duration: 1 * 3000
        })
        this.fetchData()
        this.dialogVisible = false
      } catch (error) {
        console.error(error)
      }
      this.memberConfirmLoading = false
    },
    async handleDelete(id, row) {
      this.listLoading = true
      try {
        await deleteProjectMember(this.projectSelectedId, row.id)
        Message({
          message: 'Member deleted',
          type: 'success',
          duration: 1 * 3000
        })
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
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
    <div>
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Member
        </el-button>
      </span>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column align="center" label="No" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          #{{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Role" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.role_name }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="Status" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.status ? '啟用' : '停用' }}
        </template>
      </el-table-column> -->
      <el-table-column label="Actions" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)" :disabled="true">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-popconfirm
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            icon="el-icon-info"
            iconColor="red"
            title="Are you sure?"
            @onConfirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button size="mini" type="danger" slot="reference"> <i class="el-icon-delete" /> Delete</el-button>
          </el-popconfirm>
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

    <el-dialog :title="`${dialogStatusText} Member`" :visible.sync="dialogVisible" width="50%" @closed="onDialogClosed">
      <el-form ref="thisForm" :model="form" label-position="top">
        <el-form-item label="Name" prop="id">
          <el-select v-model="form.id" placeholder="select a Member">
            <el-option v-for="item in assignableUsers" :key="item.id" :label="item.login" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Role" prop="role_name">
          <el-select v-model="form.role_name" placeholder="Select a role" style="width:100%">
            <el-option label="Engineer" value="Engineer"></el-option>
            <el-option label="Project Manager" value="Project Manager"></el-option>
          </el-select>
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
        <el-form-item label="Status" prop="status">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item>
        <!-- <el-form-item label="Description" prop="desc">
          <el-input type="textarea" v-model="form.desc"></el-input>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="memberConfirmLoading">Confirm</el-button>
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
