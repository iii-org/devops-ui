<template>
  <el-upload
    ref="fileUploader"
    v-loading="isUploading"
    :auto-upload="false"
    :on-change="handleChange"
    action
    multiple
    drag
  >
    <div>
      <el-button size="small" type="success" class="mb-2">{{ $t('File.UploadBtn') }}</el-button>
      <div>{{ $t('File.SelectFileOrDragHere') }}</div>
    </div>
  </el-upload>
</template>

<script>
import { fileExtension } from '@/utils/extension'
// import { downloadProjectFile } from '@/api/projects'
// import { deleteIssueFile } from '@/api/issue'

export default {
  name: 'FileUploader',
  data() {
    return {
      isLoading: false,
      isUploading: false,
      issueId: 0,
      issueFile: [],
      uploadFileList: []
    }
  },
  mounted() {
    this.extension = fileExtension()
  },
  methods: {
    async handleChange(file, fileList) {
      if (this.extension[file.raw.type] === undefined) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.UnsupportedFileFormat'),
          type: 'warning'
        })
        this.$refs.fileUploader.clearFiles()
      } else if (file.size / 1024 > 20480) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit'),
          type: 'warning'
        })
        this.$refs.fileUploader.clearFiles()
      } else {
        this.uploadFileList = fileList
      }
    }
    // async handleDownload(row) {
    //   const res = await downloadProjectFile({ id: row.id, filename: row.filename })
    //   const url = window.URL.createObjectURL(new Blob([res]))
    //   const link = document.createElement('a')
    //   link.href = url
    //   link.setAttribute('download', row.filename)
    //   document.body.appendChild(link)
    //   link.click()
    // },
    // async handleDelete(row) {
    //   this.isLoading = true
    //   await deleteIssueFile(row.id)
    //   this.$message({
    //     title: this.$t('general.Success'),
    //     message: this.$t('Notify.Deleted'),
    //     type: 'success'
    //   })
    //   this.isLoading = false
    //   this.$emit('updated')
    // },
  }
}
</script>

<style lang="scss" scoped>
>>> .el-upload-dragger {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 100px;
}
</style>
