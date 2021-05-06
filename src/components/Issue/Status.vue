<template>
  <el-tag
    :type="getStatusTagType(name)"
    effect="dark"
    class="rounded-xl font-weight-bold"
    :size="size"
  >
    {{ $t(`Issue.${name}`) }}
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
    }
  },
  methods: {
    getStatusTagType(status) {
      switch (status) {
        case 'Active':
          return ''
        case 'Assigned':
          return 'danger'
        case 'Closed':
          return 'info'
        case 'Solved':
          return 'secondary'
        case 'Responded':
          return 'warning'
        case 'Finished':
          return 'success'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.el-tag {
&--secondary {
   background-color: $secondary;
   border-color: $secondary;
 }
}
</style>
