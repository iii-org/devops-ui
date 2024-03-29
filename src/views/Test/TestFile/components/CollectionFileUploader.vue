<template>
  <div>
    <el-form ref="uploadForm" :model="uploadForm" :rules="uploadRule">
      <el-form-item :label="$t('Test.TestFile.TestSoftware')" prop="software_name">
        <el-select v-model="uploadForm.software_name">
          <el-option label="Postman" value="Postman" />
          <el-option label="SideeX" value="SideeX" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('Test.TestFile.UploadTestSet')" prop="uploadFileList">
        <el-upload ref="fileUploader" :auto-upload="false" :on-change="handleChange" action="" multiple drag>
          <div class="el-upload__text">
            <el-button size="small" class="buttonSecondary">{{ $t('File.ChooseFile') }}</el-button>
            <div class="mt-2 mb-3">{{ $t('File.DragFilesHere') }}</div>
            <div class="text-xs text-gray-400 px-12">
              <div class="m-1">{{ $t('File.MaxFileSize') }}: {{ fileSizeLimit }}</div>
              <div class="m-1">{{ $t('File.AllowedFileTypes') }}: {{ fileTypeLimit }}</div>
            </div>
          </div>
        </el-upload>
        <div class="text-xs mt-2">
          <ul>
            <li>{{ $t('File.UploadWarning') }}: {{ specialSymbols }}</li>
            <li v-if="uploadForm.software_name">{{ $t(`Test.TestFile.${uploadForm.software_name}Upload`) }}</li>
            <template v-else>
              <li>{{ $t(`Test.TestFile.PostmanUpload`) }}</li>
              <li>{{ $t(`Test.TestFile.SideeXUpload`) }}</li>
            </template>
          </ul>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { isJSON, fileSizeToMB, containSpecialChar } from '@/utils/extension'

const fileRegex = { Postman: '.postman_collection.json$', SideeX: '.json$' }

export default {
  name: 'CollectionFileUploader',
  data() {
    const _this = this
    const uploadValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        if (value.length <= 0) {
          return reject(this.$t(`Validation.Select`, [this.$t('File.File')]))
        }
        if (_this.uploadForm.software_name) {
          const getFilenameList = value.map(file => file.name.match(fileRegex[_this.uploadForm.software_name]) && !file.name.match('[*?"< >|#}{%~&]'))
            .filter(file => !file)
          if (getFilenameList.length > 0) {
            return reject(this.$t(`Test.TestFile.${_this.uploadForm.software_name}Upload`))
          }
        }
        return resolve()
      })
    }
    return {
      uploadForm: {
        software_name: '',
        uploadFileList: []
      },
      uploadRule: {
        software_name: [{
          required: true,
          message: this.$t('Validation.Select', [this.$t('Test.TestFile.TestSoftware')]),
          trigger: 'blur'
        }],
        uploadFileList: [{
          required: true,
          message: this.$t('Validation.Select', [this.$t('File.File')]),
          trigger: 'blur'
        },
        { validator: uploadValidator, trigger: 'change' }]
      },
      fileTypeLimit: 'JSON',
      specialSymbols: '* ? " < > | # { } % ~ &'
    }
  },
  computed: {
    ...mapGetters(['fileSizeLimit'])
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
      } else if (fileSizeToMB(size) > Number(this.fileSizeLimit.replace(/\D/g, ''))) {
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
        this.uploadForm.uploadFileList = fileList
      }
      this.$emit('upload-file-length', fileList.length)
    },
    handleUpload() {
      const uploadFileList = this.uploadForm.uploadFileList
      return uploadFileList.length > 0 ? {
        fileList: uploadFileList,
        software_name: this.uploadForm.software_name
      } : null
    },
    resetUpload() {
      this.$refs.fileUploader.clearFiles()
      this.uploadForm.uploadFileList = []
    }
  }
}
</script>
