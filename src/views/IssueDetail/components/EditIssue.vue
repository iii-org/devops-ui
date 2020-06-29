<template>
  <el-dialog
    title="Edit Issue"
    :visible="dialogVisible"
    width="30%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="80px">
      <el-form-item label="Process">
        <el-input v-model="issueProcess" />
      </el-form-item>
      <el-form-item label="Status">
        <el-select v-model="issueStatus" style="width:100%">
          <el-option
            v-for="item in issueStatusList"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleClose">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getIssueStatus } from '@/api/issue'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    issueProcess: {
      type: Number,
      default: 0
    },
    issueStatus: {
      type: String,
      default: 'Active'
    }
  },
  data() {
    return {
      issueStatusList: []
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getIssueStatus().then(response => {
        this.issueStatusList = response.data
        this.listLoading = false
      })
    },
    handleClose() {
      this.$emit('issue-dialog-visible', false)
    }
  }
}
</script>
