<template>
  <el-row type="flex" justify="space-between" align="middle">
    <el-col>
      <el-button size="small" icon="el-icon-upload" type="success">{{ $t('Issue.UploadFiles') }}</el-button>
      <el-button size="small" icon="el-icon-plus">{{ $t('Issue.AddSubIssue') }}</el-button>
    </el-col>
    <el-col class="text-right">
      <el-link :href="issue_link" target="_blank" type="primary" :underline="false">
        <i class="el-icon-link" /> Redmine
      </el-link>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'IssueToolbar'
}
</script>

<style scoped>

</style>
