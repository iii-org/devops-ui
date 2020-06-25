<template>
  <el-dialog
    title="Add Content"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="80px">
      <markdown-editor v-model="content1" height="300px" />
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleClose">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getIssueStatus } from '@/api/issue'
import MarkdownEditor from '@/components/MarkdownEditor'
export default {
  components: { MarkdownEditor },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      issue_status_list: []
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getIssueStatus().then(response => {
        this.issue_status_list = response.data
        this.listLoading = false
      })
    },
    handleClose() {
      this.$emit('issue-dialog-visible', false)
    }
  }
}
</script>
