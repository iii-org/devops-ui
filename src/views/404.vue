<template>
  <div class="error-container">
    <h2>喔哦！找不到網頁</h2>
    <h4>Oops！Page not found.</h4>
    <img
      src="@/assets/404_images/NotFound.svg"
      alt="404 error image"
    >
    <el-button
      type="primary"
      round
      @click="onClick"
    >
      {{ $t('general.BackToHome') }}
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'Page404',
  methods: {
    onClick() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>

