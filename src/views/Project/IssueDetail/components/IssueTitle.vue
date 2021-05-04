<template>
  <el-input
    v-if="edit"
    v-model="newValue"
    style="display:inline-block;"
    :placeholder="$t('RuleMsg.PleaseInput')"
  />
  <span v-else>{{ value }} <el-button icon="el-icon-edit" size="mini" @click="edit=true">{{ $t('general.Edit') }}</el-button>
  </span>
</template>

<script>
export default {
  name: 'IssueTitle',
  props: {
    value: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      edit: false,
      newValue: this.value
    }
  },
  watch: {
    value(newVal) {
      this.newValue = newVal
    },
    newValue(value) {
      this.$emit('input', value)
    }
  },
  mounted() {
    this.newValue = this.value
  }
}
</script>

<style scoped>

</style>
