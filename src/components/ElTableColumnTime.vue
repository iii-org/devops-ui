<script>
export default {
  name: 'ElTableColumnTime',
  props: {
    'prop': {
      type: String,
      required: true
    },
    'label': {
      type: String,
      default: 'general.LastUpdateTime'
    }
  }
}
</script>

<template>
  <el-table-column align="center" :label="$t(label)" min-width="150">
    <template slot-scope="scope">
      <el-tooltip placement="top" :content="scope.row[prop] | UTCtoLocalTime">
        <span>{{ scope.row[prop] | relativeTime }}</span>
      </el-tooltip>
    </template>
  </el-table-column>
</template>

<style scoped>

</style>
