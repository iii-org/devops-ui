<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import * as monaco from 'monaco-editor'
import MixinElTable from '@/components/MixinElTable'

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  mixins: [MixinElTable],
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      drawer: false,
      drawerOpend: false,
      direction: 'rtl',
      drawerTitle: 'New File',
      fileName: '',
      fileType: 'javascript',
      fileTypeOpts: [
        'aes',
        'apex',
        'azcli',
        'bat',
        'c',
        'cameligo',
        'clojure',
        'coffeescript',
        'cpp',
        'csharp',
        'csp',
        'css',
        'dockerfile',
        'fsharp',
        'go',
        'graphql',
        'handlebars',
        'html',
        'ini',
        'java',
        'javascript',
        'json',
        'kotlin',
        'less',
        'lua',
        'markdown',
        'mips',
        'msdax',
        'mysql',
        'objective-c',
        'pascal',
        'pascaligo',
        'perl',
        'pgsql',
        'php',
        'plaintext',
        'postiats',
        'powerquery',
        'powershell',
        'pug',
        'python',
        'r',
        'razor',
        'redis',
        'redshift',
        'restructuredtext',
        'ruby',
        'rust',
        'sb',
        'scheme',
        'scss',
        'shell',
        'sol',
        'sql',
        'st',
        'swift',
        'tcl',
        'twig',
        'typescript',
        'vb',
        'xml',
        'yaml'
      ],
      dialogVisible: false,
      fileList: [],
      submitLoading: false,
      commitMsg: '',
      uploadFolder: '',
      uploadCommitMsg: '',
      editor: undefined,
      newFileBtnLoading: false
    }
  },
  computed: {
    ...mapGetters(['fileListByBranch', 'fileListTotalByBranch']),
    projectName() {
      return this.$route.params.projectName
    },
    branchName() {
      return this.$route.params.branchName
    },
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.fileListByBranch.slice(start, end)
    }
  },
  watch: {
    drawer(boo) {
      if (this.drawerOpend) return
      this.drawerOpend = true
      this.$nextTick(() => {
        this.editor = monaco.editor.create(document.getElementById('editor-container'), {
          value: 'console.log("Hello, world")',
          language: this.fileType,
          theme: 'vs-dark'
        })
      })
    },
    fileType(value) {
      monaco.editor.setModelLanguage(this.editor.getModel(), value)
    }
  },
  async created() {
    await this['fileList/getFileListByBranch']({ rId: this.$route.params.bId, bName: this.branchName })
    this.listLoading = false
  },
  methods: {
    ...mapActions(['fileList/getFileListByBranch', 'fileList/addFile']),
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    handleAdding(scope) {
      this.drawer = true
    },
    handleClose(done) {
      done()
    },
    handleRemove(file, fileList) {
      // console.log(file, fileList)
    },
    handlePreview(file) {
      // console.log(file)
    },
    handleExceed(files, fileList) {
      this.$notify({
        title: this.$t('general.Warning'),
        message: `The limit is 3, you selected ${files.length} files this time, add up to ${files.length +
          fileList.length} totally`,
        type: 'warning',
        duration: 10 * 1000
      })
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`Cancel the transfert of ${file.name} ?`)
    },
    async handleAddingFile() {
      const data = {
        branch: this.branchName,
        file_path: this.fileName,
        start_branch: this.branchName,
        author_email: 'author@example.com',
        author_name: 'John Doe',
        'encoding"': 'base64',
        'content"': btoa(this.editor.getValue()),
        commit_message: this.commitMsg
      }
      this.newFileBtnLoading = true
      await this['fileList/addFile']({ rId: this.$route.params.rId, data })
      this.newFileBtnLoading = false
      this.dialogVisible = false
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div>
      <h3>
        {{ projectName }}
        <span class="hBtn"><el-button size="mini" type="info" @click="handleAdding()">Download</el-button></span>
        <span class="hBtn"><el-button size="mini" type="primary" @click="dialogVisible = true">Upload</el-button></span>
        <span class="hBtn">
          <el-button size="mini" type="success" @click="handleAdding()">
            <i class="el-icon-plus" />
            New File
          </el-button>
        </span>
      </h3>
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      height="100%"
      row-class-name="el-table-row"
    >
      <el-table-column label="File Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="Commit Message" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_message }}
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="Commit Time" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.commit_time }}
        </template>
      </el-table-column> -->
      <el-table-column label="Action" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleAdding(scope)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="fileListTotalByBranch"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
      :append-to-body="true"
      :with-header="false"
      size="60%"
    >
      <div class="container">
        <div class="file-name-input">
          <span class="file-name-label">
            {{ branchName + ' / ' }}
          </span>
          <el-input v-model="fileName" size="small" placeholder="Please input file name" />
          <el-select v-model="fileType" size="small" placeholder="Select">
            <el-option v-for="item in fileTypeOpts" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
        <el-divider />
        <div id="editor-container" />
        <div class="file-commit-message">
          <h4>Commit Message :</h4>
          <el-input v-model="commitMsg" type="textarea" :rows="3" />
        </div>
        <div class="file-drawer__footer">
          <el-button @click="drawer = false">Cancel</el-button>
          <el-button type="primary" :loading="newFileBtnLoading" @click="handleAddingFile">Confirm</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="Upload Files" :visible.sync="dialogVisible" width="50%">
      <h3>Branch: {{ branchName }}</h3>
      <el-divider />
      <h4>Folder</h4>
      <el-input v-model="uploadFolder" size="small" placeholder="" />
      <h4>Files</h4>
      <el-upload
        class="upload"
        drag
        action=""
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :file-list="fileList"
        multiple
        style="width: 100%"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
      </el-upload>
      <h4>Commit Message :</h4>
      <el-input v-model="uploadCommitMsg" type="textarea" :rows="3" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.el-drawer > header > span:focus {
  outline-color: white;
}
.el-drawer > header > button:focus {
  outline-color: white;
}
.el-drawer > header > button:hover {
  color: rgb(64, 158, 255);
}
</style>

<style lang="scss" scoped>
.hBtn {
  float: right;
  padding-right: 4px;
}
.file-name-input {
  padding: 0 18px;
  font-size: 18px;
  .el-input {
    width: 180px;
  }
  .el-select {
    float: right;
  }
}
.container {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: 20px;
  #editor-container {
    flex: 1;
  }
  .file-commit-message {
    flex-basis: 160px;
  }
  .file-drawer__footer {
    flex-basis: 60px;
    padding-top: 20px;
  }
}
</style>
