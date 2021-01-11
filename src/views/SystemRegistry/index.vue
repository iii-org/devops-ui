<script>
import Pagination from '@/components/Pagination'
import { getSystemRegistries, addSystemRegistry, deleteSystemRegistry } from '@/api/maintenance'

const defaultFormData = () => ({
  name: '',
  url: '',
  username: '',
  password: ''
})

export default {
  name: 'SystemRegistry',
  components: { Pagination },
  data: () => ({
    resultList: [],
    listLoading: true,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',

    formData: defaultFormData(),
    formRules: {
      name: [{ required: true, message: 'Please input registry name', trigger: 'blur' }],
      url: [{ required: true, message: 'Please input url', trigger: 'blur' }],
      username: [{ required: true, message: 'Please input username', trigger: 'blur' }]
    },
    dialogVisible: false,
    confirmLoading: false,

    showPassword: false
  }),
  computed: {
    pagedData() {
      const listData = this.resultList.filter(data => {
        if (this.searchData === '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
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
    searchData() {
      this.listQuery.page = 1
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      await getSystemRegistries().then(res => {
        this.resultList = res.data.map(item => ({
          name: item.name,
          registries: item.registries ? Object.keys(item.registries).join(', ') : '',
          created: item.created
        }))
      })
      this.listLoading = false
    },
    async handleDelete(registryName) {
      this.listLoading = true
      try {
        await deleteSystemRegistry(registryName)
        this.fetchData()
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
            this.fetchData()
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

<template>
  <div class="app-container">
    <div class="d-flex">
      <el-button id="btn-add-registry" type="success" @click="dialogVisible = true">
        <i class="el-icon-plus" /> {{ $t('Maintenance.AddRegistry') }}
      </el-button>
      <el-input
        id="input-search"
        v-model="searchData"
        :placeholder="$t('Maintenance.SearchRegistryName')"
        style="width: 250px"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" element-loading-text="Loading" :data="pagedData" border fit>
      <el-table-column align="center" :label="$t('Maintenance.RegistryName')" prop="name" min-width="150" />
      <el-table-column label="Registries" prop="registries" min-width="250" />
      <el-table-column align="center" :label="$t('general.CreateTime')" prop="created" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.created | YMDhmA }}</span>
        </template>
      </el-table-column>
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
            <el-button slot="reference" size="mini" type="danger">
              <i class="el-icon-delete" />
              {{ $t('general.Delete') }}
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
