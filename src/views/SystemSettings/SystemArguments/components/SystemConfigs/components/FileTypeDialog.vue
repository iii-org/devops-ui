<template>
  <el-dialog
    :visible.sync="dialogVisible"
    @closed="onDialogClosed"
  >
    <template slot="title" class="header-title">
      <div class="flex justify-between">
        <div>
          <span class="header-title font-medium text-lg">
            {{ $t('SystemConfigs.UploadFileTypes') }}
          </span>
          <el-button
            :disabled="isAdding"
            type="success"
            size="small"
            icon="el-icon-plus"
            @click="handleShow"
          >
            {{ $t('general.Add') }}
          </el-button>
        </div>
        <div class="mr-5 float-right">
          <el-input
            v-model="keyword"
            clearable
            prefix-icon="el-icon-search"
            :placeholder="$t('general.Search')"
            style="width: 100%"
          />
        </div>
      </div>
      <el-divider class="my-2" />
      <div v-show="isAdding" class="m-5">
        <el-form ref="form" :model="form" :rules="formRules" size="mini">
          <el-row :gutter="20">
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-form-item prop="fileExtension" class="flex required">
                <el-input
                  v-model="form.fileExtension"
                  :placeholder="this.$t('RuleMsg.PleaseInput') + this.$t('SystemConfigs.FileExtension')"
                  type="text"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-form-item prop="mimeType" class="flex required">
                <el-input
                  v-model="form.mimeType"
                  :placeholder="this.$t('RuleMsg.PleaseInput') + 'MIME Type'"
                  type="text"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-form-item prop="name">
                <el-input
                  v-model="form.name"
                  :placeholder="this.$t('RuleMsg.PleaseInput') + this.$t('general.Name')"
                  type="text"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-form-item>
                <el-button type="primary" size="mini" @click="handleConfirm">
                  {{ $t('general.Save') }}
                </el-button>
                <el-button size="mini" @click="handleCancel">
                  {{ $t('general.Cancel') }}
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </template>
    <el-form ref="formTable" :model="formTable" :rules="formRules" size="mini">
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="formTable.pagedData"
        border
        fit
        size="mini"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          :label="$t('general.Index')"
          align="center"
          width="50"
        />
        <el-table-column
          prop="fileExtension"
          :label="$t('SystemConfigs.FileExtension')"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-form-item
              v-show="scope.row.edit"
              :prop="'pagedData.'+ scope.$index +'.fileExtension'"
              :rules="formTableRules.fileExtension"
              :style="isSaved ? 'margin-bottom: 0;' : ''"
            >
              <el-input v-model="scope.row.fileExtension" />
            </el-form-item>
            <span v-show="!scope.row.edit">{{ scope.row.fileExtension }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="mimeType"
          label="MIME Type"
          min-width="300"
        >
          <template slot-scope="scope">
            <el-form-item
              v-show="scope.row.edit"
              :prop="'pagedData.'+ scope.$index +'.mimeType'"
              :rules="formTableRules.mimeType"
              :style="isSaved ? 'margin-bottom: 0;' : ''"
            >
              <el-input v-model="scope.row.mimeType" />
            </el-form-item>
            <span v-show="!scope.row.edit">{{ scope.row.mimeType }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('general.Name')"
          min-width="150"
        >
          <template slot-scope="scope">
            <el-form-item
              v-show="scope.row.edit"
              :prop="'pagedData.'+ scope.$index +'.name'"
              :rules="formTableRules.name"
              :style="isSaved ? 'margin-bottom: 0;' : ''"
            >
              <el-input v-model="scope.row.name" />
            </el-form-item>
            <span v-show="!scope.row.edit">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('general.Actions')"
          align="center"
        >
          <template slot-scope="scope">
            <div v-show="!scope.row.edit">
              <el-tooltip
                placement="bottom"
                :content="$t('general.Edit')"
              >
                <em
                  class="ri-file-edit-line finished operate-button"
                  @click="handleEdit(scope)"
                />
              </el-tooltip>
              <el-tooltip
                placement="bottom"
                :content="$t('general.Delete')"
              >
                <el-popconfirm
                  :title="$t('Notify.confirmDelete')"
                  :confirm-button-text="$t('general.Delete')"
                  :cancel-button-text="$t('general.Cancel')"
                  icon="el-icon-info"
                  icon-color="red"
                  @confirm="handleDelete(scope.row.id)"
                >
                  <em slot="reference" class="ri-delete-bin-2-line danger operate-button" />
                </el-popconfirm>
              </el-tooltip>
            </div>
            <div v-show="scope.row.edit">
              <el-tooltip
                placement="bottom"
                :content="$t('general.ok')"
              >
                <em
                  class="ri-checkbox-circle-line active operate-button"
                  @click="handleSaveFile(scope.row)"
                />
              </el-tooltip>
              <el-tooltip
                placement="bottom"
                :content="$t('general.Cancel')"
              >
                <em
                  class="ri-close-circle-line danger operate-button"
                  @click="handleCancelFile(scope.row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <div class="text-xs mt-2">*MIME Type IANA :
      <a
        class="el-link el-link--primary is-underline"
        href="https://www.iana.org/assignments/media-types/media-types.xhtml"
        target="_blank"
      >
        https://www.iana.org/assignments/media-types/media-types.xhtml
      </a>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import {
  getUploadFileTypeList,
  addUploadFileType,
  updateUploadFileType,
  deleteUploadFileType
} from '@/api_v2/systemParameter'

const defaultFormData = () => ({
  name: '',
  mimeType: '',
  fileExtension: ''
})

export default {
  name: 'FileTypeDialog',
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      searchKeys: ['name', 'mimeType', 'fileExtension'],
      dialogVisible: false,
      isAdding: false,
      rowCache: null,
      originData: [],
      isSaved: true,
      form: defaultFormData(),
      formRules: {
        fileExtension: [
          {
            required: true,
            message: 'Please input File Extension',
            trigger: 'blur'
          },
          {
            required: true,
            pattern: /^[.]{1}[-\w]+$/,
            message: 'Please follow the format rule',
            trigger: 'blur'
          }
        ],
        mimeType: [
          {
            required: true,
            message: 'Please input Mime Type',
            trigger: 'blur'
          },
          {
            required: true,
            pattern: /^[-.\w]+\/[-.\w]+$/,
            message: 'Please follow the format rule',
            trigger: 'blur'
          }
        ]
      },
      formTableRules: {
        fileExtension: [{
          validator: this.validate,
          trigger: 'blur'
        }],
        mimeType: [{
          validator: this.validate,
          trigger: 'blur'
        }],
        name: [{
          validator: this.validate,
          trigger: 'blur'
        }]
      }
    }
  },
  computed: {
    formTable() {
      return { pagedData: this.pagedData }
    },
    originDataMimeType() {
      return this.originData.map((item) => item.mimeType)
    },
    selectedRowIndex() {
      return this.originData.findIndex((item) => item.id === this.rowCache.id)
    }
  },
  methods: {
    ...mapActions('app', ['setFileType', 'setFileTypeList']),
    async fetchData() {
      const res = await getUploadFileTypeList()
      const uploadFileTypesList = res.data.upload_file_types.map((item) => ({
        id: item.id,
        name: item.name,
        mimeType: item['MIME Type'],
        fileExtension: item['file extension'],
        edit: false
      }))
      this.setOriginData(uploadFileTypesList)
      return uploadFileTypesList
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    initForm() {
      this.form = defaultFormData()
    },
    validate (rule, value, callback) {
      const type = rule.field.split('.')[2]
      if (value !== this.originData[this.selectedRowIndex][type]) {
        this.isSaved = false
        callback(new Error('not saved'))
      } else {
        this.isSaved = true
        callback()
      }
    },
    checkIncludesMimeType(mimeType, id = null) {
      if (id) {
        const selectedRow = this.originData.find((item) => item.id === id)
        if (selectedRow.mimeType === mimeType) return false
      }
      if (this.originDataMimeType.includes(mimeType)) {
        this.$message({
          title: this.$t('general.Error'),
          message: this.$t('SystemConfigs.includesMimeType', { mimeType: mimeType }),
          type: 'warning'
        })
      }
      return this.originDataMimeType.includes(mimeType)
    },
    handleShow() {
      this.isAdding = true
    },
    async handleConfirm() {
      this.$refs['form'].validate(async(valid) => {
        if (valid && !this.checkIncludesMimeType(this.form.mimeType)) {
          this.listLoading = true
          const sendData = new FormData()
          sendData.append('name', this.form.name)
          sendData.append('mimetype', this.form.mimeType)
          sendData.append('file_extension', this.form.fileExtension)
          try {
            await addUploadFileType(sendData)
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Added'),
              type: 'success'
            })
            this.updateFileTypeStatus()
            this.handleCancel()
            await this.loadData()
          } catch (error) {
            console.error(error)
          } finally {
            this.listLoading = false
          }
        } else {
          return false
        }
      })
    },
    handleCancel() {
      this.$refs['form'].resetFields()
      this.isSaved = true
      this.isAdding = false
      this.initForm()
    },
    handleEdit(scope) {
      if (this.isSaved) {
        if (this.rowCache) {
          this.restoreRow(this.rowCache)
        }
        scope.row.edit = true
        this.rowCache = scope.row
        this.$refs['formTable'].clearValidate()
      }
    },
    async handleDelete(type_id) {
      this.listLoading = true
      try {
        await deleteUploadFileType(type_id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        this.updateFileTypeStatus()
        await this.loadData()
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    async handleSaveFile(row) {
      if (!(/^[-.\w]+\/[-.\w]+$/).test(row.mimeType) || !(/^[.]{1}[-\w]+$/).test(row.fileExtension)) {
        this.$message({
          title: this.$t('general.Error'),
          message: 'Please follow the format rule',
          type: 'warning'
        })
      } else if (this.checkIncludesMimeType(row.mimeType, row.id)) {
        return false
      } else if (!this.isSaved) {
        this.listLoading = true
        const sendData = new FormData()
        sendData.append('name', row.name)
        sendData.append('mimetype', row.mimeType)
        sendData.append('file_extension', row.fileExtension)
        try {
          await updateUploadFileType(row.id, sendData)
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.updateFileTypeStatus()
          this.isSaved = true
          await this.loadData()
        } catch (error) {
          console.error(error)
        } finally {
          this.listLoading = false
        }
      } else {
        this.restoreRow(row)
        return false
      }
    },
    handleCancelFile(row) {
      this.restoreRow(row)
      this.isSaved = true
    },
    restoreRow(row) {
      const i = this.selectedRowIndex
      row.name = this.originData[i].name
      row.mimeType = this.originData[i].mimeType
      row.fileExtension = this.originData[i].fileExtension
      row.edit = this.originData[i].edit
    },
    updateFileTypeStatus() {
      this.setFileType()
      this.setFileTypeList()
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.handleCancel()
      })
      this.$emit('update')
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__body {
  padding-top: 0;
}

>>> .required:before {
  display: inline-block;
  content:'*';
  color:#ff4949;
  margin-right: 4px;
}
</style>
