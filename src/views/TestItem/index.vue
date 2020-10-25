<script>
import Pagination from '@/components/Pagination'
import { getTestItem, addTestItem } from '@/api/testItem'

const formTemplate = {
  name: '',
  api_method: '',
  api_path: ''
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
      testItemList: [],
      dialogVisible: false,
      dialogStatus: 1,
      listLoading: true,
      listQuery: {
        page: 1, //目前第幾頁
        limit: 10 //一頁幾筆
      },
      listTotal: 0, //總筆數
      testItemForm: formTemplate,
      confirmLoading: false,
      searchData: '',
      apiMethodList: [
        {
          value: 'GET',
          label: 'GET'
        },
        {
          value: 'POST',
          label: 'POST'
        },
        {
          value: 'PUT',
          label: 'PUT'
        },
        {
          value: 'DELETE',
          label: 'DELETE'
        }
      ],
      testItemFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        api_method: [{ required: true, message: 'Please select api method', trigger: 'blur' }],
        api_path: [{ required: true, message: 'Please input api path', trigger: 'blur' }]
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
    async fetchData() {
      this.listLoading = true
      const res = await getTestItem()
      this.testItemList = res.data
      this.listLoading = false
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.dialogStatus = 2
      this.testItemForm = Object.assign({}, this.testItemForm, row)
    },
    handleDelete() {},
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
        this.$refs['testItemForm'].resetFields()
        this.form = formTemplate
      })
    },
    handleConfirm() {
      this.$refs['testItemForm'].validate(async (valid) => {
        if (valid) {
          await addTestItem(this.testItemForm)
          this.$refs['testItemForm'].resetFields()
          this.dialogVisible = false
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
    <div class="clearfix">
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Test Item
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
      <el-table-column align="center" label="Order" width="120px">
        <template slot-scope="scope"> {{ scope.row.order }} </template>
      </el-table-column>
      <el-table-column align="center" label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Method" width="120px">
        <template slot-scope="scope"> {{ scope.row.api_method }} </template>
      </el-table-column>
      <el-table-column align="center" label="Path" width="120px">
        <template slot-scope="scope"> {{ scope.row.api_path }} </template>
      </el-table-column>
      <el-table-column align="center" label="Last Test Time" width="150px">
        <template slot-scope="scope">
          {{ scope.row.last_test_at | relativeTime }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last Test Result" width="150px">
        <template slot-scope="scope">
          <el-tag :type="returnTagType(scope.row)" size="large">
            <i v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <i v-else-if="returnTagType(scope.row) === 'danger'" class="el-icon-error" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="350" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="handleDetail(scope.$index, scope.row)">
            <i class="el-icon-document" />
            Test Case
          </el-button>
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
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
      :title="`${dialogStatusText} Test Item`"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form
        label-position="top"
        ref="testItemForm"
        :model="testItemForm"
        :rules="testItemFormRules"
        label-width="20%"
      >
        <el-form-item label="Test Item Name" prop="name">
          <el-input v-model="testItemForm.name"></el-input>
        </el-form-item>
        <el-form-item label="API Method" prop="api_method">
          <el-select v-model="testItemForm.api_method" style="width: 100%">
            <el-option v-for="item in apiMethodList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Path" prop="api_path">
          <el-input v-model="testItemForm.api_path"></el-input>
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
