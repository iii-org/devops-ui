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
        </div>
        <div class="mr-5">
          <el-button
            type="success"
            :disabled="isAdding"
            @click="handleShow"
          >
            + {{ $t('general.Add') }}
          </el-button>
        </div>
      </div>
      <el-divider class="mb-0" />
      <div v-show="isAdding">
        <el-form ref="form" :model="form">
          <el-row :gutter="20">
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-input
                v-model="form.fileExtension"
                :placeholder="this.$t('RuleMsg.PleaseInput') + this.$t('SystemConfigs.FileExtension')"
                type="text"
                class="mr-3"
              />
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-input
                v-model="form.mimeType"
                :placeholder="this.$t('RuleMsg.PleaseInput') + 'MIME Type'"
                type="text"
                class="mr-3"
              />
            </el-col>
            <el-col :span="24" :sm="12" :md="8" :lg="6">
              <el-input
                v-model="form.name"
                :placeholder="this.$t('RuleMsg.PleaseInput') + this.$t('general.Name')"
                type="text"
                class="mr-3"
              />
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
    <el-table
      :data="pagedData"
      border
      size="mini"
      style="width: 100%"
    >
      <el-table-column
        type="index"
        :label="$t('general.Index')"
        align="center"
        width="100"
      />
      <el-table-column
        prop="name"
        :label="$t('general.Name')"
        width="100"
      />
      <el-table-column
        prop="mimeType"
        label="MIME Type"
      />
      <el-table-column
        prop="fileExtension"
        :label="$t('SystemConfigs.FileExtension')"
        width="100"
      />
      <el-table-column
        :label="$t('general.Actions')"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <div v-if="!isEditing">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              circle
              @click="handleEdit(scope.row)"
            />
            <el-popconfirm
              confirm-button-text="Delete"
              cancel-button-text="Cancel"
              icon="el-icon-info"
              icon-color="red"
              title="Are you sure?"
              @confirm="handleDelete(scope.row.name)"
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
          <div v-else>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-check"
              circle
              @click="handleSaveFile(scope.row)"
            />
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-close"
              circle
              @click="handleCancelFile(scope.row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <!-- <span slot="footer" class="dialog-footer">
      <el-button id="dialog-btn-cancel" @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
      <el-button id="dialog-btn-confirm" type="primary" :loading="confirmLoading" @click="handleConfirm">
        {{ $t('general.Confirm') }}
      </el-button>
    </span> -->
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'
import MixinElTable from '@/mixins/MixinElTable'
import { allowedTypeMap, isAllowedTypes, fileSizeToMB, containSpecialChar } from '@/utils/extension.js'

export default {
  name: 'FileTypeDialog',
  components: { Pagination },
  mixins: [MixinElTable],
  data() {
    return {
      dialogVisible: false,
      isAdding: false,
      isEditing: false,
      form: {
        name: ''
      },
      confirmLoading: false
    }
  },
  computed: {
    fileData() {
      return Object.entries(allowedTypeMap()).map((item, index) => ({
        name: '123',
        mimeType: item[0],
        fileExtension: item[1]
      }))
    }
  },
  methods: {
    async fetchData() {
      return this.fileData
    },
    handleEdit(row) {
      this.isEditing = true
    },
    handleSaveFile(row) {
    },
    handleCancelFile(row) {
      this.isEditing = false
    },
    async handleDelete(secretName) {
      this.listLoading = true
      try {
        // await deleteSystemSecret(secretName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    initForm() {
      this.form = { name: '' }
    },
    handleShow() {
      this.isAdding = true
    },
    async handleConfirm() {

    },
    handleCancel() {
      this.initForm()
      this.isAdding = false
    },
    onDialogClosed() {
      this.$nextTick(() => {
        // this.$refs['form'].resetFields()
        // this.formData = defaultFormData()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__body {
  padding-top: 0;
}
</style>
