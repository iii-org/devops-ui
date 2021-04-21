<template>
  <el-table
    :data="issueFile"
    :element-loading-text="$t('Loading')"
    border
    fit
    :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
    class="my-3"
  >
    <el-table-column :label="$t('general.Name')" align="center" show-overflow-tooltip min-width="150">
      <template slot-scope="scope">
        <span v-if="scope.row.filename">
          {{ scope.row.filename }}
        </span>
      </template>
    </el-table-column>
    <el-table-column-time align="center" prop="created_on" :label="$t('general.CreateTime')" />
    <el-table-column align="center" :label="$t('general.Actions')" width="250">
      <template slot-scope="scope">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-download"
          :loading="isLoading"
          @click="handleDownload(scope.row)"
        >
          {{ $t('File.Download') }}
        </el-button>
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          :loading="isLoading"
          @click="deleteIssueFile(scope.row)"
        >
          {{ $t('general.Delete') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { deleteIssueFile } from '@/api/issue'
import { downloadProjectFile } from '@/api/projects'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'IssueFiles',
  components: { ElTableColumnTime },
  props: {
    issueFile: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    isLoading: false
  }),
  methods: {
    async handleDownload(row) {
      const res = await downloadProjectFile({ id: row.id, filename: row.filename })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', row.filename) // or any other extension
      document.body.appendChild(link)
      link.click()
    },
    deleteIssueFile(row) {
      this.isLoading = true
      deleteIssueFile(row.id)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.removeFile(row.id)
        })
        .catch(err => console.err(err))
        .then(() => {
          this.isLoading = false
        })
    },
    removeFile(id) {
      const idx = this.issueFile.findIndex(item => item.id === id)
      this.issueFile.splice(idx, 1)
    }
  }
}
</script>
