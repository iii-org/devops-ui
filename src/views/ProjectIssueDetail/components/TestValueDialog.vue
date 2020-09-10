<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form 
      ref="valueForm" 
      :model="valueForm"
      :rules="valueFormRules"
      label-width="20%"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="Type" label-width="100px" prop="type_id">
            <el-select v-model="valueForm.type_id" style="width:100%">
              <el-option
                v-for="item in testValueTypeList"
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
          <el-form-item label="Key" label-width="100px" prop="key">
            <el-input v-model="valueForm.key" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Value" label-width="100px" prop="value">
            <el-input v-model="valueForm.value" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Location" label-width="100px" prop="location_id">
            <el-select v-model="valueForm.location_id" style="width:100%">
              <el-option
                v-for="item in testValueLocationList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
import { getTestValueType, getTestValueLocation } from '@/api/issueTestValue'
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
    testValueId: {
      type: Number,
      default: 0
    },
    saveData: Function
  },
  data() {
    return {
      valueForm: {
        key: '',
        value: '',
        location_id: '',
        type_id: ''
      },
      testValueTypeList: [],
      testValueLocationList: [],
      valueFormRules: {
        key: [
          { required: true, message: 'Please input key', trigger: 'blur' }
        ],
        value: [
          { required: true, message: 'Please input value', trigger: 'blur' }
        ],
        type_id: [
          { required: true, message: 'Please select type', trigger: 'blur' }
        ],
        location_id: [
          { required: true, message: 'Please select location', trigger: 'blur' }
        ]
      }
    }
  },
  // updated() {
  //   if (this.testValueId === 0) {
  //     this.testValueType = ''
  //     this.testValueKey = ''
  //     this.testValue = ''
  //     this.testValueLocation = ''
  //   } else {
  //     this.fetchData()
  //   }
  // },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const valueTypeRes = await getTestValueType()
      const valueLocationRes = await getTestValueLocation()
      this.testValueTypeList = valueTypeRes.data.map(item => {
        return { label: item.type_name, value: item.type_id }
      })
      this.testValueLocationList = valueLocationRes.data.map(item => {
        return { label: item.type_name, value: item.location_id }
      })
      // this.testValueType = 'Request'
      // this.testValueKey = 'Content-Type'
      // this.testValue = 'application/json'
      // this.testValueLocation = 'header'
      // this.isSuccess = false
    },
    handleClose() {
      this.$emit('testValue-dialog-visible', false)
      this.$refs['valueForm'].resetFields()
    },
    handleSave() {
      this.$refs['valueForm'].validate(async(valid) => {
        if (valid) {
          await this.saveData(this.valueForm)
          this.$refs['valueForm'].resetFields()
        } else {
          return false
        }
      })
    }
  }
}
</script>
