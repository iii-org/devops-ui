<template>
  <span>
    <span v-if="name" :class="getCategoryTagType(name)" />
    {{ $t(`Issue.${name}`) }}
  </span>
</template>

<script>
export default {
  name: 'Tracker',
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  methods: {
    getCategoryTagType(category) {
      switch (category) {
        case 'Feature':
          return 'point feature'
        case 'Document':
          return 'point document'
        case 'Bug':
          return 'point bug'
        case 'Research':
          return 'point research'
        default:
          return 'point feature'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
  display: inline-block;
  &.feature {
    background: $feature;
  }
  &.document {
    background: $document;
  }
  &.bug {
    background: $bug;
  }
  &.research {
    background: $research;
  }
}
</style>
