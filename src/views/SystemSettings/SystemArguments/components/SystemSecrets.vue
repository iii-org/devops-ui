<template>
  <div class="app-container">
    <div class="d-flex justify-space-between">
      <el-button id="btn-add-secret" type="success" @click="dialogVisible = true">
        <i class="el-icon-plus" /> {{ $t('Maintenance.AddSecret') }}
      </el-button>
      <el-input
        id="input-search"
        v-model="searchData"
        :placeholder="$t('Maintenance.SearchSecretName')"
        style="width: 250px"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <div class="mb-5 text-right">
      <el-button id="btn-reload" type="primary" icon="el-icon-refresh" size="mini" plain @click="fetchData()">
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <el-table v-loading="listLoading" :element-loading-text="$t('Loading')" :data="pagedData" border fit height="100%">
      <el-table-column-tag
        prop="status"
        :label="$t('Maintenance.Status')"
        min-width="85"
        size="midium"
        location="systemSecrets"
      />
      <!-- <el-table-column align="center" :label="$t('Maintenance.Status')" min-width="85">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'Active'" class="el-tag--circle" type="success" size="medium" effect="dark">{{
            scope.row.status
          }}</el-tag>
          <el-tag v-else-if="scope.row.status === 'Removing'" class="el-tag--circle" type="warning" size="medium" effect="dark">{{
            scope.row.status
          }}</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column align="center" :label="$t('Maintenance.SecretName')" prop="name" min-width="150" />
      <el-table-column label="Keys" prop="keys" min-width="250" />
      <el-table-column-time prop="created" :label="$t('general.CreateTime')" />
      <el-table-column align="center" :label="$t('general.Actions')" width="120">
        <template slot-scope="scope">
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(scope.row.name)"
          >
            <el-button
              :id="`btn-delete-${scope.$index}`"
              slot="reference"
              size="mini"
              type="danger"
              :disabled="scope.row.status === 'Removing'"
            >
              <i class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog :title="$t('Maintenance.AddSecret')" :visible.sync="dialogVisible" @closed="onDialogClosed">
      <el-form ref="form" label-position="top" :model="formData" :rules="formRules" label-width="20%">
        <el-form-item :label="$t('Maintenance.SecretName')" prop="name">
          <el-input id="input-secret-name" v-model="formData.name" />
        </el-form-item>
        <el-row v-for="(item, index) in formData.data" :key="item + index" :gutter="12" type="flex">
          <el-col :span="9">
            <el-form-item
              :label="`key ${index + 1} `"
              :prop="'data.' + index + '.key'"
              :rules="[{ required: true, message: 'Please input key', trigger: 'blur' }]"
            >
              <el-input :id="`input-key${index + 1}`" v-model="formData.data[index].key" placeholder="key" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="`value ${index + 1}`"
              :prop="'data.' + index + '.value'"
              :rules="[{ required: true, message: 'Please input value', trigger: 'blur' }]"
            >
              <el-input
                :id="`input-value${index + 1}`"
                v-model="formData.data[index].value"
                placeholder="value"
                :type="formData.data[index].showValue ? 'text' : 'password'"
              >
                <i
                  slot="suffix"
                  class="el-input__icon el-icon-view"
                  @click="formData.data[index].showValue = !formData.data[index].showValue"
                />
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="3" style="padding-top: 45px">
            <el-button
              :id="`btn-delete${index + 1}`"
              type="danger"
              size="small"
              :disabled="formData.data.length <= 1"
              @click.prevent="removeItem(item)"
            >
              {{ $t('general.Delete') }}
            </el-button>
          </el-col>
        </el-row>
        <el-button id="btn-add-secret-item" type="success" size="small" @click="addItem">
          <i class="el-icon-plus" /> {{ $t('Maintenance.AddSecret') }}
        </el-button>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button id="dialog-btn-confirm" type="primary" :loading="confirmLoading" @click="handleConfirm">
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { addSystemSecret, deleteSystemSecret, getSystemSecrets } from '@/api/maintenance'
import MixinElTable from '@/mixins/MixinElTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'

const defaultFormData = () => ({
  name: '',
  type: 'secret',
  data: [{ key: '', value: '', showValue: false }]
})

export default {
  name: 'SystemSecrets',
  components: { ElTableColumnTime, Pagination, ElTableColumnTag },
  mixins: [MixinElTable],
  data: () => ({
    formData: defaultFormData(),
    formRules: {
      name: [{ required: true, message: 'Please input Secret Name', trigger: 'blur' }]
    },
    dialogVisible: false,
    confirmLoading: false
  }),
  methods: {
    async fetchData() {
      const res = await getSystemSecrets()
      return res.data.map(item => ({
        name: item.name,
        created: item.created,
        keys: item.data ? Object.keys(item.data).join(', ') : '',
        status: item.removed ? 'Removing' : 'Active'
      }))
    },
    async handleDelete(secretName) {
      this.listLoading = true
      try {
        await deleteSystemSecret(secretName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    async handleConfirm() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.listLoading = true
          this.confirmLoading = true
          const sendData = {
            name: this.formData.name,
            type: this.formData.type,
            data: this.formData.data.reduce((result, cur) => Object.assign(result, { [cur.key]: cur.value }), {})
          }
          try {
            await addSystemSecret(sendData)
            await this.loadData()
            this.dialogVisible = false
          } catch (error) {
            console.error(error)
          }
          this.listLoading = false
          this.confirmLoading = false
        } else {
          return false
        }
      })
    },
    addItem() {
      this.formData.data.push({
        key: '',
        value: '',
        showValue: false
      })
    },
    removeItem(item) {
      const index = this.formData.data.indexOf(item)
      if (index !== -1) {
        this.formData.data.splice(index, 1)
      }
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.formData = defaultFormData()
      })
    }
  }
}
</script>
