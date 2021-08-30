<template>
  <div>
    <el-form>
      <el-form-item label="測試軟體">
        <el-select v-model="software_name">
          <el-option label="Postman" value="Postman" />
          <el-option label="SideeX" value="SideeX" />
        </el-select>
      </el-form-item>
      <el-upload ref="fileUploader" :auto-upload="false" :on-change="handleChange" action="" multiple drag>
        <div class="el-upload__text">
          <el-button size="small" type="success">{{ $t('File.ChooseFile') }}</el-button>
          <div class="mt-2 mb-3">{{ $t('File.DragFilesHere') }}</div>
          <div class="text-xs text-gray-400 px-12">
            <div class="m-1">{{ $t('File.MaxFileSize') }}: {{ fileSizeLimit }}</div>
            <div class="m-1">{{ $t('File.AllowedFileTypes') }}: {{ fileTypeLimit }}</div>
          </div>
        </div>
      </el-upload>
      <div class="text-xs mt-2">*{{ $t('File.UploadWarning') }}: {{ specialSymbols }}</div>
    </el-form>
  </div>
</template>
<script>
import { isJSON, fileSizeToMB, containSpecialChar } from '@/utils/extension'

export default {
  name: 'CollectionFileUploader',
  data() {
    return {
      software_name: [],
      uploadFileList: [],
      fileSizeLimit: '5 MB',
      fileTypeLimit: 'JSON',
      specialSymbols: '* ? " < > | # { } % ~ &'
    }
  },
  mounted() {
    this.resetUpload()
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
        this.resetUpload()
      } else if (fileSizeToMB(size) > 5) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit', { size: this.fileSizeLimit }),
          type: 'warning'
        })
        this.resetUpload()
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
      this.$emit('upload-file-length', fileList.length)
    },
    handleUpload() {
      const uploadFileList = this.uploadFileList
      return uploadFileList.length > 0 ? { fileList: uploadFileList, software_name: this.software_name } : null
    },
    resetUpload() {
      this.$refs.fileUploader.clearFiles()
      this.uploadFileList = []
    }
  }
}
</script>
