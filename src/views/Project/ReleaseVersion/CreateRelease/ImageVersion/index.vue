"<template>
  <el-card style="width: 80%; background-color: #dbdbdb;">
    <div class="flex justify-between">
      <el-form
        ref="form"
        :inline="true"
        :model="commitForm"
      >
        <el-row>
          <!-- <el-col :span="24">
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
          </el-col> -->
          <el-col :span="8">
            <el-form-item :label="$t('Git.Branch')" style="padding-right: 10px;">
              <el-select
                v-if="branches.length > 0"
                v-model="commitForm.branch"
                filterable
                @change="handleSelectedRepoName(commitForm.branch)"
              >
                <el-option
                  v-for="item in branches"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
              <div v-else>{{ $t('general.Nothing') }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('Git.Commit')">
              <el-input v-if="commitId" v-model="commitId" disabled />
              <div v-else>{{ $t('general.Nothing') }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              {{ $t('PodsList.Image') }}:
              <span
                v-if="hasHarborTag"
                class="custom-black"
                style="line-height: 40px;"
              >
                <svg-icon v-if="!checkHarborLoading" icon-class="ion-git-commit-outline" />
                {{ checkHarborLoading ? $t('Updating') : hasImage() }}
              </span>
              <span v-else>
                <span class="text-danger mr-3">
                  <em class="el-icon-warning" />
                  <span>{{ $t('Issue.NoImage') }}</span>
                </span>
              </span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-button
        :type="isOpenTable ? 'danger' : 'primary'"
        :class="isOpenTable ? 'el-icon-arrow-up' : 'el-icon-setting'"
        class="mr-2"
        style="height: 40px;"
        @click="isOpenTable = !isOpenTable"
      >
        {{ isOpenTable ? '確定選擇' : '修改映像檔' }}
      </el-button>
    </div>
    <ImageList
      v-if="isOpenTable"
      :branches="branches"
      :commit-id="commitId"
      @onChangeImage="onChangeImage"
    />
    <div class="text-right">
      <el-button
        :disabled="isLoading"
        @click="onBack"
      >
        <i class="el-icon-back" />
        上一步
      </el-button>
      <el-button
        v-if="hasHarborTag"
        :disabled="isLoading"
        @click="onNext"
      >
        下一步
        <i class="el-icon-right" />
      </el-button>
      <el-popconfirm
        v-else
        :confirm-button-text="$t('Issue.DetermineContinue')"
        :cancel-button-text="$t('general.Cancel')"
        :title="$t('Issue.NoImageWarning')"
        icon="el-icon-info"
        icon-color="red"
        @confirm="onNext"
      >
        <el-button
          slot="reference"
          :disabled="isLoading"
        >
          下一步
          <i class="el-icon-right" />
        </el-button>
      </el-popconfirm>
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { getBranchesByProject } from '@/api/branches'
import { getMemberCommitListByBranch } from '@/api/commitList'
import { getHarborRepoList, getRepoArtifacts } from '@/api/harbor'

export default {
  name: 'ImageVersion',
  components: {
    ImageList: () => import('./ImageList')
  },
  inject: ['releaseData'],
  data() {
    return {
      isLoading: false,
      isOpenTable: false,
      commitForm: {
        mainVersion: null,
        branch: '',
        note: ''
      },
      branches: [],
      branchesData: [],
      commitId: '',
      repoArtifact: {},
      selectedVersions: [],
      hasHarborTag: null,
      checkHarborLoading: false,
      selectedRepo: '',
      releaseVersionOptions: [],
      image: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'selectedProjectId']),
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
    },
    imageName() {
      return this.repoArtifact.data ? this.repoArtifact.data[0].name : '-'
    }
  },
  watch: {
    'commitForm.branch': {
      handler(val) {
        if (val) {
          this.handleSelectedRepoName(val)
        }
      },
      immediate: true
    },
    selectedProject: {
      handler(val) {
        this.getBranchesData()
        this.commitForm.note = ''
      }
    }
  },
  mounted() {
    if (this.selectedProject < 0) return
    this.getBranchesData()
    console.log(this.releaseData.versions, this.releaseData.versions.length)
    // if (this.releaseData.versions && this.releaseData.versions.length > 0) {
    //   this.updateReleaseVersions()
    // }
  },
  methods: {
    async getBranchesData() {
      this.branches = []
      this.loading = true
      const res = await getBranchesByProject(this.selectedRepositoryId)
      this.setBranchesData(res.data)
      this.setFormData()
      this.getMemberCommitListByBranch()
    },
    setBranchesData(data) {
      data.branch_list.sort((itemA, itemB) => {
        const timeA = Date.parse(itemA.last_commit_time)
        const timeB = Date.parse(itemB.last_commit_time)
        return timeB - timeA
      })
      this.branchesData = data['branch_list']
    },
    setFormData() {
      for (const branch of this.branchesData) {
        this.branches.push(branch.name)
      }
      if (this.branchesData.length > 0) {
        this.commitForm.branch = this.branchesData[0].name
      } else {
        this.commitForm.mainVersion = null
        this.commitForm.branch = this.$t('Loading')
      }
    },
    async getMemberCommitListByBranch() {
      const params = { branch: this.commitForm.branch }
      const res = await getMemberCommitListByBranch(this.selectedRepositoryId, params)
      const commitId = res.data.length !== 0 ? res.data[0].short_id : null
      const harborCommitId = commitId !== null ? commitId.substring(0, commitId.length - 1) : null
      this.commitId = harborCommitId
      this.loading = false
    },
    async checkHarborImage() {
      this.repoArtifact = await getRepoArtifacts(this.selectedRepo, this.commitId)
      if (this.repoArtifact.data && this.repoArtifact.data.length > 0) this.hasHarborTag = true
      else this.hasHarborTag = false
      this.checkHarborLoading = false
    },
    async handleSelectedRepoName(repo) {
      if (!repo) return
      this.hasHarborTag = true
      this.checkHarborLoading = true
      this.onChangeCommitId(repo)
      const harborData = await getHarborRepoList(this.selectedProjectId)
      this.checkSelectedRepoName(harborData.data, repo)
    },
    onChangeCommitId(repo) {
      const branch = this.branchesData.find(branch => branch.name === repo)
      this.commitId = branch.short_id
    },
    checkSelectedRepoName(harborData, repo) {
      if (!harborData) {
        this.checkHarborLoading = false
        return
      }
      const repoNameArray = harborData.map((item) => item.name.split('/')[1])
      const repoNameIndex = repoNameArray.findIndex((repoName) => repoName === repo)
      if (repoNameIndex === -1) {
        this.repoArtifact = {}
        this.hasHarborTag = false
        this.checkHarborLoading = false
      } else {
        this.selectedRepo = harborData[repoNameIndex].name
        this.checkHarborImage()
      }
    },
    // updateReleaseVersions() {
    //   this.commitForm.mainVersion = null
    //   this.selectedVersions = this.releaseData.versions
    //   this.releaseVersionOptions = []
    //   for (const ver of this.releaseData.projectVersions) {
    //     if (this.selectedVersions.indexOf(ver.id) >= 0) {
    //       this.releaseVersionOptions.push({
    //         value: ver.id,
    //         label: ver.name
    //       })
    //     }
    //   }
    //   if (this.selectedVersions.length === 1) {
    //     this.commitForm.mainVersion = this.selectedVersions[0]
    //     this.commitForm.note = ''
    //   }
    // },
    onBack() {
      this.$emit('onBack')
    },
    onNext() {
      this.releaseData.commit = this.commitId
      this.releaseData.branch = this.commitForm.branch
      this.releaseData.image = this.getReleaseImage()
      // this.releaseData.main = this.getReleaseVersion().value
      this.$emit('onNext')
    },
    onChangeImage(row) {
      this.commitForm.branch = row.branch
      this.commitId = row.commit_id
      if (row.image) {
        this.image = row.commit_id
        this.hasHarborTag = true
      } else this.image = 'noImage'
    },
    /**
     * @summary default image value should be ${imageName},
     * if user selects the image in the image list, replace ${imageName} by ${image}
     */
    hasImage() {
      if (this.image === 'noImage') this.hasHarborTag = null
      else return this.image ? this.image : this.imageName
    },
    getReleaseImage() {
      if (this.hasHarborTag && !this.image) return this.imageName
      else return this.image
    }
    // getReleaseVersion() {
    //   return this.releaseVersionOptions.find(option => option.value === this.commitForm.mainVersion)
    // }
  }
}
</script>
