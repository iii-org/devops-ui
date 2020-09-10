<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form 
      ref="testCaseForm"
      :model="testCaseForm"
      :rules="testCaseFormRules"
      label-width="20%"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="API Name" label-width="100px" prop="name">
            <el-input v-model="testCaseForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="API Method" label-width="100px" prop="method_id">
            <el-select v-model="testCaseForm.method_id" style="width:100%">
              <el-option
                v-for="item in testMethodList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="API Type" label-width="100px" prop="type_id">
            <el-select v-model="testCaseForm.type_id" style="width:100%">
              <el-option
                v-for="item in testTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="API URL" label-width="100px" prop="url">
            <el-input v-model="testCaseForm.url" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Desc." label-width="100px" prop="description">
            <el-input v-model="testCaseForm.description" type="textarea" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleSave">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getTestCaseType, getTestCaseAPIMethod } from '@/api/issueTestCase'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogTitle: {
      type: String,
      default: 'Add Test'
    },
    testId: {
      type: Number,
      default: 0
    },
    saveData: Function
  },
  data() {
    return {
      testMethodList: [],
      testTypeList: [],
      testCaseForm: {
        name: '',
        method: '',
        type_id: '',
        url: '',
        description: ''
      },
      testAPIName: '',
      testAPIMethod: '',
      testAPIURL: '',
      testAPIDesc: '',
      testCaseFormRules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' }
        ],
        method_id: [
          { required: true, message: 'Please select method', trigger: 'blur' }
        ],
        type_id: [
          { required: true, message: 'Please select type', trigger: 'blur' }
        ],
        url: [
          { required: true, message: 'Please input url', trigger: 'blur' }
        ],
        description: [
          { required: true, message: 'Please input description', trigger: 'blur' }
        ]
      }
    }
  },
  // updated() {
  //   if (this.testId === 0) {
  //     this.testAPIName = ''
  //     this.testAPIMethod = ''
  //     this.testAPIURL = ''
  //     this.testAPIDesc = ''
  //   } else {
  //     this.fetchData()
  //   }
  // },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const resType = await getTestCaseType()
      const resMethod = await getTestCaseAPIMethod()
      this.testMethodList = resMethod.data.map(item => {
        return { label: item.name, value: item.Http_Method_id }
      })
      this.testTypeList = resType.data.map(item => {
        return { label: item.name, value: item.test_case_type_id }
      })
    },
    handleClose() {
      this.$emit('test-dialog-visible', false)
    },
    handleSave() {
      this.$refs['testCaseForm'].validate(async(valid) => {
        if (valid) {
          const type = this.testTypeList.find(item => {
            return item.value == this.testCaseForm.type_id
          })
          const method = this.testMethodList.find(item => {
            return item.value == this.testCaseForm.method_id
          })
          const data = {
            'type': type.label,
            'url': this.testCaseForm.url,
            'method': method.label,
            'method_id': this.testCaseForm.method_id
          }
          this.testCaseForm['data'] = data
          await this.saveData(this.testCaseForm)
          this.$refs['testCaseForm'].resetFields()
        } else {
          return false
        }
      })

      
    }
  }
}
</script>
