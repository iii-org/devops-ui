<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import {
  getTestCaseByProject,
  addTestCaseByProject,
  updateTestCase,
  deleteTestCase,
  getTestCaseAPIMethod,
  getTestCaseType
} from '@/api/testCase'
import ProjectListSelector from '../../components/ProjectListSelector'

const formTemplate = {
  name: '',
  method_id: '',
  type_id: '',
  url: '',
  description: ''
}

export default {
  components: { ProjectListSelector, Pagination },
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
      testCaseList: [],
      dialogVisible: false,
      dialogStatus: 1,
      listLoading: true,
      listQuery: {
        page: 1, //目前第幾頁
        limit: 10 //一頁幾筆
      },
      listTotal: 0, //總筆數
      testCaseForm: formTemplate,
      confirmLoading: false,
      searchData: '',
      testCaseTypeList: [],
      testCaseAPIMethodList: [],
      testCaseFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        type_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        method_id: [{ required: true, message: 'Please select method', trigger: 'blur' }],
        url: [{ required: true, message: 'Please input url', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId', 'userRole']),
    pagedData() {
      const listData = this.testCaseList.filter((data) => {
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
  watch: {
    projectSelectedId() {
      this.fetchData()
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      Promise.all([getTestCaseType(), getTestCaseAPIMethod(), getTestCaseByProject(this.projectSelectedId)])
        .then((res) => {
          this.testCaseTypeList = res[0].data.map((item) => {
            return { label: item.name, value: item.test_case_type_id }
          })
          this.testCaseAPIMethodList = res[1].data.map((item) => {
            return { label: item.name, value: item.Http_Method_id }
          })
          this.testCaseList = res[2].data
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.dialogStatus = 2
      row['method_id'] = row['data']['method_id']
      row['url'] = row['data']['url']
      console.log('row', row)
      this.testCaseForm = Object.assign({}, this.testCaseForm, row)
    },
    async handleDelete(idx, row) {
      await deleteTestCase(row['id'])
      this.fetchData()
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
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['testCaseForm'].resetFields()
        this.form = formTemplate
      })
    },
    handleConfirm() {
      this.$refs['testCaseForm'].validate(async (valid) => {
        if (valid) {
          const apiTypeObj = this.testCaseTypeList.find((type) => {
            return type.value === this.testCaseForm.type_id
          })
          const apiMethodObj = this.testCaseAPIMethodList.find((method) => {
            return method.value === this.testCaseForm.method_id
          })
          const testCaseData = Object.assign({}, this.testCaseForm)
          testCaseData['data'] = {
            type: apiTypeObj['label'],
            url: this.testCaseForm['url'],
            method: apiMethodObj['label'],
            method_id: apiMethodObj['value']
          }
          testCaseData['project_id'] = this.projectSelectedId
          if (this.dialogStatus == 1) {
            await addTestCaseByProject(this.projectSelectedId, testCaseData)
          } else {
            await updateTestCase(testCaseData['id'], testCaseData)
          }
          this.$refs['testCaseForm'].resetFields()
          this.dialogVisible = false
          this.fetchData()
        } else {
          return false
        }
      })
    },
    handleDetail(idx, row) {
      this.$router.push({ path: `test-case/${row.id}` })
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <span class="newBtn" v-if="userRole === 'Engineer'">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Test Case
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        placeholder="Please input test item name"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"></i
      ></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row :data="pagedData">
      <el-table-column align="center" label="Id" width="120px">
        <template slot-scope="scope"> {{ scope.row.id }} </template>
      </el-table-column>
      <el-table-column align="center" label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Desc." :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Method" width="120px">
        <template slot-scope="scope"> {{ scope.row.data.method }} </template>
      </el-table-column>
      <el-table-column align="center" label="Path">
        <template slot-scope="scope"> {{ scope.row.data.url }} </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Last Test Time" width="150px">
        <template slot-scope="scope">
          {{ scope.row.update_at | relativeTime }}
        </template>
      </el-table-column> -->
      <!-- <el-table-column align="center" label="Last Test Result" width="150px">
        <template slot-scope="scope">
          <el-tag :type="returnTagType(scope.row)" size="large">
            <i v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <i v-else-if="returnTagType(scope.row) === 'danger'" class="el-icon-error" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="Actions" width="350" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="handleDetail(scope.$index, scope.row)">
            <i class="el-icon-document" />
            Test Item
          </el-button>
          <el-button
            v-if="userRole === 'Engineer'"
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)"
          >
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button v-if="userRole === 'Engineer'" slot="reference" size="mini" type="danger">
              <i class="el-icon-delete" /> Delete</el-button
            >
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
    <router-view />
    <el-dialog
      :title="`${dialogStatusText} Test Case`"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form
        label-position="top"
        ref="testCaseForm"
        :model="testCaseForm"
        :rules="testCaseFormRules"
        label-width="20%"
      >
        <el-form-item label="API Name" prop="name">
          <el-input v-model="testCaseForm.name"></el-input>
        </el-form-item>
        <el-form-item label="API Method" prop="method_id">
          <el-select v-model="testCaseForm.method_id" style="width: 100%">
            <el-option
              v-for="item in testCaseAPIMethodList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="API Type" prop="type_id">
          <el-select v-model="testCaseForm.type_id" style="width: 100%">
            <el-option v-for="item in testCaseTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Url" prop="url">
          <el-input v-model="testCaseForm.url"></el-input>
        </el-form-item>
        <el-form-item label="Desc." prop="description">
          <el-input v-model="testCaseForm.description"></el-input>
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
