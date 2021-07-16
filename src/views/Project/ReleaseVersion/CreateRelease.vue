<template>
  <div class="app-container">
    <el-row class="mb-2">
      <el-col :span="24">
        <span class="el-link">{{ $t('Release.issueCount') }}</span>&nbsp;
        <el-link underline type="primary" @click="openIssueDialog(null)">
          {{ $t('Release.issueCountLink', [issues.length]) }}
        </el-link>
      </el-col>
    </el-row>
    <el-card shadow="hover">
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
    </el-card>
    <br>
    <div class="font-bold text-lg mb-2">{{ $t('Release.packageVersionSettings') }}</div>
    <el-row class="flex">
      <el-col :span="9" class="mr-4">
        <el-card shadow="hover" style="height: 400px;">
          <div class="mb-4 font-bold">{{ $t('Release.releaseVersionName') }}/{{ $t('Git.Branch') }}/{{ $t('PodsList.Image') }}</div>
          <el-form ref="form" :model="commitForm">
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
            <el-form-item :label="$t('Git.Commit')">
              <div>
                <svg-icon icon-class="ion-git-commit-outline" />
                {{ commitId }}
              </div>
            </el-form-item>
            <el-form-item>
              {{ $t('PodsList.Image') }}:
              <span v-if="showHarborTag" class="custom-black" style="line-height: 40px;">
                <svg-icon icon-class="ion-git-commit-outline" />
                {{ repoArtifactName }}
              </span>
              <span v-else>
                <span class="text-danger mr-3">
                  <i class="el-icon-warning" />
                  <span>{{ $t('Issue.NoImage') }}</span>
                </span>
                <div style="margin-top: 35px;">
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
                </div>
              </span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="15">
        <el-card shadow="hover" style="height: 400px;">
          <div class="mb-4 font-bold">{{ $t('Release.releaseNote') }}</div>
          <el-form>
            <el-form-item>
              <el-input v-model="commitForm.note" class="w-full" type="textarea" :rows="11" />
            </el-form-item>
            <el-form-item>
              <el-button v-if="isConfirmPackageVersion || showHarborTag" v-loading.fullscreen.lock="fullscreenLoading" type="success" @click="release">
                <span class="el-icon-goods" />
                {{ $t('Release.startRelease') }}
              </el-button>
              <el-button v-else v-loading.fullscreen.lock="fullscreenLoading" type="info" disabled>
                <span class="el-icon-goods" />
                {{ $t('Release.startRelease') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <issue-list-dialog ref="issueDialog" />
    </el-row>
  </div>
</template>

<script>
import IssueListDialog from './IssueListDialog'
import { mapGetters } from 'vuex'
import { getBranchesByProject } from '@/api/branches'
import { createRelease } from '@/api/release'
import { getHarborRepoList, getRepoArtifacts } from '@/api/harbor'

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
      isConfirmPackageVersion: false,
      branchesData: [],
      listLoading: false
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
          this.setCommitId(val)
          this.handleSelectedRepoName(val)
        }
      },
      immediate: true
    },
    selectedProject: {
      handler(val) {
        this.getBranchesData()
      }
    }
  },
  async created() {
    if (this.selectedProjectId < 0) {
      return
    }
    this.getBranchesData()
  },
  methods: {
    async getBranchesData() {
      this.branches = []
      const response = await getBranchesByProject(this.selectedRepositoryId)
      response.data.branch_list.sort((itemA, itemB) => {
        const timeA = Date.parse(itemA.last_commit_time)
        const timeB = Date.parse(itemB.last_commit_time)
        return timeB - timeA
      })
      this.branchesData = response.data['branch_list']
      this.commitId = this.branchesData[0].short_id
      for (const branch of this.branchesData) {
        this.branches.push(branch.name)
      }
      if (this.branchesData.length > 0) {
        this.commitForm.branch = this.branchesData[0].name
      }
    },
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
      this.repoArtifact = await getRepoArtifacts(this.selectedRepo, this.commitId)
      if (this.repoArtifact.data && this.repoArtifact.data.length > 0) this.showHarborTag = true
      else this.showHarborTag = false
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
    },
    setCommitId(name) {
      const branchIndex = this.branchesData.findIndex(item => item.name === name)
      this.commitId = this.branchesData[branchIndex].short_id
    }
  }
}
</script>

<style scoped>
.el-link {
  font-size: large;
}
</style>
