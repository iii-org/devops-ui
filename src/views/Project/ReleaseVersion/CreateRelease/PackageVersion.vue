<template>
  <el-card style="width: 80%; background-color: #dbdbdb;">
    <div>
      <el-form>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('Release.IssueVersion')">
              <span>{{ $t('Release.issueCount') }}</span>
              <span
                style="color: #409eff;"
                class="cursor-pointer"
                @click="openIssueDialog"
              >
                {{ updateData.issues.length }}
              </span>
              <span>{{ $t('Issue.Issue') }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('Release.CommitAndImage')">
              <template v-if="releaseData.commit || releaseData.branch">
                <svg-icon icon-class="ion-git-commit-outline" />
                <span>{{ releaseData.commit }}</span>
                <span v-if="releaseData.branch">({{ releaseData.branch }})</span>
              </template>
              <span v-else>{{ $t('general.Nothing') }}</span>
              <span> / </span>
              <span
                v-if="updateData.image !== 'noImage'"
                class="custom-black"
                style="line-height: 40px;"
              >
                <svg-icon icon-class="ion-git-commit-outline" />
                {{ updateData.image }}
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
        <el-row>
          <el-col :span="8">
            <el-form-item :label="$t('Release.releaseVersionName')">
              <el-select
                v-model="mainVersion"
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
          </el-col>
          <el-col :span="16">
            <el-form-item
              v-if="updateData.image !== 'noImage'"
              :label="$t('Release.ImagePath')"
              class="flex cursor-pointer"
            >
              <span>{{ imageProject }}/{{ imagePath }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('Release.releaseNote')">
              <el-input
                v-model="note"
                class="w-full"
                type="textarea"
                :placeholder="$t('Release.NotePlaceholder')"
                :rows="8"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="color: red; font-size: 8px;">*{{ $t('Release.ReleaseWarning') }}</div>
    </div>
    <div class="text-right">
      <el-button
        :disabled="isLoading"
        @click="onBack"
      >
        <em class="el-icon-back" />
        {{ $t('Release.Previous') }}
      </el-button>
      <el-button
        :disabled="!main || isLoading"
        @click="release"
      >
        {{ $t('Release.startRelease') }}
      </el-button>
    </div>
    <IssueListDialog ref="issueDialog" />
  </el-card>
</template>

<script>
import { createRelease } from '@/api_v2/release'
import { mapGetters } from 'vuex'

export default {
  name: 'PackageVersion',
  components: {
    IssueListDialog: () => import('./IssueListDialog')
  },
  props: {
    releaseData: {
      type: Object,
      default: () => ({})
    },
    updateData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isLoading: false,
      mainVersion: '',
      imagePath: '',
      note: '',
      releaseVersionOptions: []
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'selectedProject']),
    imageProject() {
      return !this.mainVersion ? `{{project}}` : `${this.selectedProject.name}`
    },
    main() {
      if (!this.mainVersion) return null
      const versionData = this.releaseVersionOptions.find(version => {
        return version.value === this.mainVersion
      })
      return versionData.value
    }
  },
  watch: {
    mainVersion: {
      handler(val) {
        if (!val || !this.releaseData.branch) return ''
        const version = this.releaseVersionOptions.find(option => option.value === val)
        this.imagePath = `${this.imageProject}:${version.label}`
      },
      immediate: true
    }
  },
  mounted() {
    if (this.releaseData.versions && this.releaseData.versions.length > 0) {
      this.updateReleaseVersions()
      this.imagePath = this.releaseData.extra_image_path
      this.mainVersion = this.releaseData.main
      this.note = this.releaseData.note
    }
  },
  methods: {
    async release() {
      const releaseData = this.setReleaseData()
      if (!this.checkImagePath(releaseData)) {
        this.stopRelease()
        return
      }
      this.isLoading = true
      await createRelease(this.selectedProjectId, releaseData)
        .then(() => {
          this.$emit('initState')
          this.$message({
            message: this.$t('Release.releaseDone', [this.main]),
            type: 'success'
          })
        })
        .catch(() => {
          this.isLoading = false
        })
    },
    setReleaseData() {
      const releaseData = JSON.parse(JSON.stringify(this.releaseData))
      releaseData.extra_image_path = this.imagePath
      releaseData.main = this.main
      releaseData.note = this.note
      return releaseData
    },
    // check if image path includes ':'
    checkImagePath(releaseData) {
      if (releaseData.extra_image_path === '') return true
      return /:/.test(releaseData.extra_image_path)
    },
    stopRelease() {
      this.$message({
        message: this.$t('Release.StopReleaseWarning'),
        type: 'error'
      })
    },
    onBack() {
      const releaseData = {
        extra_image_path: this.imagePath,
        main: this.main,
        note: this.note
      }
      this.$emit('onBack', releaseData, this.updateData)
    },
    updateReleaseVersions() {
      this.releaseVersionOptions = []
      for (const ver of this.updateData.projectVersions) {
        if (this.releaseData.versions.indexOf(ver.id) >= 0) {
          this.releaseVersionOptions.push({
            value: ver.id,
            label: ver.name
          })
        }
      }
    },
    openIssueDialog() {
      const com = this.$refs.issueDialog
      com.setData(this.updateData.issues, null)
      com.visible = true
    }
  }
}
</script>
