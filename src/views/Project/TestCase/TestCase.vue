<template>
  <div class="app-container">
    <router-view />
    <div v-if="this.$route.meta.rolePage" class="role-Page">
      <project-list-selector />
      <div class="d-flex justify-space-between align-center">
        <!-- <span v-if="userRole === 'Engineer'" class="newBtn"> -->
        <el-button type="success" icon="el-icon-plus" @click="handleAdding">
          {{ $t('TestCase.AddTestCase') }}
        </el-button>
        <el-input
          v-model="searchData"
          :placeholder="$t('general.SearchName')"
          prefix-icon="el-icon-search"
          style="width: 250px"
        />
      </div>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="pagedData"
        :header-cell-style="{ 'text-align': 'center' }"
        :cell-style="{ 'text-align': 'center' }"
        border
        fit
      >
        <el-table-column :label="$t('TestCase.Id')" width="110" prop="id" />
        <el-table-column :label="$t('general.Name')" min-width="150" prop="name" show-overflow-tooltip />
        <el-table-column
          align="center"
          :label="$t('TestCase.Description')"
          :show-overflow-tooltip="true"
          min-width="170"
          prop="description"
        />
        <el-table-column :label="$t('TestCase.Method')" width="120" prop="data.method" />
        <el-table-column :label="$t('TestCase.Path')" min-width="150" prop="data.url" />
        <el-table-column :label="$t('general.Actions')" width="320">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" plain icon="el-icon-document" @click="handleDetail(scope.row)">
              {{ $t('TestItem.TestItem') }}
            </el-button>
            <!-- <el-button
              v-if="userRole === 'Engineer'"
              size="mini"
              type="primary"
              @click="handleEdit(scope.row)"
            > -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">
              {{ $t('general.Edit') }}
            </el-button>
            <el-popconfirm
              :confirm-button-text="$t('general.Delete')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              title="Are you sure?"
              @onConfirm="handleDelete(scope.row)"
            >
              <!-- <el-button v-if="userRole === 'Engineer'" slot="reference" size="mini" type="danger"> -->
              <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete">
                {{ $t('general.Delete') }}
              </el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
      <el-dialog
        :title="$t(`TestCase.${dialogStatusText}TestCase`)"
        :visible.sync="dialogVisible"
        width="50%"
        @closed="onDialogClosed"
      >
        <el-form
          ref="testCaseForm"
          label-position="top"
          :model="testCaseForm"
          :rules="testCaseFormRules"
          label-width="20%"
        >
          <el-row :gutter="10">
            <el-col :span="24">
              <el-form-item :label="$t('general.Name')" prop="name">
                <el-input v-model="testCaseForm.name" />
              </el-form-item>
            </el-col>
            <el-col :span="24" :sm="12">
              <el-form-item :label="$t('TestCase.Method')" prop="method_id">
                <el-select v-model="testCaseForm.method_id" style="width: 100%">
                  <el-option
                    v-for="item in testCaseAPIMethodList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24" :sm="12">
              <el-form-item :label="$t('TestCase.Type')" prop="type_id">
                <el-select v-model="testCaseForm.type_id" style="width: 100%">
                  <el-option
                    v-for="item in testCaseTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="$t('TestCase.Path')" prop="url">
                <el-input v-model="testCaseForm.url" />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="24">
              <el-form-item :label="$t('Issue.Issue')" prop="issue_id">
                <el-input v-model="testCaseForm.issue_id" />
              </el-form-item>
            </el-col> -->
            <el-col :span="24">
              <el-form-item :label="$t('TestCase.Description')" prop="description">
                <el-input v-model="testCaseForm.description" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
          <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">
            {{ $t('general.Confirm') }}
          </el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import {
  addTestCaseByProject,
  deleteTestCase,
  getTestCaseAPIMethod,
  getTestCaseByProject,
  getTestCaseType,
  updateTestCase
} from '@/api/testCase'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'

const formTemplate = {
  name: '',
  method_id: '',
  type_id: '',
  // issue_id: '',
  url: '',
  description: ''
}

export default {
  name: 'TestCase',
  components: { ProjectListSelector },
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
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      dialogVisible: false,
      dialogStatus: 1,
      testCaseForm: formTemplate,
      confirmLoading: false,
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
    ...mapGetters(['selectedProjectId', 'userRole']),
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
  methods: {
    async fetchData() {
      let res
      res = await getTestCaseType()
      this.testCaseTypeList = res.data.map(item => ({ label: item.name, value: item.test_case_type_id }))
      res = await getTestCaseAPIMethod()
      this.testCaseAPIMethodList = res.data.map(item => ({ label: item.name, value: item.Http_Method_id }))
      res = await getTestCaseByProject(this.selectedProjectId)
      return res.data
    },
    handleEdit(row) {
      this.dialogVisible = true
      this.dialogStatus = 2
      row['method_id'] = row['data']['method_id']
      row['url'] = row['data']['url']
      this.testCaseForm = Object.assign({}, this.testCaseForm, row)
    },
    async handleDelete(row) {
      await deleteTestCase(row['id'])
      await this.loadData()
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
        this.testCaseForm = Object.assign({}, formTemplate)
      })
    },
    handleConfirm() {
      this.$refs['testCaseForm'].validate(async valid => {
        if (valid) {
          const apiTypeObj = this.testCaseTypeList.find(type => type.value === this.testCaseForm.type_id)
          const apiMethodObj = this.testCaseAPIMethodList.find(method => method.value === this.testCaseForm.method_id)
          const testCaseData = Object.assign({}, this.testCaseForm)
          testCaseData['data'] = {
            type: apiTypeObj['label'],
            url: this.testCaseForm['url'],
            method: apiMethodObj['label'],
            method_id: apiMethodObj['value']
          }
          testCaseData['project_id'] = this.selectedProjectId
          if (this.dialogStatus === 1) {
            await addTestCaseByProject(this.selectedProjectId, testCaseData)
          } else {
            await updateTestCase(testCaseData['id'], testCaseData)
          }
          this.$refs['testCaseForm'].resetFields()
          this.dialogVisible = false
          await this.loadData()
        }
      })
    },
    handleDetail(row) {
      this.$router.push({ name: 'test-item', params: { testCaseId: row.id } })
    }
  }
}
</script>
