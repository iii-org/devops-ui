<template>
  <span v-if="testFile.software_name==='Postman'" class="mt-2">
    {{ `${testFile.the_last_test_result.success}/
            ${testFile.the_last_test_result.success + testFile.the_last_test_result.failure}` }}
  </span>
  <span
    v-else-if="testFile.software_name==='SideeX'&&testFile.the_last_test_result.result"
    class="mt-2"
  >
    {{ `${testFile.the_last_test_result.result.casesPassed}/${testFile.the_last_test_result.result.casesTotal}` }}
  </span>
</template>

<script>
export default {
  name: 'Result',
  props: {
    testFile: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
</style>
