<template>
  <el-card style="width: 80%; background-color: #dbdbdb;">
    <div>打包版本</div>
    <div class="text-right">
      <el-button
        :disabled="isLoading || hasOpenIssue"
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
  methods: {
    release() {
      console.log('release')
    }
  }
}
</script>
