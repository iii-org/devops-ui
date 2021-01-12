<script>
import { deleteIssueFile } from '@/api/issue'
import { downloadProjectFile } from '@/api/projects'
import { Message } from 'element-ui'

export default {
  name: 'FileTab',
  props: {
    issueId: {
      type: Number,
      default: 0
    },
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
    async deleteIssueFile(row) {
      this.isLoading = true
      await deleteIssueFile(row.id)
      Message({
        message: 'delete successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.isLoading = false
      this.$emit('updated')
    }
  }
}
</script>

<template>
  <div>
    <el-table
      v-loading="isLoading"
      :data="issueFile"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
      style="margin-top: 10px"
    >
      <el-table-column :label="$t('general.Name')" align="center" min-width="240">
        <template slot-scope="scope">
          <span v-if="scope.row.filename">
            {{ scope.row.filename }}
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.CreateTime')" align="center" width="180">
        <template slot-scope="scope">
          {{ new Date(scope.row.created_on).toLocaleString() }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Actions')" align="center" min-width="240">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDownload(scope.row)">
            <i class="el-icon-download" />
            {{ $t('File.Download') }}
          </el-button>
          <el-button type="danger" size="mini" @click="deleteIssueFile(scope.row)">
            <i class="el-icon-delete" />
            {{ $t('general.Delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
