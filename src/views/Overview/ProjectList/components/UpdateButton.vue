<template>
  <el-button
    size="small"
    icon="el-icon-refresh"
    class="buttonPrimaryReverse"
    :loading="listLoading"
    @click="updateProjectList"
  >
    {{ $t('Dashboard.ADMIN.UpdateNow') }}
  </el-button>
</template>

<script>

export default {
  name: 'UpdateButton',
  props: {
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    updateProjectList() {
      this.$emit('update')
    }
  }
}
</script>
