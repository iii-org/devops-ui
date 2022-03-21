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
              請指定程式或映像檔版本，若無程式開發或不需更改，則可
              <el-button type="text" size="mini" @click="stepActive += 1">直接跳過</el-button>
              。
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
        <!-- <KeepAlive> -->
        <IssueVersion v-if="stepActive === 0" @onNext="next" />
        <ImageVersion v-else-if="stepActive === 1" :release-data="releaseData" @onNext="next" @onBack="back" />
        <PackageVersion v-else-if="stepActive === 2" />
        <!-- </KeepAlive> -->
      </section>
    </el-card>
    <el-dialog :visible.sync="isShowVersions" width="60%">
      <ProjectVersions v-if="isShowVersions" :is-show-title="true" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
      releaseData: {
        issues: [],
        releaseVersions: [],
        projectVersions: []
      }
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
    next(data) {
      this.stepActive += 1
      console.log(data.issues)
      console.log(data.releaseVersions)
      this.releaseData.issues = data.issues
      this.releaseData.releaseVersions = data.releaseVersions
      this.releaseData.projectVersions = data.projectVersions
    },
    back() {
      this.stepActive -= 1
    }
  }
}
</script>
