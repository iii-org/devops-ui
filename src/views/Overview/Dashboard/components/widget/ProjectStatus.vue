<template>
  <el-tag :type="type">
    {{ $t('Dashboard.ADMIN.Overview.' + name) }}
  </el-tag>
</template>

<script>
export default {
  name: 'ProjectStatus',
  props: {
    name: {
      type: String,
      default: null
    }
  },
  computed: {
    type() {
      switch (this.name) {
        case 'overdue':
          return 'danger'
        case 'not_started':
          return 'info'
        case 'started':
          return 'success'
        default:
          return null
      }
    }
  }
}
</script>

<style scoped>

</style>
