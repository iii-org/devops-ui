<script>
import { updateIssue, deleteIssueFile } from '@/api/issue'
import { downloadProjectFile } from '@/api/projects'
import { Message } from 'element-ui'
import { fileExtension } from '@/utils/extension'

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
    isLoading: false,
    isUploading: false,
    uploadFileList: []
  }),

  mounted() {
    this.extension = fileExtension()
  },

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
    },
    async handleChange(file, fileList) {
      if (this.extension[file.raw.type] === undefined) {
        this.$message({
          message: `Unable to upload a file: This file type is not supported`,
          type: 'warning',
          duration: 10 * 1000
        })
        this.$refs.uploadFile.clearFiles()
      } else if (file.size / 1024 > 20480) {
        this.$message({
          message: `This file cannot be uploaded because it exceeds the maximum allowed file size (20 MB)`,
          type: 'warning',
          duration: 10 * 1000
        })
        this.$refs.uploadFile.clearFiles()
      } else {
        this.uploadFileList = fileList
      }
    },
    async uploadFile() {
      const vm = this
      this.isUploading = true
      const form = new FormData()
      this.uploadFileList
        .reduce(function(prev, curr) {
          return prev.then(() => {
            form.delete('upload_file')
            form.append('upload_file', curr.raw, curr.raw.name)
            return updateIssue(vm.issueId, form)
          })
        }, Promise.resolve([]))
        .then(() => {
          this.$refs.uploadFile.clearFiles()
          Message({
            message: 'update successful',
            type: 'success',
            duration: 1 * 1000
          })
          this.isUploading = false
          this.uploadFileList = []
          vm.$emit('updated')
        })
    }
  }
}
</script>

<template>
  <div>
    <el-table
      :data="issueFile"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
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

      <el-table-column :label="$t('general.CreateTime')" align="center" width="190">
        <template slot-scope="scope">
          {{ scope.row.created_on | formatTime }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Actions')" align="center" width="250">
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

    <el-upload
      ref="uploadFile"
      v-loading="isUploading"
      class="upload-file2 mb-2"
      :auto-upload="false"
      :on-change="handleChange"
      action
      multiple
      drag
    >
      <div class="uploadBtn el-button--primary">{{ $t('File.UploadBtn') }}</div>
      <div class="el-upload__text">{{ $t('File.SelectFileOrDragHere') }}</div>
    </el-upload>
    <div class="text-right">
      <el-button
        v-show="uploadFileList.length > 0"
        size="mini"
        :loading="isUploading"
        type="success"
        @click="uploadFile"
      >
        {{ $t('File.UploadAndSave') }}
      </el-button>
    </div>
  </div>
</template>
