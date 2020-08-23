<template>
  <el-dialog
    title="Reject Apply"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%">
      <el-row>
        <el-col :span="24">
          <el-form-item label="Account" label-width="140px" >
            <span> {{account}} </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Reject Reason" label-width="140px">
            <el-input v-model="reason" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleClose">Confirm</el-button>
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
    userId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      account: 'David',
      reason: ''
    }
  },
  methods: {
    fetchData() {
      this.account = 'david'
      this.reason = ''
      this.listLoading = false
    },
    handleClose() {
      this.$emit('validation-dialog-visible', false)
    }
  }
}
</script>
