<template>
  <el-select v-model="selected" multiple v-bind="$attrsAll" :value-key="valueKey" v-on="$listenserAll" @change="onChange">
    <el-option v-for="item in mdoptionsList" :key="item.key" :label="item.label" :value="item.value" :disabled="loading" />
  </el-select>
</template>

<script>
export default {
  name: 'ElSelectAll',
  props: {
    value: {
      type: Array,
      default: () => {
        return []
      }
    },
    valueKey: {
      type: String,
      default: null
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const selected = this.value || []
    return {
      selected,
      mdoptionsValue: [],
      oldMdoptionsValue: [],
      mdoptionsList: []
    }
  },
  computed: {
    $attrsAll() {
      return {
        ...this.$attrs
      }
    },
    $listenserAll() {
      const _this = this
      return Object.assign({}, this.$listeners, {
        change: () => {
          this.$emit('change', (_this.selected || []).filter(v => {
            return v !== 'all'
          }))
        },
        input: () => {
          this.$emit('input', (_this.selected || []).filter(v => {
            return v !== 'all'
          }))
        }
      })
    }
  },
  watch: {
    value(value) {
      this.selected = value
    },
    selected: {
      immediate: true,
      deep: true,
      handler(val) {
        this.$emit('input', (val || []).filter(v => {
          return v !== 'all'
        }))
      }
    },
    options: {
      immediate: true,
      deep: true,
      handler(val) {
        if (!val || val.length === 0) {
          this.mdoptionsList = []
        } else {
          this.mdoptionsList = [{
            key: 'all',
            value: 'all',
            label: this.$t('general.All')
          }, ...val]
        }
      }
    }
  },
  mounted() {
    this.selected = this.value
  },
  methods: {
    onChange(val) {
      // eslint-disable-next-line no-debugger
      const allValues = []
      for (const item of this.mdoptionsList) {
        allValues.push(item.value)
      }
      const oldVal = this.oldMdoptionsValue.length === 1 ? [] : this.oldMdoptionsValue[1] || []
      if (val.includes('all')) this.selected = allValues
      if (oldVal.includes('all') && !val.includes('all')) this.selected = []
      if (oldVal.includes('all') && val.includes('all')) {
        const index = val.indexOf('all')
        val.splice(index, 1)
        this.selected = val
      }
      if (!oldVal.includes('all') && !val.includes('all')) {
        if (val.length === allValues.length - 1) this.selected = ['all'].concat(val)
      }
      this.oldMdoptionsValue[1] = this.selected
    }
  }
}
</script>
