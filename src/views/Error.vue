<template>
  <el-row>
    <el-col id="error">
      <div class="title">Error</div>
      <div class="status">{{ errorStatus }}</div>
      <div class="message">{{ errorMessage }}</div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'Error',
  props: {
    error: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    errorStatus() {
      return this.error.status
    },
    errorMessage() {
      return this.error.data.error.message
    }
  }
}
</script>

<style lang="scss" scoped>
#error {
  font-family: DIN Condensed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  > .title {
    font-size: 80px;
    line-height: 80px;
    letter-spacing: 30px;
  }
  > .status {
    font-size: 150px;
    line-height: 150px;
    letter-spacing: 30px;
  }
  > .message {
    font-size: 40px;
    line-height: 40px;
    padding-right: 30px; // letter-spacing offset
  }
}
</style>
