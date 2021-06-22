<template>
  <el-row class="el-upload-list">
    <div class="text-subtitle-2 mb-2">{{ $t('Issue.Files') }}</div>
    <el-row v-for="file in issueFile" :key="file.id" class="el-upload-list__item is-ready">
      <el-col :span="16">
        <a class="el-upload-list__item-name" @click="handleDownload(file)">
          <i class="el-icon-document" />{{ file.filename }} ({{
            $dayjs(file.created_on).format('YYYY-MM-DD hh:mm:ss')
          }})
        </a>
      </el-col>
      <el-col :span="8" class="text-right">
        <span v-if="isAllowPreview(file.content_type)">
          <el-button type="primary" size="mini" icon="el-icon-search" :loading="isLoading" @click="handlePreview(file)">
            {{ $t('general.Preview') }}
          </el-button>
        </span>
        <el-popconfirm
          :confirm-button-text="$t('general.Delete')"
          :cancel-button-text="$t('general.Cancel')"
          icon="el-icon-info"
          icon-color="red"
          :title="$t('Issue.DeleteFile')"
          @onConfirm="deleteIssueFile(file)"
        >
          <el-button slot="reference" type="danger" size="mini" icon="el-icon-delete" :loading="isLoading">
            {{ $t('general.Delete') }}
          </el-button>
        </el-popconfirm>
      </el-col>
    </el-row>
    <el-dialog :title="image.filename" :visible.sync="dialogVisible" width="80%" top="3vh" append-to-body>
      <img :src="image.src" style="width: 100%">
      <span slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Close') }}</el-button>
        <el-button type="primary" @click="downloadImage">{{ $t('File.Download') }}</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { deleteIssueFile } from '@/api/issue'
import { downloadProjectFile } from '@/api/projects'

export default {
  name: 'IssueFiles',
  props: {
    issueFile: {
      type: Array,
      default: () => []
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
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProject'])
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
        .catch(err => {
          this.$message({
            message: err,
            type: 'error'
          })
        })
        .then(() => {
          this.isLoading = false
        })
    },
    removeFile(id) {
      const idx = this.issueFile.findIndex(item => item.id === id)
      this.issueFile.splice(idx, 1)
    },
    handlePreview(row) {
      const { id, content_type, filename } = row
      downloadProjectFile({ id, filename, project_id: this.selectedProject.id })
        .then(res => {
          const base64String = btoa(new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), ''))
          this.image.content_type = content_type
          this.image.filename = filename
          this.image.src = `data:${content_type};base64, ${base64String}`
          this.dialogVisible = true
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error'
          })
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
    }
  }
}
</script>
