<template>
  <el-row class="el-upload-list">
    <div class="text-sm mb-2">{{ $t('Issue.Files') }}</div>
    <el-row
      v-for="file in issueFile"
      :key="file.id"
      class="el-upload-list__item is-ready"
    >
      <el-col
        :span="14"
        :lg="16"
      >
        <a
          class="el-upload-list__item-name"
          @click="handlePreview(file)"
        >
          <em class="el-icon-document" />{{ file.filename }} ({{
            $dayjs(file.created_on).format('YYYY-MM-DD hh:mm:ss')
          }})
        </a>
      </el-col>
      <el-col
        :span="10"
        :lg="8"
        class="text-right"
      >
        <span>
          <el-button
            class="buttonPrimary"
            size="mini"
            icon="el-icon-download"
            :loading="isLoading"
            :disabled="isButtonDisabled"
            @click="handleDownload(file)"
          >
            {{ $t('File.Download') }}
          </el-button>
        </span>
        <el-popconfirm
          :confirm-button-text="$t('general.Delete')"
          :cancel-button-text="$t('general.Cancel')"
          icon="el-icon-info"
          icon-color="red"
          :title="$t('Issue.DeleteFile')"
          @confirm="deleteIssueFile(file)"
        >
          <el-button
            slot="reference"
            type="danger"
            size="mini"
            icon="el-icon-delete"
            :loading="isLoading"
            :disabled="isButtonDisabled"
          >
            {{ $t('general.Delete') }}
          </el-button>
        </el-popconfirm>
      </el-col>
    </el-row>
    <el-dialog
      :title="image.filename"
      :visible.sync="dialogVisible"
      width="80%"
      top="3vh"
      append-to-body
    >
      <el-carousel
        ref="carousel"
        trigger="click"
        indicator-position="none"
        :autoplay="false"
        :initial-index="imageIndex"
        :height="imageHeight+'px'"
        @change="changeCarousel"
      >
        <el-carousel-item v-for="item in imageArray" :key="item.id">
          <img
            ref="image"
            :src="item.src"
            :alt="item.filename"
            style="width:100%; padding:0 5rem;"
            @load="resizeImageHeight"
          >
        </el-carousel-item>
      </el-carousel>
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Close') }}</el-button>
        <el-button
          class="buttonPrimary"
          @click="downloadImage"
        >{{ $t('File.Download') }}</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { deleteIssueFile } from '@/api/issue'
import { downloadProjectFile } from '@/api/projects'
import { btoa } from '@/utils/base64'

export default {
  name: 'IssueFiles',
  props: {
    issueFile: {
      type: Array,
      default: () => []
    },
    isButtonDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,
      dialogVisible: false,
      image: {
        filename: '',
        content_type: '',
        src: ''
      },
      imageArray: [],
      imageIndex: 0,
      imageHeight: '300'
    }
  },
  computed: {
    ...mapGetters(['selectedProject'])
  },
  watch: {
    issueFile() {
      this.handleImageArray()
    }
  },
  mounted() {
    this.handleImageArray()
    window.addEventListener('resize', () => {
      this.resizeImageHeight()
    }, false)
  },
  methods: {
    async handleDownload(row) {
      const res = await downloadProjectFile({ id: row.id, filename: row.filename, project_id: this.selectedProject.id })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', row.filename) // or any other extension
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    deleteIssueFile(row) {
      this.isLoading = true
      deleteIssueFile(row.id)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.removeFile(row.id)
        })
        .catch((err) => {
          this.showErrorMessage(err)
        })
        .then(() => {
          this.isLoading = false
        })
    },
    removeFile(id) {
      const idx = this.issueFile.findIndex((item) => item.id === id)
      this.issueFile.splice(idx, 1)
    },
    async handleImageArray() {
      if (this.issueFile.length === 0) return
      if (this.imageArray.length !== 0) this.imageArray = []
      for (const item of this.issueFile) {
        const { id, content_type, filename } = item
        if (this.isAllowPreview(content_type)) {
          await downloadProjectFile({ id, filename, project_id: this.selectedProject.id })
            .then((res) => {
              const base64String = btoa(new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), ''))
              this.imageArray.push({
                id: id,
                content_type: content_type,
                filename: filename,
                src: `data:${content_type};base64, ${base64String}`
              })
            })
            .catch((err) => {
              this.showErrorMessage(err)
            })
        }
      }
    },
    handlePreview(row) {
      if (!this.isAllowPreview(row.content_type)) return
      this.imageIndex = this.imageArray.findIndex((item) => item.id === row.id)
      this.image = this.imageArray[this.imageIndex]
      this.dialogVisible = true
      if (this.$refs.carousel !== undefined) {
        this.$refs.carousel.setActiveItem(this.imageIndex)
      }
    },
    changeCarousel(index) {
      this.imageIndex = index
      this.image = this.imageArray[index]
      this.resizeImageHeight()
    },
    resizeImageHeight() {
      this.$nextTick(() => {
        this.imageHeight = this.$refs.image[this.imageIndex].height
      })
    },
    downloadImage() {
      const { src, filename } = this.image
      const link = document.createElement('a')
      link.href = src
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    isAllowPreview(content_type) {
      if (content_type === null) return false
      else return content_type.includes('image')
    },
    showErrorMessage(err) {
      this.$message({
        message: err,
        type: 'error'
      })
    }
  }
}
</script>
