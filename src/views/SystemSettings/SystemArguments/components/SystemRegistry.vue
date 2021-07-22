<template>
  <div class="app-container">
    <div class="flex justify-between">
      <el-button id="btn-add-registry" type="success" @click="dialogVisible = true">
        <i class="el-icon-plus" /> {{ $t('Maintenance.AddRegistry') }}
      </el-button>
      <el-input
        id="input-search-registry"
        v-model="keyword"
        :placeholder="$t('Maintenance.SearchRegistryName')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
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
        :label="$t('general.Status')"
        min-width="85"
        size="midium"
        location="systemRegistry"
      />
      <!-- <el-table-column align="center" :label="$t('general.Status')" min-width="85">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'Active'" class="el-tag--circle" type="success" size="medium" effect="dark">{{ scope.row.status }}</el-tag>
          <el-tag v-else-if="scope.row.status === 'Removing'" class="el-tag--circle" type="warning" size="medium" effect="dark">{{
            scope.row.status
          }}</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column align="center" :label="$t('Maintenance.RegistryName')" prop="name" min-width="150" />
      <el-table-column label="Registries" prop="registries" min-width="250" />
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

    <el-dialog
      :title="$t('Maintenance.AddRegistry')"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form ref="form" label-position="top" :model="formData" :rules="formRules" label-width="20%">
        <el-form-item :label="$t('Maintenance.RegistryName')" prop="name">
          <el-input id="input-registry-name" v-model="formData.name" />
        </el-form-item>
        <el-form-item label="url" prop="url">
          <el-input id="input-url" v-model="formData.url" />
        </el-form-item>
        <el-form-item :label="$t('Maintenance.UserName')" prop="username">
          <el-input id="input-username" v-model="formData.username" />
        </el-form-item>
        <el-form-item :label="$t('Maintenance.Password')" prop="password">
          <el-input id="input-password" v-model="formData.password" :type="showPassword ? 'text' : 'password'">
            <i slot="suffix" class="el-input__icon el-icon-view" @click="showPassword = !showPassword" />
          </el-input>
        </el-form-item>
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
import { addSystemRegistry, deleteSystemRegistry, getSystemRegistries } from '@/api/maintenance'
import MixinElTable from '@/mixins/MixinElTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'

const defaultFormData = () => ({
  name: '',
  url: '',
  username: '',
  password: ''
})

export default {
  name: 'SystemRegistry',
  components: { ElTableColumnTime, Pagination, ElTableColumnTag },
  mixins: [MixinElTable],
  data() {
    return {
      formData: defaultFormData(),
      formRules: {
        name: [{ required: true, message: 'Please input registry name', trigger: 'blur' }],
        url: [{ required: true, message: 'Please input url', trigger: 'blur' }],
        username: [{ required: true, message: 'Please input username', trigger: 'blur' }]
      },
      dialogVisible: false,
      confirmLoading: false,

      showPassword: false
    }
  },
  methods: {
    async fetchData() {
      const res = await getSystemRegistries()
      return res.data.map(item => ({
        name: item.name,
        registries: item.registries ? Object.keys(item.registries).join(', ') : '',
        created: item.created,
        status: item.removed ? 'Removing' : 'Active'
      }))
    },
    async handleDelete(registryName) {
      this.listLoading = true
      try {
        await deleteSystemRegistry(registryName)
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
          const sendData = this.formData
          try {
            await addSystemRegistry(sendData)
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
