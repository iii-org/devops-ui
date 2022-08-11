
<template>
  <div>
    <el-table
      ref="theTable"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
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

<script>
import MixinElTable from '@/mixins/MixinElTable'

export default {
  name: 'MixinElTableWithCheckbox',
  mixins: [MixinElTable],
  data() {
    return {
      paged: false,
      multipleSelection: []
    }
  },
  computed: {
    selectedIndexes() {
      const indexes = []
      for (const i in this.multipleSelection) {
        const arr = this.multipleSelection[i]
        for (const idx of arr) {
          indexes.push(i * this.listQuery.limit + idx)
        }
      }
      return indexes
    },
    noRowSelected() {
      return this.selectedIndexes.length === 0
    }
  },
  watch: {
    pagedData() {
      this.listQuery.totalPage = Math.floor(this.filteredData.length / this.listQuery.limit)
      if (this.multipleSelection.length !== this.listQuery.totalPage + 1) {
        this.multipleSelection = []
        for (let i = 0; i < this.listQuery.totalPage + 1; i++) {
          this.$set(this.multipleSelection, i, [])
        }
      }
    }
  },
  methods: {
    handleSelectionChange(val) {
      const indexes = []
      for (const row of val) {
        const index = this.pagedData.indexOf(row)
        indexes.push(index)
      }
      if (!this.paged) {
        this.$set(this.multipleSelection, this.listQuery.page - 1, indexes)
      }
    },
    async handlePagination(listQuery) {
      this.paged = true
      await this.onPagination(listQuery)
      this.reselect()
    },
    reselect() {
      this.multipleSelection[this.listQuery.page - 1].forEach(index => {
        this.$refs.theTable.toggleRowSelection(this.pagedData[index])
      })
      this.paged = false
    }
  }
}
</script>
