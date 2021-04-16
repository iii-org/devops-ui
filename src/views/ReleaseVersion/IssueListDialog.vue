<script>
import MixinElTableWithCheckbox from '@/components/MixinElTableWithCheckbox'

export default {
  name: 'IssueListDialog',
  mixins: [MixinElTableWithCheckbox],
  data: () => ({
    searchKey: '',
    visible: false
  }),
  methods: {
    setData(listData, category) {
      if (category) {
        listData = listData.filter(item => {
          return item['issue_category'] === category
        })
      }
      this.listData = listData
    },
    copy() {
      const thiz = this
      let text = ''
      for (const i in this.multipleSelection) {
        for (const pos of this.multipleSelection[i]) {
          const index = parseInt(i) * this.listQuery.limit + parseInt(pos)
          text += this.listData[index]['issue_name'] + '\n'
        }
      }
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
  <el-dialog :visible.sync="visible">
    <p>
      <el-button type="success" :disabled="noRowSelected" @click="copy">
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
      <el-table-column :label="$t('Issue.id')" align="center" prop="id" width="75" />
      <el-table-column :label="$t('Issue.name')" align="center" prop="issue_name" />
      <el-table-column :label="$t('Project.Version')" align="center" prop="fixed_version_name" />
      <el-table-column :label="$t('general.Type')" align="center" prop="issue_category" />
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="handlePagination"
    />
  </el-dialog>
</template>

<style scoped>

</style>
