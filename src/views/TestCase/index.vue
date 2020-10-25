<script>
import Pagination from '@/components/Pagination'
import { getTestItemById } from '@/api/testItem'
import { getTestCase, addTestCase, getTestValue, addTestValue } from '@/api/testCase'

const testCaseFormTemplate = {
  name: ''
}

const testValueFormTemplate = {
  type: '',
  location: '',
  key: '',
  value: ''
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
      activeName: 'testCase',
      testItem: {},
      testCaseList: [],
      testCaseDialogVisible: false,
      testValueList: [],
      testValueDialogVisible: false,
      listLoading: true,
      listQuery: {
        page: 1, //目前第幾頁
        limit: 10 //一頁幾筆
      },
      listTotal: 0, //總筆數
      testCaseForm: testCaseFormTemplate,
      testValueForm: testValueFormTemplate,
      confirmLoading: false,
      searchData: '',
      dialogStatus: 1,
      testValueTypeList: [
        {
          value: 'Request',
          label: 'Request'
        },
        {
          value: 'Response',
          label: 'Response'
        }
      ],
      testValueLocationList: [
        {
          value: 'Header',
          label: 'Header'
        },
        {
          value: 'Body',
          label: 'Body'
        }
      ],
      testCaseFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }]
      },
      testValueFormRules: {
        type: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        location: [{ required: true, message: 'Please select location', trigger: 'blur' }],
        key: [{ required: true, message: 'Please select key', trigger: 'blur' }],
        value: [{ required: true, message: 'Please select value', trigger: 'blur' }]
      }
    }
  },
  computed: {
    pagedData() {
      const listData = this.testItemList.filter((data) => {
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
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Promise.all([getTestItemById(), getTestCase(), getTestValue()]).then((res) => {
        this.testItem = res[0].data
        this.testCaseList = res[1].data
        this.testValueList = res[2].data
        this.listLoading = false
      })
    },
    handleTestCaseAdding() {
      this.testCaseDialogVisible = true
      this.dialogStatus = 1
    },
    handleTestCaseEdit(idx, row) {
      this.testCaseDialogVisible = true
      this.dialogStatus = 2
      this.testCaseForm = Object.assign({}, this.testCaseForm, row)
    },
    handleDelete() {},
    handleTestValueAdding() {
      this.testValueDialogVisible = true
      this.dialogStatus = 1
    },
    handleTestValueEdit(idx, row) {
      this.testValueDialogVisible = true
      this.dialogStatus = 2
      this.testValueForm = Object.assign({}, this.testValueForm, row)
    },
    handleDelete() {},
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
        this.$refs['testValueForm'].resetFields()
        this.testCaseForm = testCaseFormTemplate
        this.testValueForm = testValueFormTemplate
      })
    },
    handleTestCaseConfirm() {
      this.$refs['testCaseForm'].validate(async (valid) => {
        if (valid) {
          await addTestCase(this.testCaseForm)
          this.$refs['testCaseForm'].resetFields()
          this.testCaseDialogVisible = false
        } else {
          return false
        }
      })
    },
    handleTestValueConfirm() {
      this.$refs['testValueForm'].validate(async (valid) => {
        if (valid) {
          await addTestValue(this.testValueForm)
          this.$refs['testValueForm'].resetFields()
          this.testValueDialogVisible = false
        } else {
          return false
        }
      })
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-card class="box-card el-col-6 column custom-list" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px; padding-bottom: 10px">Test Item</span>
      </div>
      <el-form :label-position="'left'">
        <el-row>
          <el-col>
            <el-form-item label="Name">{{ testItem.name }} </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Method">
              {{ testItem.api_method }}
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Path">
              {{ testItem.api_path }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-tabs v-model="activeName" type="border-card" class="el-col-14 column">
      <el-tab-pane label="Test Case" name="testCase">
        <div class="clearfix">
          <span class="newBtn">
            <el-button type="success" @click="handleTestCaseAdding">
              <i class="el-icon-plus" />
              Add Test Case
            </el-button>
          </span>
          <el-input
            v-model="searchData"
            class="ob-search-input ob-shadow search-input mr-3"
            placeholder="Please input test case name"
            style="width: 250px; float: right"
            ><i slot="prefix" class="el-input__icon el-icon-search"></i
          ></el-input>
        </div>
        <el-table
          :data="testCaseList"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          style="margin-top: 10px"
        >
          <el-table-column label="Order">
            <template slot-scope="scope">
              {{ scope.row.order }}
            </template>
          </el-table-column>
          <el-table-column label="Name">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="Last Test Result">
            <template slot-scope="scope">
              {{ scope.row.last_test_result }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="200">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleTestCaseEdit(scope.$index, scope.row)">
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
                <el-button slot="reference" size="mini" type="danger"> <i class="el-icon-delete" /> Delete</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test Value" name="testValue">
        <div class="clearfix">
          <span class="newBtn">
            <el-button type="success" @click="handleTestValueAdding">
              <i class="el-icon-plus" />
              Add Test Value
            </el-button>
          </span>
          <el-input
            v-model="searchData"
            class="ob-search-input ob-shadow search-input mr-3"
            placeholder="Please input test value name"
            style="width: 250px; float: right"
            ><i slot="prefix" class="el-input__icon el-icon-search"></i
          ></el-input>
        </div>
        <el-table
          :data="testValueList"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          style="margin-top: 10px"
        >
          <el-table-column label="Order">
            <template slot-scope="scope">
              {{ scope.row.order }}
            </template>
          </el-table-column>
          <el-table-column label="Type">
            <template slot-scope="scope">
              {{ scope.row.type }}
            </template>
          </el-table-column>
          <el-table-column label="Location">
            <template slot-scope="scope">
              {{ scope.row.location }}
            </template>
          </el-table-column>
          <el-table-column label="Key">
            <template slot-scope="scope">
              {{ scope.row.key }}
            </template>
          </el-table-column>
          <el-table-column label="Value">
            <template slot-scope="scope">
              {{ scope.row.value }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="200">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleTestValueEdit(scope.$index, scope.row)">
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
                <el-button slot="reference" size="mini" type="danger"> <i class="el-icon-delete" /> Delete</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      :title="`${dialogStatusText} Test Case`"
      :visible.sync="testCaseDialogVisible"
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
        <el-form-item label="Name" prop="name">
          <el-input v-model="testCaseForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testCaseDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleTestCaseConfirm" :loading="confirmLoading">Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="`${dialogStatusText} Test Case`"
      :visible.sync="testValueDialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form
        label-position="top"
        ref="testValueForm"
        :model="testValueForm"
        :rules="testValueFormRules"
        label-width="20%"
      >
        <el-form-item label="Type" prop="type">
          <el-select v-model="testValueForm.type" style="width: 100%">
            <el-option v-for="item in testValueTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Location" prop="location">
          <el-select v-model="testValueForm.location" style="width: 100%">
            <el-option
              v-for="item in testValueLocationList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Key" prop="key">
          <el-input v-model="testValueForm.key"></el-input>
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="testValueForm.value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testValueDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleTestValueConfirm" :loading="confirmLoading">Confirm</el-button>
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
