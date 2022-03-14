<template>
  <el-dialog
    :visible.sync="dialogVisible"
    height="100px"
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
            @click="handleShow"
          >
            + {{ $t('general.Add') }}
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
      <div v-show="isAdding">
        <el-form ref="form" :model="form" :rules="formRules" size="mini">
          <el-row :gutter="20">
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-form-item prop="fileExtension" class="required">
                <el-input
                  v-model="form.fileExtension"
                  :placeholder="this.$t('RuleMsg.PleaseInput') + this.$t('SystemConfigs.FileExtension')"
                  type="text"
                  class="mr-3"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-form-item prop="mimeType" class="required">
                <el-input
                  v-model="form.mimeType"
                  :placeholder="this.$t('RuleMsg.PleaseInput') + 'MIME Type'"
                  type="text"
                  class="mr-3"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-form-item prop="name">
                <el-input
                  v-model="form.name"
                  :placeholder="this.$t('RuleMsg.PleaseInput') + this.$t('general.Name')"
                  type="text"
                  class="mr-3"
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
          width="100"
        />
        <el-table-column
          prop="name"
          :label="$t('general.Name')"
          width="150"
        >
          <template slot-scope="scope">
            <el-form-item
              v-show="scope.row.edit"
              :prop="'pagedData.'+ scope.$index +'.name'"
              :rules="formTableRules.name"
            >
              <el-input
                v-model="scope.row.name"
                type="text"
              />
            </el-form-item>
            <span v-show="!scope.row.edit">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="mimeType"
          label="MIME Type"
        >
          <template slot-scope="scope">
            <el-form-item
              v-show="scope.row.edit"
              :prop="'pagedData.'+ scope.$index +'.mimeType'"
              :rules="formTableRules.mimeType"
            >
              <el-input
                v-model="scope.row.mimeType"
                type="text"
              />
            </el-form-item>
            <span v-show="!scope.row.edit">{{ scope.row.mimeType }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="fileExtension"
          :label="$t('SystemConfigs.FileExtension')"
          width="100"
        >
          <template slot-scope="scope">
            <el-form-item
              v-show="scope.row.edit"
              :prop="'pagedData.'+ scope.$index +'.fileExtension'"
              :rules="formTableRules.fileExtension"
            >
              <el-input
                v-model="scope.row.fileExtension"
                type="text"
              />
            </el-form-item>
            <span v-show="!scope.row.edit">{{ scope.row.fileExtension }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('general.Actions')"
          align="center"
          width="150"
        >
          <template slot-scope="scope">
            <div v-show="!scope.row.edit">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                circle
                @click="handleEdit(scope)"
              />
              <el-popconfirm
                confirm-button-text="Delete"
                cancel-button-text="Cancel"
                icon="el-icon-info"
                icon-color="red"
                title="Are you sure?"
                @confirm="handleDelete(scope.row.id)"
              >
                <el-button
                  slot="reference"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  circle
                />
              </el-popconfirm>
            </div>
            <div v-show="scope.row.edit">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-check"
                circle
                @click="handleSaveFile(scope)"
              />
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-close"
                circle
                @click="handleCancelFile(scope)"
              />
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
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'
import MixinElTable from '@/mixins/MixinElTable'
import {
  getUploadFileType,
  addUploadFileType,
  editUploadFileType,
  deleteUploadFileType
} from '@/api_v2/fileType'

const defaultFormData = () => ({
  name: '',
  mimeType: '',
  fileExtension: ''
})

export default {
  name: 'FileTypeDialog',
  components: { Pagination },
  mixins: [MixinElTable],
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
        fileExtension: [{
          required: true,
          message: 'Please input File Extension',
          trigger: 'blur'
        }],
        mimeType: [{
          required: true,
          message: 'Please input Mime Type',
          trigger: 'blur'
        }]
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
    }
  },
  methods: {
    async fetchData() {
      const res = await getUploadFileType()
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
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    initForm() {
      this.form = defaultFormData()
    },
    validate (rule, value, callback) {
      const i = this.originData.findIndex((item) => item.id === this.rowCache.id)
      const type = rule.field.split('.')[2]
      if (value !== this.originData[i][type]) {
        this.isSaved = false
        callback(new Error('not saved'))
      } else {
        this.isSaved = true
        callback()
      }
    },
    handleShow() {
      this.isAdding = true
    },
    async handleConfirm() {
      this.$refs['form'].validate(async(valid) => {
        if (valid) {
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
      this.isAdding = false
      this.initForm()
    },
    handleEdit(scope) {
      if (this.isSaved) {
        if (this.rowCache) {
          const i = this.originData.findIndex((item) => item.id === this.rowCache.id)
          this.rowCache.edit = false
          this.rowCache = this.originData[i]
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
        await this.loadData()
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    handleSaveFile(scope) {
      this.$refs['formTable'].validate(async(valid) => {
        if (!valid) {
          this.listLoading = true
          const sendData = new FormData()
          sendData.append('name', scope.row.name)
          sendData.append('mimetype', scope.row.mimeType)
          sendData.append('file_extension', scope.row.fileExtension)
          try {
            await editUploadFileType(scope.row.id, sendData)
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
            this.isSaved = true
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
    handleCancelFile(scope) {
      const i = this.originData.findIndex((item) => item.id === this.rowCache.id)
      scope.row.name = this.originData[i].name
      scope.row.mimeType = this.originData[i].mimeType
      scope.row.fileExtension = this.originData[i].fileExtension
      scope.row.edit = this.originData[i].edit
      this.isSaved = true
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.handleCancel()
      })
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

>>> .el-form-item__content {
  display: inline-block;
}
</style>
