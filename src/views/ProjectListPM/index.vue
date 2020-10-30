<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import { formatTime } from '../../utils/index.js'
import { Message } from 'element-ui'

const formTemplate = {
  name: '',
  display: '',
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
      dialogDelete: false,
      dialogStatus: 1,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, // 總筆數
      searchData: '',
      form: formTemplate,
      rules: {
        name: [
          { required: true, message: 'Project Identifier is required', trigger: 'blur' },
          { required: true, pattern: /^[a-z][a-z0-9_-]{0,30}$/, message: 'Identifier is invalid.', trigger: 'blur' }
        ],
        display: [{ required: true, message: 'Project Name  is required', trigger: 'blur' }]
      },
      statusW: '50%',
      confirmLoading: false,
      Deleteproject: {},
      deleteProjectName: '',
      placeholdertext: '',
      loadingdelete: ''
    }
  },
  computed: {
    ...mapGetters(['projectList', 'projectListTotal', 'userId']),
    pagedData() {
      const listData = this.projectList.filter((data) => {
        if (this.searchData == '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
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
      this.dialogDelete = true
      this.Deleteproject['id'] = row.id
      this.Deleteproject['name'] = row.display
      this.placeholdertext = 'Please Input ' + this.Deleteproject.name
    },
    async handleDeleteModal() {
      if (this.Deleteproject.name !== this.deleteProjectName) {
        return this.$message({
          message: 'Please input project name correctly.',
          type: 'error'
        })
      } else {
        try {
          this.loadingdelete = this.$loading({
            target: '.el-dialog',
            text: 'Loading'
          })
          const res = await this['projects/deleteProject'](this.Deleteproject['id'])
          if (res.message !== 'success') {
            throw new Error()
          }
          this.$message({
            type: 'success',
            message: 'Delete Successed'
          })
          this.loadingdelete.close()
          this.dialogDelete = false
          this.loadList()
        } catch (err) {
          this.loadingdelete.close()
          console.error(err)
        }
      }
    },
    handleAdding() {
      this.dialogVisible = true
      this.dialogStatus = 1
      this.form.name = ''
      this.form.display = ''
      this.form.description = ''
      this.form.disabled = false
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
    onDialogClosedDelete() {
      this.deleteProjectName = ''
    },
    returnProgress(current, total) {
      const percent = Math.round((current / total) * 100)
      return percent
    },
    getLoadingBarClass(quality) {
      var loadClass
      if (quality <= 33) {
        loadClass = 'status-danger'
      } else if (quality <= 66) {
        loadClass = 'status-normal'
      } else if (quality <= 100) {
        loadClass = 'status-full'
      }

      return 'loading-box ' + loadClass
    },
    async handleConfirm() {
      const thiz = this
      this.$refs.thisForm.validate(async function(valid) {
        if (!valid) {
          return
        }
        //   this.dialogVisible = false
        if (thiz.dialogStatus === 2) return thiz.handleConfirmEdit()
        thiz.confirmLoading = true
        const dataBody = {
          name: thiz.form.name,
          display: thiz.form.display,
          description: thiz.form.description,
          disabled: thiz.form.disabled
        }
        const res = await thiz['projects/addNewProject'](dataBody)
        thiz.confirmLoading = false
        if (res.message !== 'success') return
        // console.log(res)
        Message({
          message: 'Project added successfully',
          type: 'success',
          duration: 1 * 1000
        })
        thiz.dialogVisible = false
        thiz.loadList()
      })
    },
    async handleConfirmEdit() {
      this.confirmLoading = true
      const dataBody = {
        pId: this.form.id,
        data: {
          display: this.form.display,
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
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        placeholder="Please input project name"
        style="width: 250px; float: right"
      ><i slot="prefix" class="el-input__icon el-icon-search" /></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column label="Name / Identifier" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <!-- <router-link
            :to="{
              name: 'cicdPipelines'
            }"
            style="color: #409EFF"
          > -->
          <span style="color: #67c23a">{{ scope.row.display }}</span>
          <br>
          <span style="color: #409eff">{{ scope.row.name }}</span>
          <!-- </router-link> -->
          <!-- <span>{{ scope.row.name }}</span> -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.project_status === '進行中'" type="success" size="medium">{{
            scope.row.project_status
          }}</el-tag>
          <el-tag v-else type="none" size="medium">{{ scope.row.project_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Progress" width="250px">
        <template slot-scope="scope">
          {{ scope.row.closed_count + '/' + scope.row.total_count }}
          <span
            class="status-bar-track"
          ><span
            class="status-bar"
            :style="'width:' + returnProgress(scope.row.closed_count, scope.row.total_count) + '%'"
          /></span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Quality" width="100px">
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
      </el-table-column> -->
      <el-table-column align="center" label="Update Time" width="170px">
        <template slot-scope="scope">
          {{ scope.row.updated_time | relativeTime }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="GitLab" width="100px">
        <template slot-scope="scope">
          <el-link v-if="scope.row.git_url" type="primary" :href="scope.row.git_url" target="_blank">GitLab</el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Redmine" width="100px">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.redmine_url"
            type="primary"
            :href="scope.row.redmine_url"
            target="_blank"
          >Redmine</el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" :show-overflow-tooltip="true" width="260">
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
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <router-view />
    <el-dialog
      title="Delete Project"
      :visible.sync="dialogDelete"
      width="40%"
      :close-on-click-modal="false"
      @closed="onDialogClosedDelete"
    >
      <p>This action can lead to data loss. To prevent accidental actions we ask you to confirm your intention.</p>
      <p>Please type <span style="padding: 2px 4px;color: #1f1f1f;background-color: #f2f2f2;border-radius: 4px;">{{ Deleteproject.name }}</span> to proceed or close this modal to cancel.</p>
      <el-input v-model="deleteProjectName" :placeholder="placeholdertext" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDelete = false">Cancel</el-button>
        <el-button type="danger" @click="handleDeleteModal">Delete</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="`${dialogStatusText} Project`"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @closed="onDialogClosed"
    >
      <el-form ref="thisForm" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Project Name" prop="display">
          <el-input v-model="form.display" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 1" label="Project Identifier" prop="name" style="margin-bottom: 0px">
          <el-input v-model="form.name" />
        </el-form-item>
        <br v-if="dialogStatus === 1">
        <div v-if="dialogStatus === 1">
          Length between 1 and 30 characters. Identifier can contain only lower case letters (a-z), digits, dash, underscores. It must start with letter.
        </div>
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
          <el-input v-model="form.description" type="textarea" placeholder="Please input description" />
        </el-form-item>
        <el-form-item label="Active" prop="disabled">
          <!-- <el-switch v-model="form.disabled" /> -->
          <el-switch
            v-model="form.disabled"
            :active-value="false"
            :inactive-value="true"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="Enable"
            inactive-text="Disable"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">Confirm</el-button>
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
