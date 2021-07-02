<template>
  <span v-if="edit">
    <span class="el-input inline">
      <input
        v-model="newValue"
        v-autowidth="{maxWidth: '960px', minWidth: '20px', comfortZone: 0}"
        type="text"
        :placeholder="$t('general.Title')"
        class="el-input__inner text-h5"
        @keydown.meta.esc="cancelInput"
      >
    </span>
  </span>
  <span v-else @click="edit=true">{{ value }}</span>
</template>

<script>
import VueInputAutoWidth from 'vue-input-autowidth'
import Vue from 'vue'

Vue.use(VueInputAutoWidth)

export default {
  name: 'IssueTitle',
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
.inline{
  display: inline;
}
</style>
