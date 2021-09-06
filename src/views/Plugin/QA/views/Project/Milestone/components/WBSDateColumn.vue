<template>
  <el-table-column v-bind="$props">
    <template slot-scope="{row, $index}">
      <template v-if="row.create">
        <el-date-picker
          v-model="row[prop]"
          type="date"
          value-format="yyyy-MM-dd"
          :clearable="false"
          style="width: 100%"
          @keyup.enter.native="handlerCreate(row, $index)"
          @keyup.esc.native="handlerResetCreate(row, $index)"
        />
      </template>
      <template v-else-if="row.editColumn===prop&&editable(row)">
        <el-date-picker
          v-model="row[prop]"
          type="date"
          value-format="yyyy-MM-dd"
          :clearable="false"
          style="width: 100%"
          @change="handlerEdit(row, $index)"
          @keyup.esc.native="handlerReset(row, $index)"
        />
      </template>
      <template v-else>
        {{ row[prop] }}
      </template>
    </template>
  </el-table-column>
</template>

<script>
import i18n from '@/lang'

export default {
  name: 'WBSInputNumberColumn',
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: i18n.t('general.LastUpdateTime')
    },
    minWidth: {
      type: String,
      default: null
    },
    width: {
      type: String,
      default: null
    },
    sortable: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    hasChildEdit: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    hasRequired(row) {
      return this.required && row[this.prop].length <= 0
    },
    editable(row) {
      if (this.hasChildEdit) {
        return true
      } else {
        return !row['has_children']
      }
    },
    handlerEdit(row, index) {
      this.$emit('edit', { value: { [this.prop]: row[this.prop] }, row: row, index: index })
    },
    handlerCreate(row, index) {
      this.$emit('create', { value: { [this.prop]: row[this.prop] }, row: row, index: index })
    },
    handlerReset(row, index) {
      this.$emit('reset-edit', { value: this.prop, row: row, index: index })
    },
    handlerResetCreate(row, index) {
      this.$emit('reset-create', { value: this.prop, row: row, index: index })
    }
  }
}
</script>
