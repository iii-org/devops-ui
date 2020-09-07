<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%">
      <el-row>
        <el-col :span="24">
          <el-form-item label="Item Name" label-width="100px">
            <el-input v-model="testItemForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Is Success" label-width="100px">
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
    },
    handleSave() {
      this.saveData(this.testItemForm)
    }
  }
}
</script>
