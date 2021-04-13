<script>
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'MixinElTableWithCheckbox',
  mixins: [MixinElTable],
  data() {
    return {
      paged: false,
      multipleSelection: []
    }
  },
  methods: {
    handleSelectionChange(val) {
      if (this.paged) {
        this.paged = false
        return
      }
      const indexes = []
      for (const row of val) {
        const index = this.pagedData.indexOf(row)
        indexes.push(index)
      }
      this.multipleSelection.splice(this.listQuery.page - 1, 1, indexes)
    },
    async handlePagination(listQuery) {
      this.paged = true
      await this.onPagination(listQuery)
      this.reselect()
    },
    reselect() {
      const sel = this.multipleSelection[this.listQuery.page - 1]
      if (!sel) {
        return
      }
      sel.forEach(index => {
        this.$refs.theTable.toggleRowSelection(this.pagedData[index])
      })
    }
  }
}
</script>

<template>
  <div>
    <el-table
      ref="theTable"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="handlePagination"
    />
  </div>
</template>

<style scoped>

</style>
