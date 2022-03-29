<template>
  <el-tag :type="getStatusTagType(type)" effect="dark" class="rounded-xl font-bold" :size="size">
    {{ name }}
  </el-tag>
</template>

<script>
export default {
  name: 'Status',
  props: {
    name: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: null
    }
  },
  methods: {
    getStatusTagType(status) {
      const map = {
        Active: 'primary',
        Assigned: 'danger',
        Closed: 'info',
        Solved: 'secondary',
        InProgress: 'warning',
        Finished: 'success',
        Verified: 'success'
      }
      return map[status] || 'primary'
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.el-tag {
  &--secondary {
    background-color: $secondary;
    border-color: $secondary;
  }
}
</style>
