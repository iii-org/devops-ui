<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectFileList, downloadProjectFile, getProjectVersion, uploadProjectFile } from '@/api/projects'
const formTemplate = {
  name: '',
  version: '',
  description: ''
}

export default {
  components: {
    Pagination,
    ProjectListSelector
  },
  data() {
    return {
      listLoading: true,
      dialogVisible: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, //總筆數
      searchData: '',
      fileFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }]
        // version: [{ required: false, message: 'Please select version', trigger: 'blur' }],
        // description: [{ required: false, message: 'Please input description', trigger: 'blur' }]
      },
      fileList: [],
      versionList: [],
      dialogStatus: 1,
      memberConfirmLoading: false,
      fileForm: formTemplate,
      uploadFileList: []
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.fileList.filter((data) => {
        if (this.searchData == '' || data.filename.toLowerCase().includes(this.searchData.toLowerCase())) {
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
    },
    form(value) {
      console.log(value)
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    fetchData() {
      this.listLoading = true
      Promise.all([getProjectFileList(this.projectSelectedId), getProjectVersion(this.projectSelectedId)]).then(
        (res) => {
          this.fileList = res[0].data.files
          this.versionList = res[1].data.versions
        }
      )
      this.listLoading = false
    },
    handleAdding() {
      this.dialogVisible = true
      this.dialogStatus = 1
    },
    handleExceed(files, fileList) {
      this.$message.warning(`Only one file can be added at a time, please delete the existing file first`)
    },
    async handleDownload(idx, row) {
      const res = await downloadProjectFile({ id: row.id, filename: row.filename })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', row.filename) //or any other extension
      document.body.appendChild(link)
      link.click()
    },
    async handleChange(file, fileList) {
      this.uploadFileList = fileList
    },
    async handleConfirm() {
      this.$refs['fileForm'].validate(async (valid) => {
        if (valid) {
          const data = this.fileForm
          const filetype = this.uploadFileList[0].raw.type.split('/')[1]
          let form = new FormData()
          form.append('file', this.uploadFileList[0].raw, `${data.name}.${filetype}`)
          await uploadProjectFile(this.projectSelectedId, form)
          this.$refs['fileForm'].resetFields()
          this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = formTemplate
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
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add File
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        placeholder="Please input file name"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"></i
      ></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column align="center" label="No" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.filename }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="Description" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="Creator" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.author.name }}
        </template>
      </el-table-column>
      <el-table-column label="Create time" width="120px">
        <template slot-scope="scope">
          {{ scope.row.created_on | relativeTime }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="150px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleDownload(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Download
          </el-button>
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

    <el-dialog :title="`Add file`" :visible.sync="dialogVisible" width="50%" @closed="onDialogClosed">
      <el-form ref="fileForm" :model="fileForm" :rules="fileFormRules" label-width="120px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="fileForm.name" />
        </el-form-item>
        <!-- <el-form-item label="Description" prop="description">
          <el-input v-model="fileForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="Versions" prop="version">
          <el-select v-model="fileForm.version" placeholder="select a version" style="width: 100%">
            <el-option v-for="item in versionList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="Upload" prop="upload">
          <el-upload
            class="upload-file"
            drag
            ref="upload"
            action=""
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-change="handleChange"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">drap file here or <em>click upload</em></div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="memberConfirmLoading" @click="handleConfirm">Confirm</el-button>
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
