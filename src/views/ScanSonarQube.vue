<script>
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'ScanSonarQube',
  mixins: [MixinElTableWithAProject]
}
</script>

<template>
  <div class="app-container">
    <project-list-selector />
  </div>
</template>

<style scoped>

</style>
