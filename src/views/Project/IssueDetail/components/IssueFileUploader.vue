<template>
  <div>
    <el-upload ref="fileUploader" :auto-upload="false" :on-change="handleChange" action="" multiple drag>
      <div>
        <el-button size="small" type="success">{{ $t('File.ChooseFile') }}</el-button>
        <div class="el-upload__text">{{ $t('File.DragFilesHere') }}</div>
        <div class="text-xs text-gray-400">
          <div>{{ $t('File.MaxFileSize') }}: {{ fileSizeLimit }}</div>
          <div>{{ $t('File.AllowedFileTypes') }}: {{ fileType }}</div>
        </div>
      </div>
    </el-upload>
  </div>
</template>
<script>
import { isJSON, fileSizeToMB, containSpecialChar } from '@/utils/extension'

export default {
  name: 'IssueFileUploader',
  data() {
    return {
      uploadFileList: [],
      fileSizeLimit: '5MB',
      fileType: 'JPG、PNG、GIF / ZIP、7z、RAR/MS Office Docs'
    }
  },
  watch: {
    uploadFileList(val) {
      if (val.length > 0) this.$emit('hasFileList', val)
      else this.$emit('hasFileList', false)
    }
  },
  methods: {
    async handleChange(file, fileList) {
      const { raw, size, name } = file
      if (!isJSON(raw.type)) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.UnsupportedFileFormat'),
          type: 'warning'
        })
        fileList.splice(fileList.length - 1, 1)
      } else if (fileSizeToMB(size) > 5) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit', { size: this.fileSizeLimit }),
          type: 'warning'
        })
        fileList.splice(fileList.length - 1, 1)
      } else if (containSpecialChar(name)) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileNameLimit'),
          type: 'warning'
        })
        this.resetUpload()
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
  height: 200px;
}
</style>
