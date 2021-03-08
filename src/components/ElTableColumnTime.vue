<script>
import i18n from '@/lang'

export default {
  name: 'ElTableColumnTime',
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
      type: Number,
      default: 130
    }
  }
}
</script>

<template>
  <el-table-column align="center" :label="label" :min-width="minWidth">
    <template slot-scope="scope">
      <el-tooltip placement="top" :content="scope.row[prop] | UTCtoLocalTime">
        <span>{{ scope.row[prop] | relativeTime }}</span>
      </el-tooltip>
    </template>
  </el-table-column>
</template>

<style scoped>

</style>
