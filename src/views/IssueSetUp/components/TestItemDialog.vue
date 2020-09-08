<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form 
      ref="testItemForm" 
      :model="testItemForm"
      :rules="testItemFormRules"
      label-width="20%"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="Item Name" label-width="100px" prop="name">
            <el-input v-model="testItemForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Is Success" label-width="100px" prop="is_passed">
            <el-switch
              v-model="testItemForm.is_passed"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
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
    testItemId: {
      type: Number,
      default: 0
    },
    saveData: Function
  },
  data() {
    return {
      testItemForm: {
        name: '',
        is_passed: true
      },
      testItemFormRules: {
        name: [
          { required: true, message: 'Please input name', trigger: 'blur' }
        ],
        is_passed: [
          { required: true, message: 'Please select type', trigger: 'blur' }
        ]
      }
    }
  },
  // updated() {
  //   if (this.testItemId === 0) {
  //     this.testItemName = ''
  //     this.isSuccess = false
  //   } else {
  //     this.fetchData()
  //   }
  // },
  methods: {
    fetchData() {
      // this.testItemName = '成功登入'
      // this.isSuccess = true
    },
    handleClose() {
      this.$emit('testItem-dialog-visible', false)
      this.$refs['testItemForm'].resetFields()
    },
    handleSave() {
      this.$refs['testItemForm'].validate(async(valid) => {
        if (valid) {
          await this.saveData(this.testItemForm)
          this.$refs['testItemForm'].resetFields()
        } else {
          return false
        }
      })
    }
  }
}
</script>
