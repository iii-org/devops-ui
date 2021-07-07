<template>
  <el-row>
    <el-col>
      <el-row class="text-sm mt-2 mb-3">
        {{ $t('Issue.Description') }}
      </el-row>
      <el-form v-if="edit">
        <el-form-item :label="$t('Issue.ResetESCTip')">
          <el-input
            v-model="newValue"
            type="textarea"
            rows="4"
            style="width: 100%"
            :placeholder="$t('RuleMsg.PleaseInput')"
            @keydown.meta.esc.native="cancelInput"
          />
        </el-form-item>
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
    },
    oldValue: {
      type: String,
      default: null
    },
    issueId: {
      type: [String, Number],
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
    },
    oldValue() {
      this.edit = !this.issueId
    }
  },
  mounted() {
    this.newValue = this.value
    if (!this.issueId || !this.oldValue || this.oldValue === '') {
      this.edit = true
    }
  },
  methods: {
    cancelInput() {
      this.newValue = this.oldValue
      this.edit = !this.issueId
    }
  }
}
</script>

<style scoped>
.text-wrapper {
  white-space: pre-wrap;
}
</style>
