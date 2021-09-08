<template>
  <el-table-column v-bind="$props">
    <template slot-scope="{row, $index}">
      <template v-if="row.create">
        <el-select v-model="row[prop]['id']"
                   @keyup.enter.native="handlerCreate(row, $index)"
                   @keyup.esc.native="handlerResetCreate(row, $index)"
        >
          <el-option v-for="item in options" :key="(item.login)?item.login:item.id" :value="item.id"
                     :label="$te(`Issue.${item.name}`)?$t(`Issue.${item.name}`):item.name"
                     :class="item.class"
                     :disabled="item.status&&!(item.status==='open'||item.status==='enable')"
          >
            <template v-if="components">
              <component :is="components" :name="item.name" />
            </template>
            <template v-else>
              {{ item.name }}
            </template>
          </el-option>
        </el-select>
      </template>
      <template v-else-if="row.editColumn===prop&&editable(row)">
        <el-select v-model="row[prop]['id']" @change="handlerEdit(row, $index)"
                   @keyup.esc.native="handlerReset(row, $index)"
        >
          <el-option v-for="item in options" :key="(item.login)?item.login:item.id" :value="item.id"
                     :label="$te(`Issue.${item.name}`)?$t(`Issue.${item.name}`):item.name"
                     :class="item.class"
                     :disabled="item.status&&!(item.status==='open'||item.status==='enable')"
          >
            <template v-if="components">
              <component :is="components" :name="item.name" />
            </template>
            <template v-else>
              {{ item.name }}
            </template>
          </el-option>
        </el-select>
      </template>
      <template v-else>
        <template v-if="components">
          <component :is="components" :name="row[prop].name" />
        </template>
        <template v-else>
          {{ row[prop].name }}
        </template>
      </template>
    </template>
  </el-table-column>
</template>

<script>
import i18n from '@/lang'

export default {
  name: 'WBSSelectColumn',
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
    options: {
      type: Array,
      default: () => []
    },
    components: {
      type: Object,
      default: () => {
      }
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
    handlerEdit(row, index, treeNode) {
      this.$emit('edit', { value: { [`${this.prop}_id`]: row[this.prop]['id'] }, row: row, index: index, treeNode: treeNode })
    },
    handlerCreate(row, index, treeNode) {
      this.$emit('create', { value: { [`${this.prop}_id`]: row[this.prop]['id'] }, row: row, index: index, treeNode: treeNode })
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
