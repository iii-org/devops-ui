<template>
  <el-upload ref="fileUploader" :auto-upload="false" :on-change="handleChange" action="" multiple drag>
    <div>
      <el-button size="small" class="buttonSecondary">{{ $t('File.ChooseFile') }}</el-button>
      <div class="el-upload__text">{{ $t('File.DragFilesHere') }}</div>
      <div class="text-xs text-gray-400">
        <div>{{ $t('File.MaxFileSize') }}: {{ fileSizeLimit }}</div>
        <div>{{ $t('File.AllowedFileTypes') }}: {{ fileType }}</div>
      </div>
    </div>
  </el-upload>
</template>
<script>
import { isAllowedTypes, fileSizeToMB, containSpecialChar } from '@/utils/extension'

export default {
  name: 'IssueFileUploader',
  data() {
    return {
      uploadFileList: [],
      fileSizeLimit: '5MB',
      fileType: 'JPG、PNG、GIF / ZIP、7z、RAR/MS Office Docs'
    }
  },

  methods: {
    async handleChange(file, fileList) {
      const { raw, size, name } = file
      if (!isAllowedTypes(raw.type)) {
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
        fileList.splice(fileList.length - 1, 1)
      } else {
        this.uploadFileList = fileList
      }
    }
  }
}
</script>
