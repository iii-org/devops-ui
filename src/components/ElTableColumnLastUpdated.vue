<template>
  <el-table-column align="center" :label="$t('Project.UpdateTime')" min-width="150">
    <template slot-scope="scope">
      <el-tooltip placement="top" :content="scope.row.updated_time | UTCtoLocalTime">
        <span>{{ scope.row.updated_time | relativeTime }}</span>
      </el-tooltip>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'ElTableColumnLastUpdated'
}
</script>

<style scoped>

</style>
