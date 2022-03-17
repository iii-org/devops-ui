<template>
  <div class="app-container">
    <el-row class="mb-2">
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
    <el-card shadow="hover">
      <el-row>
        <el-col :span="6">
          <ul>
            <li
              v-for="(arr, cat) in issuesByCategory[0]"
              :key="cat"
            >
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
            <li
              v-for="(arr, cat) in issuesByCategory[1]"
              :key="cat"
            >
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
        <IssueListDialog ref="issueDialog" />
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ClosedIssues',
  components: {
    IssueListDialog: () => import('./IssueListDialog')
  },
  props: {
    allIssues: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      issues: [],
      issueCategories: [],
      issuesByCategory: [{}, {}]
    }
  },
  watch: {
    allIssues: {
      handler(val) {
        if (val.length > 0) this.setIssues(val)
      },
      immediate: true
    }
  },
  methods: {
    setIssues(issues) {
      this.issues = issues
      this.issuesByCategory = [{}, {}]
      for (const issue of issues) {
        const cat = issue.trackerName
        let index = this.issueCategories.indexOf(cat)
        if (index < 0) {
          this.issueCategories.push(cat)
          index = this.issueCategories.length - 1
        }
        const side = index % 2 === 0 ? 0 : 1
        const store = this.issuesByCategory[side]
        if (!(cat in store)) {
          store[cat] = []
        }
        store[cat].push(issue)
      }
    },
    openIssueDialog(category) {
      const com = this.$refs.issueDialog
      com.setData(this.issues, category)
      com.adjustTable(5)
      com.visible = true
    }
  }
}
</script>
