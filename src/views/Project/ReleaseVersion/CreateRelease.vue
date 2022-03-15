<template>
  <div class="flex justify-center">
    <el-card>
      <el-steps :active="stepActive" finish-status="success" align-center>
        <el-step title="議題版本">
          <template slot="description">
            <span>包版前請確認所有議題單是否已完結關閉，若未完全關閉，可於下方操作移轉或直接關閉，若尚未設定版本，請至上方版本管理進行版本設定。</span>
          </template>
        </el-step>
        <el-step title="程式/映像檔版本">
          <template slot="description">
            <span>請指定程式或映像檔版本，若無程式開發或不需更改，則可直接跳過。</span>
          </template>
        </el-step>
        <el-step title="打包版本">
          <template slot="description">
            <span>請確認以下程式、映像檔、議題版本是否有誤。</span>
          </template>
        </el-step>
      </el-steps>
      <section class="flex justify-center" style="margin-top: 40px;">
        <IssueVersion v-if="stepActive === 0" @onNextStep="nextStep" />
        <ImageVersion v-else-if="stepActive === 1" @onNextStep="nextStep" />
        <PackageVersion v-else-if="stepActive === 2" />
      </section>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CreateRelease',
  components: {
    IssueVersion: () => import('./IssueVersion'),
    ImageVersion: () => import('./ImageVersion'),
    PackageVersion: () => import('./PackageVersion')
  },
  data() {
    return {
      stepActive: 0
    }
  },
  methods: {
    nextStep() {
      this.stepActive += 1
    }
  }
}
</script>
