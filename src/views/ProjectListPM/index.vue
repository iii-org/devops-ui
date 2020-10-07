<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import { formatTime } from '../../utils/index.js'
import { Message } from 'element-ui'

const formTemplate = {
  name: '',
  code: '',
  amount: 0,
  ppm: 0,
  disabled: false,
  description: ''
}

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogStatus: 1,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      form: formTemplate,
      confirmLoading: false,
      statusW: "50%",
      rules: {
        name: [
          { required: true, message: '請輸入Project Name', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['projectList', 'projectListTotal', 'userId']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.projectList.slice(start, end)
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
  async created() {
    this.loadList()
  },
  methods: {
    ...mapActions([
      'projects/queryProjectList',
      'projects/addNewProject',
      'projects/editProject',
      'projects/deleteProject'
    ]),
    async loadList() {
      this.listLoading = true
      await this['projects/queryProjectList']()
      this.listLoading = false
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.dialogStatus = 2
      this.form = Object.assign({}, this.form, row)
    },
    handleDelete(index, row) {
      this.$confirm('Are you sure to Delete Project?', 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      })
        .then(async () => {
          await this['projects/deleteProject'](row.id)
          this.$message({
            type: 'success',
            message: 'Delete Successed'
          })
          this.loadList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          })
        })
    },
    handleAdding() {
      this.dialogVisible = true
      this.dialogStatus = 1
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'No Test'
      return success + ' / ' + total
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    returnLatestTag(row) {
      const { tags } = row
      if (!tags || tags.length === 0) return 'No Tag'
      return tags[0].name
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['thisForm'].resetFields()
        this.form = formTemplate
      })
    },
    returnProgress(current,total) {
      const percent = Math.round((current / total) * 100);
      return percent
    },
    getLoadingBarClass(quality){
      var loadClass;
      if(quality <= 33){
        loadClass = "status-danger";
      }else if(quality <= 66){
        loadClass = "status-normal";
      }else if(quality <= 100){
        loadClass = "status-full";
      }

      return "loading-box " + loadClass
    },
    async handleConfirm() {
      //   this.dialogVisible = false
      if (this.dialogStatus === 2) return this.handleConfirmEdit()
      this.confirmLoading = true
      console.log(this.form)
      const dataBody = {
        name: this.form.name,
        description: this.form.description,
        disabled: this.form.disabled
      }
      const res = await this['projects/addNewProject'](dataBody)
      this.confirmLoading = false
      if (res.message !== 'success') return
      console.log(res)
      Message({
        message: 'Project added successfully',
        type: 'success',
        duration: 1 * 1000
      })
      this.dialogVisible = false
      this.loadList()
    },
    async handleConfirmEdit() {
      this.confirmLoading = true
      const dataBody = {
        pId: this.form.id,
        data: {
          name: this.form.name,
          description: this.form.description,
          disabled: this.form.disabled,
          user_id: this.userId
        }
      }
      const res = await this['projects/editProject'](dataBody)
      this.confirmLoading = false
      if (res.message !== 'success') return
      console.log(res)
      Message({
        message: 'Project update successfully',
        type: 'success',
        duration: 1 * 1000
      })
      this.dialogVisible = false
      this.loadList()
    },
    myFormatTime(time) {
      return formatTime(new Date(time))
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Project
        </el-button>
      </span>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <!-- <router-link
            :to="{
              name: 'cicdPipelines'
            }"
            style="color: #409EFF"
          > -->
          <span style="color: #409EFF">{{ scope.row.name }}</span>
          <!-- </router-link> -->
          <!-- <span>{{ scope.row.name }}</span> -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="144">
        <template slot-scope="scope">
          <span v-if="scope.row.project_status == '進行中'" class="status-btn status-pending">{{ scope.row.project_status }}</span>
          <span v-else="scope.row.project_status != '進行中'" class="status-btn status-none">{{ scope.row.project_status }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Progress">
        <template slot-scope="scope">
          {{ scope.row.closed_count + '/' + scope.row.total_count }}
          <span class="status-bar-track"><span class="status-bar" :style="'width:'+ returnProgress(scope.row.closed_count,scope.row.total_count) +'%'"></span></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Quality">
        <template slot-scope="scope">
          <div class="d-flex">
            <span class="quality-text">{{ '87%' }}</span>
            <span v-bind:class="getLoadingBarClass(87)">
              <span class="loading-bar"></span>
              <span class="loading-bar"></span>
              <span class="loading-bar"></span>
              <span class="loading-bar"></span>
              <span class="loading-bar"></span>
              <span class="loading-bar"></span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Update Time">
        <template slot-scope="scope">
          {{ myFormatTime(scope.row.updated_time) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" /> Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="projectListTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <router-view />
    <el-dialog
      :title="`${dialogStatusText} Project`"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form ref="thisForm" :rules="rules" :model="form" label-position="top">
        <el-form-item label="Project Name" prop="name">
          <el-input v-model="form.name" placeholder="Name"></el-input>
        </el-form-item>
        <!-- <el-form-item label="Project Code" prop="code">
          <el-input v-model="form.code"></el-input>
        </el-form-item> -->
        <!-- <el-form-item v-if="dialogStatus === 2" label="Project Owner" prop="owner">
          <el-input v-model="form.owner"></el-input>
        </el-form-item> -->
        <!-- <el-col :span="11">
          <el-form-item label="Project Amount" prop="amount">
            <el-input type="number" v-model="form.amount"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="2">&nbsp;</el-col>
        <el-col :span="11">
          <el-form-item label="Human Resource/Month" prop="ppm">
            <el-input type="number" v-model="form.ppm"></el-input>
          </el-form-item>
        </el-col> -->
        <el-form-item label="Description" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="Please input description"></el-input>
        </el-form-item>
        <el-form-item label="Disabled" prop="disabled">
          <el-switch v-model="form.disabled"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="confirmLoading">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.clearfix {
  clear: both;
  .newBtn {
    float: right;
    padding-right: 6px;
  }
}
</style>
