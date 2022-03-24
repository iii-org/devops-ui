<template>
  <div>
    <el-card>
      <el-steps :active="stepActive" finish-status="success" align-center>
        <el-step title="議題版本">
          <template v-if="stepActive === 0" slot="description">
            <span>
              包版前請確認所有議題單是否已完結關閉，若未完全關閉，可於下方操作移轉或直接關閉，若尚未設定版本，請至上方
              <el-button type="text" size="mini" @click="isShowVersions = true">版本管理</el-button>
              進行版本設定。
            </span>
          </template>
        </el-step>
        <el-step title="程式/映像檔版本">
          <template v-if="stepActive === 1" slot="description">
            <span>
              請指定程式或映像檔版本，若無程式開發或不需更改，則可直接跳過。
            </span>
          </template>
        </el-step>
        <el-step title="打包版本">
          <template v-if="stepActive === 2" slot="description">
            <span>請確認以下程式、映像檔、議題版本是否有誤。</span>
          </template>
        </el-step>
      </el-steps>
      <section class="flex justify-center" style="margin-top: 40px;">
        <IssueVersion
          v-if="stepActive === 0"
          :release-data="releaseData"
          @onNext="next"
          @initReleaseData="initData"
        />
        <ImageVersion
          v-else-if="stepActive === 1"
          :release-data="releaseData"
          :update-data="updateData"
          @onNext="next"
          @onBack="back"
        />
        <PackageVersion
          v-else-if="stepActive === 2"
          :release-data="releaseData"
          :update-data="updateData"
          @onBack="back"
          @initState="initState"
        />
      </section>
    </el-card>
    <el-dialog :visible.sync="isShowVersions" width="60%">
      <ProjectVersions v-if="isShowVersions" :is-show-title="true" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

/**
 * @summary for release data
 */
const releaseData = () => ({
  branch: '',
  commit: '',
  extra_image_path: '', // only for extra image path
  forced: true,
  main: '', // main version
  note: '',
  versions: []
})

/**
 * @summary for those data which is not used by releasing
 */
const updateData = () => ({
  issues: [],
  projectVersions: [],
  image: ''
})

export default {
  name: 'CreateRelease',
  components: {
    IssueVersion: () => import('./IssueVersion/index'),
    ImageVersion: () => import('./ImageVersion/index'),
    PackageVersion: () => import('./PackageVersion'),
    ProjectVersions: () => import('@/views/Plan/Settings/components/ProjectVersions')
  },
  data() {
    return {
      stepActive: 0,
      isShowVersions: false,
      releaseData: releaseData(),
      updateData: updateData()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    selectedProjectId(val) {
      this.stepActive = 0
    }
  },
  methods: {
    setData(releaseData, updateData) {
      this.handleSetData(releaseData, 'releaseData')
      if (Object.keys(updateData).length > 0) this.handleSetData(updateData, 'updateData')
    },
    initData() {
      this.setData(releaseData(), updateData())
    },
    next(releaseData, updateData) {
      this.setData(releaseData, updateData)
      this.stepActive += 1
    },
    back(releaseData, updateData) {
      this.setData(releaseData, updateData)
      this.stepActive -= 1
    },
    initState() {
      this.$emit('initState')
    },
    handleSetData(data, key) {
      Object.keys(data).forEach((item) => {
        this[key][item] = data[item]
      })
    }
  }
}
</script>
