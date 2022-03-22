<template>
  <el-card style="width: 80%; background-color: #dbdbdb;">
    <div>
      <el-form>
        <el-row>
          <el-col :span="24">
            <el-form-item label="議題版本">
              <span>本版本共完成</span>
              <span style="color: #409eff;">{{ releaseData.issues.length }}</span>
              <span>議題</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="程式/映像檔">
              <svg-icon icon-class="ion-git-commit-outline" />
              <span>{{ releaseData.commit }} ({{ releaseData.branch }}) / </span>
              <span
                v-if="releaseData.image !== 'noImage'"
                class="custom-black"
                style="line-height: 40px;"
              >
                <svg-icon icon-class="ion-git-commit-outline" />
                {{ releaseData.image }}
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
            <!-- <el-form-item label="包版版號" class="flex">
              <el-input v-model="mainVersion.name" disabled />
            </el-form-item> -->
          </el-col>
          <el-col :span="16">
            <el-form-item label="映像檔路徑" class="flex cursor-pointer">
              <el-tooltip content="project/branch:version" placement="top">
                <el-input v-model="imagePath">
                  <template slot="prepend">
                    <span class="cursor-pointer">{{ imageProject }}</span>
                  </template>
                </el-input>
              </el-tooltip>
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
                placeholder="請輸入版本說明，也可透過上方之議題版本內的已關閉議題清單進行複製、貼到此處。"
                :rows="8"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="color: red; font-size: 8px;">*包版版號與映像檔路徑皆可多個，唯版本路徑僅可至多兩個</div>
    </div>
    <div class="text-right">
      <el-button
        @click="onBack"
      >
        <i class="el-icon-back" />
        上一步
      </el-button>
      <el-button
        :disabled="!releaseData.main"
        @click="release"
      >
        開始包版
      </el-button>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'PackageVersion',
  inject: ['releaseData'],
  data() {
    return {
      mainVersion: '',
      // getImagePath: '',
      imagePath: '{{branch}}:{{version}}',
      note: '',
      releaseVersionOptions: []
    }
  },
  computed: {
    // imagePath() {
    //   if (!this.mainVersion) return '{{branch}}:{{version}}'
    //   const version = this.releaseVersionOptions.find(option => option.value === this.mainVersion)
    //   return `${this.releaseData.branch} : ${version.label}`
    // },
    imageProject() {
      if (!this.mainVersion) return '{{project}}/'
      const version = this.releaseData.projectVersions.find(option => option.id === this.mainVersion)
      return `${version.project.name}/`
    }
    // mainVersion() {
    //   return this.releaseData.projectVersions.find(version => {
    //     return version.id === this.releaseData.main
    //   })
    // }
  },
  watch: {
    mainVersion: {
      handler(val) {
        if (!val) return '{{branch}}:{{version}}'
        const version = this.releaseVersionOptions.find(option => option.value === val)
        this.imagePath = `${this.releaseData.branch} : ${version.label}`
      },
      immediate: true
    }
  },
  mounted() {
    // this.getImagePath = `${this.releaseData.branch} : ${this.mainVersion}`
    if (this.releaseData.versions && this.releaseData.versions.length > 0) {
      this.updateReleaseVersions()
    }
  },
  methods: {
    release() {
      console.log('release')
    },
    onBack() {
      this.$emit('onBack')
    },
    updateReleaseVersions() {
      this.releaseVersionOptions = []
      for (const ver of this.releaseData.projectVersions) {
        if (this.releaseData.versions.indexOf(ver.id) >= 0) {
          this.releaseVersionOptions.push({
            value: ver.id,
            label: ver.name
          })
        }
      }
    }
  }
}
</script>
