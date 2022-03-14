<template>
  <el-table-column align="center" v-bind="$props">
    <template slot-scope="scope">
      <el-tag
        v-if="scope.row[prop]"
        :type="handleType(scope.row[prop])"
        :class="elementClass"
        :size="size"
        :effect="getTagEffect(scope.row[prop])"
      >
        <span v-if="i18nKey">{{ $t(`${i18nKey}.${scope.row[prop]}`) }}</span>
        <span v-else>{{ scope.row[prop] }}</span>
      </el-tag>
      <span v-else>-</span>
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
    i18nKey: {
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
      default: i18n.t('general.Status')
    },
    minWidth: {
      type: String,
      default: '85'
    },
    elementClass: {
      type: String,
      default: 'el-tag--circle'
    },
    sortable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleType(prop) {
      return elementTagType[this.location][prop] || 'default'
    },
    getTagEffect(status) {
      const tagMap = { Building: 'light' }
      return tagMap[status] || 'dark'
    }
  }
}
</script>
