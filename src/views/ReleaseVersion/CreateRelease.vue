<script>
export default {
  name: 'CreateRelease',
  data: () => ({
    issues: []
  }),
  computed: {
    issueCount() {
      return this.issues.length
    }
  }
}
</script>

<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">{{ $t('Release.issueCount', { count: issueCount}) }}</el-col>
    </el-row>
  </div>
</template>

<style scoped>

</style>
