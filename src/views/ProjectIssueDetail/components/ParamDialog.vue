<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form 
      ref="parameterForm" 
      :model="parameterForm"
      :rules="parameterFormRules"
    >
      <el-row v-if="paramId != 0">
        <el-col :span="24">
          <el-form-item label="Order">
            <el-input v-model="paramOrder" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Name" prop="name">
            <el-input v-model="parameterForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Type" prop="parameter_type_id">
            <el-select v-model="parameterForm.parameter_type_id" style="width:100%">
              <el-option
                v-for="item in parameterTypeList"
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
          <el-form-item label="Length" prop="length">
            <el-input v-model="parameterForm.length" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Limit" prop="limitation">
            <el-input v-model="parameterForm.limitation" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Desc." prop="description">
            <el-input v-model="parameterForm.description" type="textarea" />
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
import { getParameterType } from '@/api/issueParameter'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogTitle: {
      type: String,
      default: 'Add Parameter'
    },
    paramId: {
      type: Number,
      default: 0
    },
    saveData: Function
  },
  data() {
    return {
      parameterTypeList: [],
      parameterForm: {
        name: '',
        parameter_type_id: '',
        description: '',
        length: 0,
        limitation: ''
      },
      parameterFormRules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' }
        ],
        parameter_type_id: [
          { required: true, message: 'Please select type', trigger: 'blur' }
        ],
        length: [
          { required: true, message: 'Please input length', trigger: 'blur' }
        ],
        limitation: [
          { required: true, message: 'Please input limitation', trigger: 'blur' }
        ],
        description: [
          { required: true, message: 'Please input description', trigger: 'blur' }
        ]
      },
      paramOrder: '',
      paramType: '',
      paramName: '',
      paramLength: '',
      paramLimit: '',
      paramDesc: ''
    }
  },
  // updated() {
  //   if (this.paramId === 0) {
  //     this.paramType = ''
  //     this.paramName = ''
  //     this.paramDesc = ''
  //     this.paramLength = ''
  //     this.paramLimit = ''
  //   } else {
  //     this.fetchData()
  //   }
  // },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getParameterType()
      this.parameterTypeList = res.data.map(item => {
        return { label: item.name, value: item.parameter_type_id }
      })
    },
    handleClose() {
      this.$refs['parameterForm'].resetFields()
      this.$emit('param-dialog-visible', false)
    },
    handleSave() {
      this.$refs['parameterForm'].validate(async(valid) => {
        if (valid) {
          await this.saveData(this.parameterForm)
          this.$refs['parameterForm'].resetFields()
        } else {
          return false
        }
      })
    }
  }
}
</script>
