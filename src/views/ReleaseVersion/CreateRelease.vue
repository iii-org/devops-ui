<script>
import IssueListDialog from '@/views/ReleaseVersion/IssueListDialog'

export default {
  name: 'CreateRelease',
  components: { IssueListDialog },
  data: () => ({
    issues: [],
    issuesByCategory: [{}, {}],
    issueDialogVisible: false
  }),
  computed: {
    issueCount() {
      return this.issues.length
    }
  },
  methods: {
    setIssues(issues) {
      this.issues = issues
      this.issuesByCategory = [{}, {}]
      for (const i in issues) {
        const side = i % 2 === 0 ? 0 : 1
        const store = this.issuesByCategory[side]
        const issue = issues[i]
        const cat = issue['issue_category']
        if (!(cat in store)) {
          store[cat] = []
        }
        store[cat].push(issue)
      }
    },
    openIssueDialog(category) {
      const com = this.$refs.issueDialog
      com.setData(this.issues, category)
      com.adjustTable(6)
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
          @click="openIssueDialog(null)"
        >
          {{ $t('Release.issueCountLink', [issues.length]) }}
        </el-link>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <ul>
          <li v-for="(arr, cat) in issuesByCategory[0]" :key="0-cat">
            <span class="el-link">{{ cat }}</span> (
            <el-link
              underline
              type="primary"
              @click="openIssueDialog(cat)"
            >
              {{ $t('Release.issueCountLink', [arr.length]) }}
            </el-link>
            )
          </li>
        </ul>
      </el-col>
      <el-col :span="6">
        <ul>
          <li v-for="(arr, cat) in issuesByCategory[1]" :key="1-cat">
            <span class="el-link">{{ cat }}</span> (
            <el-link
              underline
              type="primary"
              @click="openIssueDialog(cat)"
            >
              {{ $t('Release.issueCountLink', [arr.length]) }}
            </el-link>
            )
          </li>
        </ul>
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
