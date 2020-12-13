<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { getTestItemByCase, addTestItemByCase, updateTestItem, deleteTestItem } from '@/api/testItem'
import {
  getTestValueByItem,
  addTestValueByItem,
  updateTestValue,
  deleteTestValue,
  getTestValueType,
  getTestValueLocation
} from '@/api/testValue'
import { getTestCaseById } from '@/api/testCase'

const testItemFormTemplate = {
  name: '',
  is_passed: false
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
      activeName: 'testItem',
      testCaseId: 0,
      testCase: { name: '', data: { method: '', url: '' }},
      testItemList: [],
      testItemDialogVisible: false,
      selectTestItem: '',
      testValueList: [],
      testValueDialogVisible: false,
      listLoading: true,
      testItemlistQuery: {
        page: 1, // 目前第幾頁
        limit: 10 // 一頁幾筆
      },
      testItemListTotal: 0, // 總筆數
      testValuelistQuery: {
        page: 1, // 目前第幾頁
        limit: 10 // 一頁幾筆
      },
      testValueListTotal: 0, // 總筆數
      testItemForm: testItemFormTemplate,
      testValueForm: testValueFormTemplate,
      confirmLoading: false,
      testItemSearchData: '',
      testValueSearchData: '',
      dialogStatus: 1,
      testValueTypeList: [],
      testValueLocationList: [],
      testItemFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        is_passed: [{ required: true, message: 'Please select is passed', trigger: 'blur' }]
      },
      testValueFormRules: {
        type_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        location_id: [{ required: true, message: 'Please select location', trigger: 'blur' }],
        key: [{ required: true, message: 'Please select key', trigger: 'blur' }],
        value: [{ required: true, message: 'Please select value', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['userRole']),
    testItemPagedData() {
      const listData = this.testItemList.filter((data) => {
        if (this.testItemSearchData == '' || data.name.toLowerCase().includes(this.testItemSearchData.toLowerCase())) {
          return data
        }
      })
      this.testItemListTotal = listData.length
      const start = (this.testItemlistQuery.page - 1) * this.testItemlistQuery.limit
      const end = start + this.testItemlistQuery.limit
      return listData.slice(start, end)
    },
    testValuePagedData() {
      const listData = this.testValueList.filter((data) => {
        if (
          this.testValueSearchData == '' ||
          data.value.toLowerCase().includes(this.testValueSearchData.toLowerCase())
        ) {
          return data
        }
      })
      this.testValueListTotal = listData.length
      const start = (this.testValuelistQuery.page - 1) * this.testValuelistQuery.limit
      const end = start + this.testValuelistQuery.limit
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
    async selectTestItem(val) {
      console.log(val)
      this.fetchTestValueData(val)
    }
  },
  created() {
    this.listLoading = true
    Promise.all([getTestValueType(), getTestValueLocation()])
      .then((res) => {
        this.testValueTypeList = res[0].data.map((item) => {
          return { label: item.type_name, value: item.type_id }
        })
        this.testValueLocationList = res[1].data.map((item) => {
          return { label: item.type_name, value: item.location_id }
        })
      })
      .finally(() => {
        this.listLoading = false
      })
    this.testCaseId = parseInt(this.$route.params.testCaseId)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Promise.all([getTestCaseById(this.testCaseId), getTestItemByCase(this.testCaseId)]).then((res) => {
        this.testCase = res[0].data
        this.testItemList = res[1].data
        this.listLoading = false
      })
    },
    async fetchTestValueData(val) {
      const res = await getTestValueByItem(val)

      this.testValueList = res.data.map((item) => {
        item['type'] = this.testValueTypeList.find((type) => type.value == item.type_id)
        item['location'] = this.testValueLocationList.find((location) => location.value == item.location_id)
        return item
      })
      console.log('this.testValueList', this.testValueList)
    },
    handleTestItemAdding() {
      this.testItemDialogVisible = true
      this.$nextTick(() => {
        this.$refs['testItemForm'].resetFields()
      })
      this.dialogStatus = 1
    },
    handleTestItemEdit(idx, row) {
      this.testItemDialogVisible = true
      this.dialogStatus = 2
      this.testItemForm = Object.assign({}, this.testItemForm, row)
    },
    handleDelete() {},
    handleTestValueAdding() {
      if (this.selectTestItem === '') {
        this.$message.warning(this.$t('TestValue.PleaseSelectTestItem'))
      } else {
        this.testValueDialogVisible = true
        this.dialogStatus = 1
      }
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
    onPagination(testItemlistQuery) {
      this.testItemlistQuery = testItemlistQuery
    },
    onDialogClosed() {
      this.$nextTick(() => {
        if (this.activeName === 'testValue') {
          this.$refs['testValueForm'].resetFields()
        } else if (this.activeName === 'testItem') {
          this.$refs['testItemForm'].resetFields()
        }
        // this.$refs['testValueForm'].resetFields()
        this.testItemForm = testItemFormTemplate
        this.testValueForm = testValueFormTemplate
      })
    },
    handleTestItemConfirm() {
      this.$refs['testItemForm'].validate(async(valid) => {
        if (valid) {
          if (this.dialogStatus == 1) {
            await addTestItemByCase(this.testCaseId, this.testItemForm)
          } else {
            await updateTestItem(this.testItemForm['id'], this.testItemForm)
          }
          this.testItemDialogVisible = false
          this.fetchData()
        } else {
          return false
        }
      })
    },
    async handleTestItemDelete(idx, row) {
      await deleteTestItem(row['id'])
      this.fetchData()
    },
    handleTestValueConfirm() {
      this.$refs['testValueForm'].validate(async(valid) => {
        if (valid) {
          if (this.dialogStatus == 1) {
            await addTestValueByItem(this.selectTestItem, this.testValueForm)
          } else {
            await updateTestValue(this.testValueForm['id'], this.testValueForm)
          }
          this.$refs['testValueForm'].resetFields()
          this.testValueDialogVisible = false
          this.fetchTestValueData(this.selectTestItem)
        } else {
          return false
        }
      })
    },
    async handleTestValueDelete(idx, row) {
      await deleteTestValue(row['id'])
      this.fetchTestValueData(this.selectTestItem)
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-card class="box-card el-col-6 column custom-list" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px; padding-bottom: 10px">{{ $t('TestCase.TestCase') }}</span>
      </div>
      <el-form :label-position="'left'">
        <el-row>
          <el-col>
            <el-form-item :label="$t('general.Name')">{{ testCase.name }} </el-form-item>
          </el-col>
          <el-col>
            <el-form-item :label="$t('TestCase.Method')">
              {{ testCase.data.method }}
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item :label="$t('TestCase.Path')">
              {{ testCase.data.url }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-tabs v-model="activeName" type="border-card" class="el-col-14 column">
      <el-tab-pane :label="$t('TestItem.TestItem')" name="testItem">
        <div class="clearfix">
          <span v-if="userRole === 'Engineer'" class="newBtn">
            <el-button type="success" @click="handleTestItemAdding">
              <i class="el-icon-plus" />
              {{ $t('TestItem.AddTestItem') }}
            </el-button>
          </span>
          <el-input
            v-model="testItemSearchData"
            class="ob-search-input ob-shadow search-input mr-3"
            :placeholder="$t('general.SearchName')"
            style="width: 250px; float: right"
          ><i slot="prefix" class="el-input__icon el-icon-search" /></el-input>
        </div>
        <el-table
          :data="testItemPagedData"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          style="margin-top: 10px"
        >
          <el-table-column :label="$t('TestItem.Id')">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('TestItem.IsPass')">
            <template slot-scope="scope">
              {{ scope.row.is_passed }}
            </template>
          </el-table-column>
          <el-table-column v-if="userRole === 'Engineer'" :label="$t('general.Actions')" align="center" width="200">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleTestItemEdit(scope.$index, scope.row)">
                <i class="el-icon-edit" />
                {{ $t('general.Edit') }}
              </el-button>
              <el-popconfirm
                confirm-button-text="Delete"
                cancel-button-text="Cancel"
                icon="el-icon-info"
                icon-color="red"
                title="Are you sure?"
                @onConfirm="handleTestItemDelete(scope.$index, scope.row)"
              >
                <el-button slot="reference" size="mini" type="danger">
                  <i class="el-icon-delete" /> {{ $t('general.Delete') }}</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="testItemListTotal"
          :page="testItemlistQuery.page"
          :limit="testItemlistQuery.limit"
          :page-sizes="[testItemlistQuery.limit]"
          :layout="'total, prev, pager, next'"
          @pagination="onPagination"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('TestValue.TestValue')" name="testValue">
        <div class="clearfix">
          <el-select v-model="selectTestItem" :placeholder="$t('TestValue.SelectTestItem')">
            <el-option v-for="item in testItemList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <span v-if="userRole === 'Engineer'" class="newBtn">
            <el-button type="success" @click="handleTestValueAdding">
              <i class="el-icon-plus" />
              {{ $t('TestValue.AddTestValue') }}
            </el-button>
          </span>
          <el-input
            v-model="testValueSearchData"
            class="ob-search-input ob-shadow search-input mr-3"
            :placeholder="$t('TestValue.SearchValue')"
            style="width: 250px; float: right"
          ><i slot="prefix" class="el-input__icon el-icon-search" /></el-input>
        </div>
        <el-table
          :data="testValuePagedData"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          style="margin-top: 10px"
        >
          <el-table-column :label="$t('TestValue.Type')">
            <template slot-scope="scope">
              {{ scope.row.type.label }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('TestValue.Location')">
            <template slot-scope="scope">
              {{ scope.row.location.label }}
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
          <el-table-column v-if="userRole === 'Engineer'" :label="$t('general.Actions')" align="center" width="200">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleTestValueEdit(scope.$index, scope.row)">
                <i class="el-icon-edit" />
                {{ $t('general.Edit') }}
              </el-button>
              <el-popconfirm
                confirm-button-text="Delete"
                cancel-button-text="Cancel"
                icon="el-icon-info"
                icon-color="red"
                title="Are you sure?"
                @onConfirm="handleTestValueDelete(scope.$index, scope.row)"
              >
                <el-button slot="reference" size="mini" type="danger">
                  <i class="el-icon-delete" /> {{ $t('general.Delete') }}</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="testValueListTotal"
          :page="testValuelistQuery.page"
          :limit="testValuelistQuery.limit"
          :page-sizes="[testValuelistQuery.limit]"
          :layout="'total, prev, pager, next'"
          @pagination="onPagination"
        />
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      :title="$t(`TestItem.${dialogStatusText}TestItem`)"
      :visible.sync="testItemDialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form
        ref="testItemForm"
        label-position="top"
        :model="testItemForm"
        :rules="testItemFormRules"
        label-width="20%"
      >
        <el-form-item :label="$t('general.Name')" prop="name">
          <el-input v-model="testItemForm.name" />
        </el-form-item>
        <el-form-item :label="$t('TestItem.IsPass')" prop="is_passed">
          <el-switch v-model="testItemForm.is_passed" active-color="#13ce66" inactive-color="#ff4949" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testItemDialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="handleTestItemConfirm">{{
          $t('general.Confirm')
        }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t(`TestValue.${dialogStatusText}TestValue`)"
      :visible.sync="testValueDialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form
        ref="testValueForm"
        label-position="top"
        :model="testValueForm"
        :rules="testValueFormRules"
        label-width="20%"
      >
        <el-form-item :label="$t('TestValue.Type')" prop="type_id">
          <el-select v-model="testValueForm.type_id" style="width: 100%">
            <el-option v-for="item in testValueTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('TestValue.Location')" prop="location_id">
          <el-select v-model="testValueForm.location_id" style="width: 100%">
            <el-option
              v-for="item in testValueLocationList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Key" prop="key">
          <el-input v-model="testValueForm.key" />
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="testValueForm.value" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testValueDialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="handleTestValueConfirm">{{
          $t('general.Confirm')
        }}</el-button>
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
