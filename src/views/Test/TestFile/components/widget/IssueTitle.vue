<template>
  <span v-if="edit">
    <span class="el-input inline">
      <input
        v-model="newValue"
        v-autowidth="{maxWidth: '70%', minWidth: '20px', comfortZone: 0}"
        type="text"
        :placeholder="$t('general.Title')"
        class="el-input__inner text-h6"
      >
    </span>
  </span>
  <span v-else class="text-h6 font-weight-regular" @click="edit=true">{{ value }}</span>
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
.inline{
  display: inline;
}
</style>
