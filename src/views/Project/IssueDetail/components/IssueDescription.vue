<template>
  <el-row>
    <el-col>
      <el-row class="text-subtitle-2 mt-2 mb-3">
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
    }
  },
  data() {
    return {
      edit: false,
      newValue: this.value,
      oldValue: null,
      initTag: false
    }
  },
  watch: {
    value(newVal) {
      this.newValue = newVal
      if (!this.initTag && this.value) {
        this.oldValue = newVal
        this.initTag = true
      }
    },
    newValue(value) {
      this.$emit('input', value)
    }
  },
  mounted() {
    this.newValue = this.value
    if (!this.initTag && this.value) {
      this.oldValue = this.value
      console.log(this.value)
      this.initTag = true
    }
  },
  methods: {
    cancelInput() {
      this.newValue = this.oldValue
      this.edit = false
    }
  }
}
</script>

<style scoped>
.text-wrapper {
  white-space: pre-wrap;
}
</style>
