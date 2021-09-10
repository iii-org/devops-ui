<template>
  <div>
    <el-upload
      ref="fileUploader"
      :auto-upload="false"
      :on-change="handleChange"
      :on-exceed="handleSingleFileLimit"
      :on-remove="handleRemove"
      :limit="limit"
      action=""
      multiple
      drag
    >
      <div>
        <el-button size="small" :type="tagType()">{{ $t('File.ChooseFile') }}</el-button>
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
import { isAllowedTypes, fileSizeToMB, containSpecialChar } from '@/utils/extension'

export default {
  name: 'ClusterFileUploader',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      limit: 1,
      uploadFileList: [],
      fileSizeLimit: '5MB',
      fileType: 'JPG、PNG、GIF / ZIP、7z、RAR/MS Office Docs'
    }
  },
  methods: {
    async handleChange(file, fileList) {
      const { raw, size, name } = file
      const unsupportedFileFormatWarning = this.$t('Notify.UnsupportedFileFormat')
      const fileSizeLimitWarning = this.$t('Notify.FileSizeLimit', { size: this.fileSizeLimit })
      const FileNameLimitWarning = this.$t('Notify.FileNameLimit')
      if (!isAllowedTypes(raw.type)) {
        this.showWarning(unsupportedFileFormatWarning)
        fileList.splice(fileList.length - 1, 1)
      } else if (fileSizeToMB(size) > 5) {
        this.showWarning(fileSizeLimitWarning)
        fileList.splice(fileList.length - 1, 1)
      } else if (containSpecialChar(name)) {
        this.showWarning(FileNameLimitWarning)
        this.resetUpload()
      } else {
        this.uploadFileList = fileList[0].raw
        this.$emit('hasFileList', this.uploadFileList)
      }
    },
    handleSingleFileLimit() {
      const singleFileLimitWarning = this.$t('Notify.SingleFileLimit')
      this.showWarning(singleFileLimitWarning)
    },
    handleRemove(file, fileList) {
      if (fileList.length === 0) this.$emit('hasFileList', null)
    },
    showWarning(message) {
      this.$message({
        title: this.$t('general.Warning'),
        type: 'warning',
        message
      })
    },
    tagType() {
      return this.disabled ? 'info' : 'success'
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
</style>
