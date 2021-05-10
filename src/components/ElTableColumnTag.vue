<template>
  <el-table-column align="center" v-bind="$props">
    <template slot-scope="scope">
      <el-tag
        :type="handleType(scope.row[prop])"
        :class="elementClass"
        :size="size"
        :effect="effect"
      >
        <span>{{ scope.row[prop] }}</span>
      </el-tag>
    </template>
  </el-table-column>
</template>

<script>
import i18n from '@/lang'

export default {
  name: 'ElTableColumnTag',
  props: {
    prop: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'large'
    },
    effect: {
      type: String,
      default: 'dark'
    },
    label: {
      type: String,
      default: i18n.t('Project.Status')
    },
    width: {
      type: Number,
      default: 100
    },
    elementClass: {
      type: String,
      default: 'el-tag--circle'
    }
  },
  methods: {
    handleType(prop) {
      switch (prop) {
        case '進行中':
          return 'success'
        case '未開始':
          return ''
        case 'enable':
          return 'success'
        case 'disable':
          return 'danger'
        default:
          return 'none'
      }
    }
  }
}
</script>
