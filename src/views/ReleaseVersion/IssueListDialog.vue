<script>
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'IssueListDialog',
  mixins: [MixinElTable],
  data: () => ({
    multipleSelection: [[]],
    searchKey: 'issue_name',
    visible: false
  }),
  watch: {
    pagedData() {
      if (!this.$refs.theTable) {
        return
      }
      const sel = this.multipleSelection[this.listQuery.page - 1]
      if (!sel) {
        return
      }
      sel.forEach(row => {
        this.$refs.theTable.toggleRowSelection(row, true)
      })
    },
    multipleSelection() {
      console.log('mul', this.multipleSelection)
    }
  },
  methods: {
    async fetchData() {
      return []
    },
    setData(listData, category) {
      if (category) {
        listData = listData.filter(item => {
          return item['issue_category'] === category
        })
      }
      this.checked = {}
      for (const item of listData) {
        this.checked[item.id] = false
      }
      this.listData = listData
    },
    handleSelectionChange(val) {
      console.log('set', this.listQuery.page, val)
      this.multipleSelection[this.listQuery.page] = val
    },
    copy() {
      const thiz = this
      const text = ''
      // TODO: Get from selected items
      this.$copyText(text).then(function() {
        thiz.$message({
          message: thiz.$t('general.copied'),
          type: 'info'
        })
      })
    }
  }
}
</script>

<template>
  <el-dialog
    :visible.sync="visible"
  >
    <p>
      <el-button type="success" @click="copy">
        {{ $t('Release.copyIssues') }}
      </el-button>
    </p>
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
      <el-table-column :label="$t('Issue.id')" prop="id" />
      <el-table-column :label="$t('Issue.name')" prop="issue_name" />
      <el-table-column :label="$t('general.Type')" prop="issue_category" />
      <el-table-column :label="$t('Project.Version')" prop="fixed_version_name" />
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-dialog>
</template>

<style scoped>

</style>
