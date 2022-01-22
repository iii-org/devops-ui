<template>
  <el-alert type="warning" :closable="false">
    <h1><svg style="width:1em;height:1em;" viewBox="0 0 24 24">
      <path fill="currentColor" d="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z" />
    </svg> {{ $t('general.NoData') }}</h1>
  </el-alert>
</template>

<script>
export default {
  name: 'NoData'
}
</script>

<style scoped>

</style>
