<template>
  <el-table-column v-bind="$props">
    <template slot-scope="{row, $index}">
      <template v-if="row.create">
        <el-select v-model="row[propKey]['id']"
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
      <template v-else-if="row.editColumn===propKey&&row.id===editRowId&&editable(row)">
        <el-select v-model="row[propKey]['id']"
                   @change="handlerEdit(row, $index)"
                   @keyup.enter.native="handlerEdit(row, $index)"
                   @keyup.esc.native="handlerReset(row, $index)"
        >
          <el-option v-for="item in editDynamicOptions" :key="(item.login)?item.login:item.id" :value="item.id"
                     :label="$te(`Issue.${item.name}`)?$t(`Issue.${item.name}`):item.name"
                     :class="item.class"
                     :disabled="item.status&&!(item.status==='open'||item.status==='enable')"
          >
            <template v-if="components">
              <component :is="components" :name="item.name" /> {{ item.message }}
            </template>
            <template v-else>
              {{ item.name }}
            </template>
          </el-option>
        </el-select>
      </template>
      <template v-else>
        <template v-if="components">
          <component :is="components" :name="row[propKey].name" />
        </template>
        <template v-else>
          {{ row[propKey].name }}
        </template>
      </template>
    </template>
  </el-table-column>
</template>

<script>
import i18n from '@/lang'
import { getCheckIssueClosable } from '@/api/issue'
import { cloneDeep } from 'lodash'

export default {
  name: 'WBSSelectColumn',
  props: {
    prop: {
      type: String,
      required: true
    },
    propKey: {
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
    },
    showOverflowTooltip: {
      type: Boolean,
      default: false
    },
    editRowId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      dynamicStatusList: this.options
    }
  },
  computed: {
    editDynamicOptions() {
      return (this.propKey === 'status') ? this.dynamicStatusList : this.options
    }
  },
  watch: {
    editRowId(value) {
      if (this.propKey === 'status' && value) {
        this.getClosable(value)
      }
    }
  },
  methods: {
    hasRequired(row) {
      return this.required && row[this.propKey].length <= 0
    },
    editable(row) {
      if (this.hasChildEdit) {
        return true
      } else {
        return !row['has_children']
      }
    },
    handlerEdit(row, index, treeNode) {
      this.$emit('edit', { value: { [`${this.propKey}_id`]: row[this.propKey]['id'] }, row: row, index: index, treeNode: treeNode })
    },
    handlerCreate(row, index, treeNode) {
      this.$emit('create', { value: { [`${this.propKey}_id`]: row[this.propKey]['id'] }, row: row, index: index, treeNode: treeNode })
    },
    handlerReset(row, index, treeNode) {
      this.$emit('reset-edit', { value: this.propKey, row: row, index: index, treeNode: treeNode })
    },
    handlerResetCreate(row, index, treeNode) {
      this.$emit('reset-create', { value: this.propKey, row: row, index: index, treeNode: treeNode })
    },
    async getClosable(id) {
      let result = true
      try {
        const checkClosable = await getCheckIssueClosable(id)
        result = checkClosable.data
      } catch (e) {
        // log
      }
      await this.getDynamicStatusList(result)
    },
    getDynamicStatusList(value) {
      const deepStatus = cloneDeep(this.options)
      this.$set(this.$data, 'dynamicStatusList', deepStatus.map((item) => {
        if ((!value) && item.is_closed) {
          item.status = true
          item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
        }
        return item
      }))
    }
  }
}
</script>
