<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form 
      ref="flowForm" 
      :model="flowForm"
      :rules="flowFormRules"
    >
      <el-row v-if="flowId != 0">
        <el-col :span="24">
          <el-form-item label="Step Order">
            <el-input v-model="stepOrder" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Step Name" prop="name">
            <el-input v-model="flowForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Step Type" prop="type_id">
            <el-select v-model="flowForm.type_id" style="width:100%">
              <el-option
                v-for="item in flowTypeList"
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
          <el-form-item label="Step Desc." prop="description">
            <el-input v-model="flowForm.description" type="textarea" />
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
import { getFlowType } from '@/api/issueFlow'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogTitle: {
      type: String,
      default: 'Add Flow'
    },
    flowId: {
      type: Number,
      default: 0
    },
    saveData: Function
  },
  data() {
    return {
      flowTypeList: [],
      stepOrder: 0,
      flowForm: {
        name: '',
        type_id: '',
        description: ''
      },
      flowFormRules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' }
        ],
        type_id: [
          { required: true, message: 'Please select type', trigger: 'blur' }
        ],
        description: [
          { required: true, message: 'Please input description', trigger: 'blur' }
        ]
      }
    }
  },
  // updated() {
  //   if (this.flowId === 0) {
  //     this.stepType = ''
  //     this.stepName = ''
  //     this.stepDesc = ''
  //   } else {
  //     this.fetchData()
  //   }
  // },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getFlowType()
      this.flowTypeList = res.data.map(item => {
        return { label: item.name, value: item.flow_type_id }
      })
    },
    handleClose() {
      this.$refs['flowForm'].resetFields()
      this.$emit('flow-dialog-visible', false)
    },
    handleSave() {
      this.$refs['flowForm'].validate(async(valid) => {
        if (valid) {
          await this.saveData(this.flowForm)
          this.$refs['flowForm'].resetFields()
        } else {
          return false
        }
      })
    }
  }
}
</script>
