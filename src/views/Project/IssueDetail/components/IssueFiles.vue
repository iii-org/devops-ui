<template>
  <el-row class="el-upload-list">
    <div class="text-subtitle-2 mb-2">{{ $t('Issue.Files') }}</div>
    <el-row v-for="file in issueFile" :key="file.id" class="el-upload-list__item is-ready">
      <el-col :span="20">
        <a class="el-upload-list__item-name" @click="handleDownload(file)">
          <i class="el-icon-document" />{{ file.filename }} ({{ file.created_on }})
        </a>
      </el-col>
      <el-col :span="4" class="text-right">
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          :loading="isLoading"
          @click="deleteIssueFile(file)"
        >
          {{ $t('general.Delete') }}
        </el-button>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { deleteIssueFile } from '@/api/issue'
import { downloadProjectFile } from '@/api/projects'

export default {
  name: 'IssueFiles',
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