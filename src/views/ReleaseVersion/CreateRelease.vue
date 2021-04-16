<script>
import IssueListDialog from '@/views/ReleaseVersion/IssueListDialog'
import { mapGetters } from 'vuex'
import { getBranchesByProject } from '@/api/branches'

export default {
  name: 'CreateRelease',
  components: { IssueListDialog },
  data: function() {
    return {
      commitForm: {
        mainVersion: null,
        branch: this.$t('Loading'),
        note: ''
      },
      issues: [],
      issueCategories: [],
      issuesByCategory: [{}, {}],
      issueDialogVisible: false,
      releaseVersions: [],
      releaseVersionOptions: [],
      branches: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'selectedProjectId']),
    issueCount() {
      return this.issues.length
    }
  },
  async created() {
    this.branches = []
    const response = await getBranchesByProject(this.selectedProject.repository_id)
    const branches = response.data.branch_list
    for (const branch of branches) {
      this.branches.push(branch.name)
    }
    if (branches.length > 0) {
      this.commitForm.branch = branches[0].name
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
    updateReleaseVersions(versions) {
      this.releaseVersions = versions
      this.releaseVersionOptions = []
      for (const ver of this.$parent.projectVersions) {
        if (this.releaseVersions.indexOf(ver.id) >= 0) {
          this.releaseVersionOptions.push({
            value: ver.id,
            label: ver.name
          })
        }
      }
      if (this.releaseVersionOptions.length === 1) {
        this.commitForm.mainVersion = this.releaseVersionOptions[0].label
      }
    },
    async release() {
      const params = {
        main: this.commitForm.mainVersion,
        versions: this.releaseVersions,
        branch: this.commitForm.branch,
        description: this.commitForm.note
      }
      console.log(params)
      // await createRelease(this.selectedProjectId, params)
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
      <el-form ref="form" :model="commitForm" inline>
        <el-form-item :label="$t('Release.releaseVersionName')">
          <el-select
            v-model="commitForm.mainVersion"
            :placeholder="$t('Release.selectMainVersion')"
            filterable
          >
            <el-option
              v-for="item in releaseVersionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Git.Branch')">
          <el-select
            v-model="commitForm.branch"
            :placeholder="$t('Release.selectMainVersion')"
            filterable
          >
            <el-option
              v-for="item in branches"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form>
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
