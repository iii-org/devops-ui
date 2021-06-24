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
        @keydown.ctrl.esc="cancelInput"
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
      if (!this.initTag) {
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
    if (!this.initTag) {
      this.oldValue = this.value
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
.inline{
  display: inline;
}
</style>
