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
import { mapGetters } from 'vuex'
import { postTestFile } from '@/views/Plugin/QA/api/qa'

export default {
  name: 'CollectionFileUploader',
  data() {
    return {
      software_name: [],
      uploadFileList: []
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
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
    },
    handleUpload() {
      const sendForm = new FormData()
      const uploadFileList = this.uploadFileList
      uploadFileList.length > 0 ? this.uploadFiles(sendForm, uploadFileList) : null
      this.resetUpload()
    },
    resetUpload(){
      this.$refs.fileUploader.clearFiles()
      this.uploadFileList = []
    },
    uploadFiles(sendForm, fileList) {
      this.isLoading = true
      // use one by one edit issue to upload file
      const { selectedProjectId, software_name } = this
      fileList
        .reduce(function(prev, curr) {
          return prev.then(() => {
            sendForm.delete('test_file')
            sendForm.append('test_file', curr.raw, curr.raw.name)
            return postTestFile(selectedProjectId, software_name, sendForm)
          })
        }, Promise.resolve([]))
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.$emit('update-issue')
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
        })
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
