<template>
  <span>
    <span v-if="name" :class="`point ${mapTagType(type)}`" />
    <span>{{ name }}</span>
  </span>
</template>

<script>
export default {
  name: 'Tracker',
  props: {
    name: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  methods: {
    mapTagType(category) {
      const map = {
        Document: 'bg-document',
        Research: 'bg-research',
        Epic: 'bg-epic',
        Audit: 'bg-audit',
        Feature: 'bg-feature',
        Bug: 'bg-bug',
        Issue: 'bg-issue',
        'Change Request': 'bg-changeRequest',
        Risk: 'bg-risk',
        'Test Plan': 'bg-testPlan',
        'Fail Management': 'bg-failManagement'
      }
      return map[category] || 'bg-feature'
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.point {
  @apply w-2.5 h-2.5 mr-1 rounded-lg inline-block;
}
</style>
