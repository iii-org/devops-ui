<script>
import IssueListDialog from '@/views/ReleaseVersion/IssueListDialog'

export default {
  name: 'CreateRelease',
  components: { IssueListDialog },
  data: () => ({
    commitForm: {
      versionName: '',
      note: ''
    },
    issues: [],
    issueCategories: [],
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
      for (const issue of issues) {
        const cat = issue['issue_category']
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
    },
    release() {
      // TODO
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
          <li v-for="(arr, cat) in issuesByCategory[0]" :key="cat">
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
          <li v-for="(arr, cat) in issuesByCategory[1]" :key="cat">
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
    <br>
    <div style="font-weight: bold;">{{ $t('Release.releaseNote') }}</div>
    <p>
      <el-form ref="form" :model="commitForm">
        <el-form-item :label="$t('Release.releaseVersionName')">
          <el-input v-model="commitForm.versionName" style="width: 120px;" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="commitForm.note"
                    type="textarea"
                    style="width: 60%;"
                    :rows="6"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="release">
            <span class="el-icon-goods" />
            {{ $t('Release.startRelease') }}
          </el-button>
        </el-form-item>
      </el-form>
    </p>
    <issue-list-dialog ref="issueDialog" />
  </div>
</template>

<style scoped>
.el-link {
  font-size: large;
}
</style>
