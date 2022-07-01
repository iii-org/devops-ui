<template>
  <el-tag
    :type="getPriorityTagType(type)"
    :size="size"
  >
    {{ name }}
  </el-tag>
</template>

<script>
export default {
  name: 'Priority',
  props: {
    name: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  methods: {
    getPriorityTagType(priority) {
      switch (priority) {
        case 'Immediate':
          return 'danger'
        case 'High':
          return 'warning'
        case 'Normal':
          return ''
        case 'Low':
          return 'info'
      }
    }
  }
}
</script>
