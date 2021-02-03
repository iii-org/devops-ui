<script>
import { mapGetters } from 'vuex'
import { fileExtension } from '@/utils/extension.js'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import {
  getProjectFileList,
  downloadProjectFile,
  getProjectVersion,
  uploadProjectFile,
  deleteProjectFile
} from '@/api/projects'

const formTemplate = {
  name: '',
  version: '',
  description: ''
}

export default {
  name: 'ProjectFiles',
  components: {
    Pagination,
    ProjectListSelector
  },
  data: () => ({
    listLoading: true,
    dialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',
    fileFormRules: {
      // name: [{ required: true, message: 'Please input name', trigger: 'blur' }]
      // version: [{ required: false, message: 'Please select version', trigger: 'blur' }],
      // description: [{ required: false, message: 'Please input description', trigger: 'blur' }]
    },
    fileList: [],
    versionList: [],
    dialogStatus: 1,
    memberConfirmLoading: false,
    fileForm: formTemplate,
    uploadFileList: [],
    loadingInstance: '',
    extension: {},
    isDownloading: false
  }),
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.fileList.filter(data => {
        if (this.searchData === '' || data.filename.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    // form(value) {
    //   console.log(value)
    // },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.checkProjectSelected()
    this.extension = fileExtension()
  },
  methods: {
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    checkProjectSelected() {
      this.projectSelectedId === -1 ? this.showNoProjectWarning() : this.fetchData()
    },
    showNoProjectWarning() {
      this.$message({
        type: 'warning',
        message: 'There are no projects currently, please create a new project.'
      })
      this.listLoading = false
    },
    async fetchData() {
      this.listLoading = true
      await Promise.all([getProjectFileList(this.projectSelectedId), getProjectVersion(this.projectSelectedId)]).then(
        res => {
          this.fileList = this.sortFiles(res[0].data.files)
          this.versionList = res[1].data.versions
        }
      )
      this.listLoading = false
    },
    sortFiles(files) {
      const sortedFiles = files.map(file => file)
      sortedFiles.sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
      return sortedFiles
    },
    handleAdding() {
      // this.$refs['upload'].clearFiles()
      this.dialogVisible = true
      this.dialogStatus = 1
    },
    handleExceed(files, fileList) {
      this.$message({
        message: 'Only one file can be added at a time, please delete the existing file first',
        type: 'warning',
        duration: 10 * 1000
      })
    },
    async handleDownload(idx, row) {
      this.isDownloading = true
      const res = await downloadProjectFile({ id: row.id, filename: row.filename })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', row.filename) // or any other extension
      document.body.appendChild(link)
      link.click()
      this.isDownloading = false
    },
    async handleDelete(idx, row) {
      this.listLoading = true
      try {
        await deleteProjectFile(row.id)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    async handleChange(file, fileList) {
      if (this.extension[file.raw.type] === undefined) {
        this.$message({
          message: `Unable to upload a file: This file type is not supported`,
          type: 'warning',
          duration: 10 * 1000
        })
        this.$refs['upload'].clearFiles()
      } else if (file.size / 1024 > 20480) {
        this.$message({
          message: `This file cannot be uploaded because it exceeds the maximum allowed file size (20 MB)`,
          type: 'warning',
          duration: 10 * 1000
        })
        this.$refs['upload'].clearFiles()
      } else {
        this.uploadFileList = fileList
      }
    },
    async handleConfirm() {
      this.$refs['fileForm'].validate(async valid => {
        if (valid) {
          const data = this.fileForm
          // const filetype = this.uploadFileList[0].raw.type.split('/')[1]
          const filetype = this.extension[this.uploadFileList[0].raw.type]
          const form = new FormData()
          if (data.name !== '') {
            form.append('file', this.uploadFileList[0].raw, `${data.name}${filetype}`)
          } else {
            form.append('file', this.uploadFileList[0].raw, this.uploadFileList[0].raw.name)
          }
          if (data.version !== '') {
            form.append('version_id', data.version)
          }
          if (data.description !== '') {
            form.append('description', data.description)
          }
          try {
            this.loadingInstance = this.$loading({
              target: '.el-dialog',
              text: 'Loading'
            })
            await uploadProjectFile(this.projectSelectedId, form)
            this.loadingInstance.close()
            this.$message({
              message: 'Upload successful',
              type: 'success'
            })
            this.$refs['fileForm'].resetFields()
            this.dialogVisible = false
            this.fetchData()
          } catch (err) {
            this.loadingInstance.close()
            console.error(err)
          }
        } else {
          return false
        }
      })
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.uploadFileList = []
        this.$refs['fileForm'].resetFields()
        this.form = formTemplate
        this.$refs['upload'].clearFiles()
      })
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" :disabled="projectSelectedId === -1" @click="handleAdding">
          <i class="el-icon-plus" />
          {{ $t('File.AddFile') }}
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" :label="$t('File.Id')" min-width="110">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Name')" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.filename }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="Description" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      -->
      <el-table-column align="center" :label="$t('general.Creator')" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.author.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.CreateTime')" width="190">
        <template slot-scope="scope">
          {{ scope.row.created_on | formatTime }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')" width="240">
        <template slot-scope="scope">
          <el-button
            :loading="isDownloading"
            size="mini"
            type="primary"
            icon="el-icon-download"
            @click="handleDownload(scope.$index, scope.row)"
          >
            {{ $t('File.Download') }}
          </el-button>

          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button slot="reference" size="mini" type="danger">
              <i class="el-icon-delete" /> {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <el-dialog
      :title="$t('File.AddFile')"
      :visible.sync="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @closed="onDialogClosed"
    >
      <el-form ref="fileForm" :model="fileForm" :rules="fileFormRules" label-width="120px">
        <el-form-item :label="$t('File.Upload')" prop="upload">
          <el-upload
            ref="upload"
            class="upload-file"
            drag
            action=""
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-change="handleChange"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">{{ $t('File.DropFileHereOrClickUpload') }}</div>
          </el-upload>
        </el-form-item>

        <el-form-item :label="$t('general.Name')" prop="name">
          <el-input v-model="fileForm.name" :placeholder="$t('File.InputName')" />
        </el-form-item>

        <!-- <el-form-item :label="$t('general.Description')" prop="description">
          <el-input v-model="fileForm.description" type="textarea" />
        </el-form-item> -->

        <el-form-item :label="$t('Version.Version')" prop="version">
          <el-select
            v-model="fileForm.version"
            :placeholder="$t('Version.SelectVersion')"
            style="width: 100%"
            clearable
          >
            <el-option v-for="item in versionList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" :loading="memberConfirmLoading" @click="handleConfirm">{{
          $t('general.Confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
.el-upload-dragger {
  height: 140px;
  .el-icon-upload {
    margin: 10px 0 16px;
  }
}
</style>

<style lang="scss" scoped>
.upload-file >>> .el-upload-dragger {
  height: 100px;
}
.el-upload__text {
  margin-top: 0px;
}
</style>
