<template>
  <el-table-column align="center" v-bind="$props">
    <template slot-scope="scope">
      <el-tag
        v-if="scope.row[prop]"
        :type="handleType(scope.row[prop] || 'default')"
        :class="elementClass"
        :size="size"
        :effect="getStatusTagEffect(scope.row[prop]) || effect"
      >
        <span v-if="translateKey">{{ $t(translateKey + '.' + scope.row[prop]) }}</span>
        <span v-else>{{ scope.row[prop] }}</span>
      </el-tag>
    </template>
  </el-table-column>
</template>

<script>
import i18n from '@/lang'
import * as elementTagType from '@/utils/element-tag-type'

export default {
  name: 'ElTableColumnTag',
  props: {
    prop: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: 'pipelines'
    },
    translateKey: {
      type: String,
      default: null
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
    minWidth: {
      type: String,
      default: '85'
    },
    elementClass: {
      type: String,
      default: 'el-tag--circle'
    }
  },
  methods: {
    handleType(prop) {
      return elementTagType[this.location][prop]
    },
    getStatusTagEffect(status) {
      switch (status) {
        case 'Building':
          return 'light'
        default:
          return 'dark'
      }
    }
  }
}
</script>
