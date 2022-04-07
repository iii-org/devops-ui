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
      fit
      highlight-current-row
      :data="pagedData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column :label="$t('Issue.id')" align="center" prop="id" width="75" />
      <el-table-column :label="$t('Issue.name')" align="center" prop="name" />
      <el-table-column :label="$t('Project.Version')" align="center" prop="versionName" />
      <el-table-column :label="$t('general.Type')" align="center" prop="trackerName" />
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

<script>
import MixinElTableWithCheckbox from '@/mixins/MixinElTableWithCheckbox'

export default {
  name: 'IssueListDialog',
  mixins: [MixinElTableWithCheckbox],
  data() {
    return {
      searchKey: '',
      visible: false
    }
  },
  methods: {
    setData(listData, category) {
      if (category) {
        listData = listData.filter(item => {
          return item.trackerName === category
        })
      }
      this.listData = listData
    },
    copy() {
      const vm = this
      let text = ''
      this.multipleSelection.forEach((val, i) => {
        for (const pos of val) {
          const index = parseInt(i) * this.listQuery.limit + parseInt(pos)
          text += this.listData[index].name + '\n'
        }
      })
      this.$copyText(text).then(function() {
        vm.$message({
          message: vm.$t('general.copied'),
          type: 'info'
        })
      })
    }
  }
}
</script>
