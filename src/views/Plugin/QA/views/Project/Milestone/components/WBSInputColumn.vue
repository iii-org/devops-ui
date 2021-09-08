<template>
  <el-table-column v-bind="$props">
    <template slot-scope="{row, $index, treeNode}">
      <template v-if="row.create">
        <el-input v-if="number"
                  ref="input"
                  v-model.number="row[prop]"
                  type="number"
                  :style="{marginLeft: treeWidth(treeNode)}"
                  @keyup.enter.native="handlerCreate(row, $index)"
                  @keyup.esc.native="handlerResetCreate(row, $index)"
        >
          <template v-if="hasRequired(row)" slot="suffix">
            <div class="text-danger">
              {{ $t('Validation.Input', [label]) }}
            </div>
          </template>
        </el-input>
        <el-input v-else ref="input"
                  v-model="row[prop]"
                  :style="{marginLeft: treeWidth(treeNode)}"
                  @keyup.enter.native="handlerCreate(row, $index)"
                  @keyup.esc.native="handlerResetCreate(row, $index)"
        >
          <template v-if="hasRequired(row)" slot="suffix">
            <div class="text-danger">
              {{ $t('Validation.Input', [label]) }}
            </div>
          </template>
        </el-input>
      </template>
      <template v-else-if="row.editColumn===prop&&editable(row)">
        <el-input v-if="number"
                  ref="input"
                  v-model.number="row[prop]"
                  type="number"
                  :style="{marginLeft: treeWidth(treeNode)}"
                  @blur="handlerBlur(row, $index, treeNode)"
                  @keyup.enter.native="handlerEdit(row, $index, treeNode)"
                  @keyup.esc.native="handlerReset(row, $index, treeNode)"
        >
          <template v-if="hasRequired(row)" slot="suffix">
            <div class="text-danger">
              {{ $t('Validation.Input', [label]) }}
            </div>
          </template>
        </el-input>
        <el-input v-else ref="input"
                  v-model="row[prop]"
                  :style="{width: treeWidth(treeNode)}"
                  @blur="handlerBlur(row, $index, treeNode)"
                  @keyup.enter.native="handlerEdit(row, $index, treeNode)"
                  @keyup.esc.native="handlerReset(row, $index, treeNode)"
        >
          <template v-if="hasRequired(row)" slot="suffix">
            <div class="text-danger">
              {{ $t('Validation.Input', [label]) }}
            </div>
          </template>
        </el-input>
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
  name: 'WBSInputColumn',
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
    number: {
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
      if (!row.create) {
        this.$nextTick(() => {
          this.$refs['input'].focus()
        })
      }
      return this.required && row[this.prop].length <= 0
    },
    editable(row) {
      if (this.hasChildEdit) {
        return true
      } else {
        return !row['has_children']
      }
    },
    treeWidth(treeNode) {
      if (this.prop === 'name' && treeNode && treeNode.indent) {
        return `calc(90% - ${treeNode.indent}px)`
      }
      return `calc(90%)`
    },
    handlerBlur(row, index, treeNode) {
      const checkUpdate = row.originColumn && row[this.prop] !== row.originColumn
      if (checkUpdate) {
        this.handlerEdit(row, index, treeNode)
      } else if (row.originColumn) {
        this.handlerReset(row, index, treeNode)
      }
    },
    handlerEdit(row, index, treeNode) {
      if (!this.hasRequired(row)) {
        this.$emit('edit', {
          value: { [this.prop]: row[this.prop] },
          row: row,
          index: index,
          treeNode: treeNode
        })
      }
    },
    handlerCreate(row, index, treeNode) {
      if (!this.hasRequired(row)) {
        this.$emit('create', {
          value: { [this.prop]: row[this.prop] },
          row: row,
          index: index,
          treeNode: treeNode
        })
      }
    },
    handlerReset(row, index, treeNode) {
      this.$emit('reset-edit', { value: this.prop, row: row, index: index, treeNode: treeNode })
    },
    handlerResetCreate(row, index, treeNode) {
      this.$emit('reset-create', { value: this.prop, row: row, index: index, treeNode: treeNode })
    }
  }
}
</script>
