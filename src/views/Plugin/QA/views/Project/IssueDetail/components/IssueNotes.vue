<template>
  <el-table
    :data="filteredIssueNotes"
    :element-loading-text="$t('Loading')"
    border
    fit
    :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
  >
    <el-table-column align="center" :label="$t('Issue.Notes')" min-width="200">
      <template slot-scope="scope">
        <VueShowdown :markdown="scope.row.notes" />
      </template>
    </el-table-column>
    <el-table-column align="center" :label="$t('Issue.Author')" width="200" prop="user.name" />
    <el-table-column align="center" :label="$t('general.CreateTime')" width="180">
      <template slot-scope="scope">
        {{ new Date(scope.row.created_on).toLocaleString() }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'IssueNotes',
  props: {
    issueNotes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    filteredIssueNotes() {
      return this.issueNotes.filter(note => note.notes !== '')
    }
  }
}
</script>
