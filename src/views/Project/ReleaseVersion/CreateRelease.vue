<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <span class="el-link">{{ $t('Release.issueCount') }}</span>&nbsp;
        <el-link underline type="primary" @click="openIssueDialog(null)">
          {{ $t('Release.issueCountLink', [issues.length]) }}
        </el-link>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <ul>
          <li v-for="(arr, cat) in issuesByCategory[0]" :key="cat">
            <span class="el-link">{{ cat }}</span> (
            <el-link underline type="primary" @click="openIssueDialog(cat)">
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
            <el-link underline type="primary" @click="openIssueDialog(cat)">
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
          <el-select v-model="commitForm.mainVersion" :placeholder="$t('Release.selectMainVersion')" filterable>
            <el-option
              v-for="item in releaseVersionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Git.Branch')">
          <el-select v-model="commitForm.branch" filterable @change="handleSelectedRepoName(commitForm.branch)">
            <el-option v-for="item in branches" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item style="font-size: 20px; color: #606206;">
          Harbor:
          <span v-if="showHarborTag" style="line-height: 40px;">
            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
            {{ repoArtifactName }}
          </span>
          <span v-else>
            <span style="color: red; margin-right: 30px;">
              <i class="el-icon-warning" />
              <span>{{ $t('Issue.NoImage') }}</span>
            </span>
            <span>
              <el-popconfirm
                :confirm-button-text="$t('Issue.DetermineContinue')"
                :cancel-button-text="$t('general.Cancel')"
                :title="$t('Issue.NoImageWarning')"
                icon="el-icon-info"
                icon-color="red"
                @onConfirm="handleConfirm"
              >
                <el-button slot="reference" type="success">{{ $t('Issue.NextStep') }}</el-button>
              </el-popconfirm>
              <el-button type="danger" @click="handleCancel">{{ $t('general.Cancel') }}</el-button>
            </span>
          </span>
        </el-form-item>
      </el-form>
      <el-form v-if="isConfirmPackageVersion || showHarborTag">
        <el-form-item>
          <el-input v-model="commitForm.note" type="textarea" style="width: 60%;" :rows="6" />
        </el-form-item>
        <el-form-item>
          <el-button v-loading.fullscreen.lock="fullscreenLoading" type="success" @click="release">
            <span class="el-icon-goods" />
            {{ $t('Release.startRelease') }}
          </el-button>
        </el-form-item>
      </el-form>
    </p>
    <issue-list-dialog ref="issueDialog" />
  </div>
</template>

<script>
import IssueListDialog from './IssueListDialog'
import { mapGetters } from 'vuex'
import { getBranchesByProject } from '@/api/branches'
import { createRelease } from '@/api/release'
import { getHarborRepoList, getProjectArtifacts, getRepoArtifacts } from '@/api/harbor'

export default {
  name: 'CreateRelease',
  components: { IssueListDialog },
  data() {
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
      branches: [],
      fullscreenLoading: false,
      repoArtifact: {},
      showHarborTag: null,
      selectedRepo: '',
      commitId: '',
      isConfirmPackageVersion: false
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'selectedProjectId']),
    issueCount() {
      return this.issues.length
    },
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
    },
    repoArtifactName() {
      return this.repoArtifact.data ? this.repoArtifact.data[0].name : '-'
    }
  },
  watch: {
    'commitForm.branch': {
      handler(val) {
        if (val && val !== this.$t('Loading')) {
          this.handleSelectedRepoName(val)
        }
      },
      immediate: true
    }
  },
  async created() {
    if (this.selectedProjectId < 0) {
      return
    }
    this.branches = []
    const response = await getBranchesByProject(this.selectedRepositoryId)
    response.data.branch_list.sort((itemA, itemB) => {
      const timeA = Date.parse(itemA.last_commit_time)
      const timeB = Date.parse(itemB.last_commit_time)
      return timeB - timeA
    })
    const branches = response.data['branch_list']
    this.commitId = response.data.short_id
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
    },
    updateReleaseVersions(versions) {
      this.commitForm.mainVersion = null
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
      if (this.releaseVersions.length === 1) {
        this.commitForm.mainVersion = this.releaseVersions[0]
      }
    },
    async release() {
      if (!this.commitForm.mainVersion) {
        this.$message.error(this.$t('Release.selectMainVersion'))
        return
      }
      this.fullscreenLoading = true
      const params = {
        main: this.commitForm.mainVersion,
        versions: this.releaseVersions,
        branch: this.commitForm.branch,
        note: this.commitForm.note,
        commit: this.commitId,
        forced: true
      }
      try {
        await createRelease(this.selectedProjectId, params)
      } catch (e) {
        this.fullscreenLoading = false
        return
      }
      let mainName
      for (const opt of this.releaseVersionOptions) {
        if (opt.value === this.commitForm.mainVersion) {
          mainName = opt.label
          break
        }
      }
      this.$message({
        message: this.$t('Release.releaseDone', [mainName]),
        type: 'success'
      })
      this.fullscreenLoading = false
      this.$parent.reset()
    },
    async checkHarborImage() {
      const projectArifact = await getProjectArtifacts(this.selectedRepo)
      this.repoArtifact = await getRepoArtifacts(this.selectedRepo, projectArifact.data[0].name)
      if (this.repoArtifact.data && this.repoArtifact.data.length > 0) this.showHarborTag = true
    },
    async handleSelectedRepoName(repo) {
      const harborData = await getHarborRepoList(this.selectedProjectId)
      this.checkSelectedRepoName(harborData.data, repo)
    },
    checkSelectedRepoName(harborData, repo) {
      if (!harborData) return
      const repoNameArray = harborData.map(item => item.name.split('/')[1])
      const repoNameIndex = repoNameArray.findIndex(repoName => repoName === repo)
      if (repoNameIndex === -1) {
        this.repoArtifact = {}
        this.showHarborTag = false
      } else {
        this.selectedRepo = harborData[repoNameIndex].name
        this.checkHarborImage()
      }
    },
    handleCancel() {
      this.$emit('initialState')
      this.isConfirmPackageVersion = false
    },
    handleConfirm() {
      this.isConfirmPackageVersion = true
    }
  }
}
</script>

<style scoped>
.el-link {
  font-size: large;
}
</style>
