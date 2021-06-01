<template>
  <el-row>
    <el-col>
      <el-row class="text-subtitle-2 mt-2 mb-3">
        {{ $t('Issue.Description') }}
      </el-row>
      <el-form v-if="edit">
        <el-input
          v-model="newValue"
          type="textarea"
          rows="4"
          style="width: 100%"
          :placeholder="$t('RuleMsg.PleaseInput')"
        />
      </el-form>
      <el-col v-else><div class="text-wrapper">{{ value }}</div><el-button icon="el-icon-edit" size="mini" @click="edit=true">{{ $t('general.Edit') }}</el-button></el-col>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'IssueDescription',
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
.text-wrapper {
  white-space: pre-wrap;
}
</style>
