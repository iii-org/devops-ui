<template>
  <div>
    <el-upload ref="fileUploader" :auto-upload="false" :on-change="handleChange" action="" multiple drag>
      <div>
        <el-button size="small" type="success" class="mb-2">{{ $t('File.UploadBtn') }}</el-button>
        <div class="mb-2">{{ $t('File.SelectFileOrDragHere') }}</div>
        <div class="text-xs text-gray-400">
          <div>{{ $t('File.MaxFileSize') }}: {{ fileSizeLimit }}</div>
          <div>{{ $t('File.AllowedFileTypes') }}: {{ fileType }}</div>
        </div>
      </div>
      <!-- <div slot="tip">
        <div class="text-xs" style="line-height: 40px;">
          *{{ $t('File.UploadWarning') }}: {{ specialSymbols }}
        </div>
        <div v-show="uploadFileList.length > 0">
          <el-divider>{{ $t('Issue.UploadSuccess') }}</el-divider>
        </div>
      </div> -->
    </el-upload>
  </div>
</template>
<script>
import { fileExtension } from '@/utils/extension'

export default {
  name: 'IssueFileUploader',
  data() {
    return {
      uploadFileList: [],
      fileSizeLimit: '5MB',
      fileType: 'JPG、PNG、GIF / ZIP、7z、RAR/MS Office Docs'
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
        fileList.splice(fileList.length - 1, 1)
        // this.$refs.fileUploader.clearFiles()
        // this.uploadFileList.length = []
      } else if (file.size / 1024 > 20480) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit'),
          type: 'warning'
        })
        fileList.splice(fileList.length - 1, 1)
        // this.$refs.fileUploader.clearFiles()
        // this.uploadFileList.length = []
      } else {
        this.uploadFileList = fileList
      }
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
  height: 200px;
}

>>> .el-divider__text {
  color: #1c7b8c;
  letter-spacing: 5px;
}
</style>
