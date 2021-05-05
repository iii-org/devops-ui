<template>
  <div>
    <el-upload ref="fileUploader" :auto-upload="false" :on-change="handleChange" action="" multiple drag>
      <div>
        <el-button size="small" type="success" class="mb-2">{{ $t('File.UploadBtn') }}</el-button>
        <div>{{ $t('File.SelectFileOrDragHere') }}</div>
      </div>
    </el-upload>
  </div>
</template>
<script>
import { fileExtension } from '@/utils/extension'

export default {
  name: 'IssueFileUploader',
  data() {
    return {
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
        this.uploadFileList.length = []
      } else if (file.size / 1024 > 20480) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit'),
          type: 'warning'
        })
        this.$refs.fileUploader.clearFiles()
        this.uploadFileList.length = []
      } else {
        this.uploadFileList = fileList
      }
    } }
}
</script>

<style lang="scss" scoped>
>>> .el-upload-dragger {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 400px;
}
</style>
