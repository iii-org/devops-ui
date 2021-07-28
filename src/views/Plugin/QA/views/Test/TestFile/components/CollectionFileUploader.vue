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
        <div>
          <el-button size="small" type="success" class="mb-2">{{ $t('File.UploadBtn') }}</el-button>
          <div>{{ $t('File.SelectFileOrDragHere') }}</div>
        </div>
      </el-upload>
    </el-form>
  </div>
</template>
<script>
import { fileExtension } from '@/utils/extension'

export default {
  name: 'CollectionFileUploader',
  data() {
    return {
      software_name: [],
      uploadFileList: []
    }
  },
  mounted() {
    this.extension = fileExtension()
    this.resetUpload()
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
        this.uploadFileList = []
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

<style lang="scss" scoped>
> > > .el-upload-dragger {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 400px;
}
</style>
