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
// import { downloadProjectFile } from '@/api/projects'
import { updateIssue, deleteIssueFile } from '@/api/issue'
import { fileExtension } from '@/utils/extension'

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
    async handleChange(file, fileList) {
      if (this.extension[file.raw.type] === undefined) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.UnsupportedFileFormat'),
          type: 'warning'
        })
        this.$refs.uploadFile.clearFiles()
      } else if (file.size / 1024 > 20480) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit'),
          type: 'warning'
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
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.isUploading = false
          this.uploadFileList = []
          vm.$emit('updated')
        })
    }
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
