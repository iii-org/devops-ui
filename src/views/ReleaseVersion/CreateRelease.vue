<script>
import IssueListDialog from '@/views/ReleaseVersion/IssueListDialog'
export default {
  name: 'CreateRelease',
  components: { IssueListDialog },
  data: () => ({
    issues: [],
    issueDialogVisible: false
  }),
  computed: {
    issueCount() {
      return this.issues.length
    }
  },
  methods: {
    openIssueDialog() {
      const com = this.$refs.issueDialog
      com.setData(this.issues)
      com.visible = true
    }
  }
}
</script>

<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <span class="el-link">{{ $t('Release.issueCount') }}</span>&nbsp;
        <el-link
          underline
          type="primary"
          @click="openIssueDialog"
        >
          {{ $t('Release.issueCountLink', [issues.length]) }}
        </el-link>
      </el-col>
    </el-row>
    <issue-list-dialog ref="issueDialog" />
  </div>
</template>

<style scoped>
.el-link {
  font-size: large;
}
</style>
