<template>
  <div class="app-container">
    <div class="flex justify-between">
      <el-button
        id="btn-add-registry"
        class="buttonSecondary"
        @click="dialogVisible = true"
      >
        <em class="el-icon-plus" /> {{ $t('Maintenance.AddRegistry') }}
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
      <el-button
        id="btn-reload"
        class="buttonPrimaryReverse"
        icon="el-icon-refresh"
        size="mini"
        plain
        @click="fetchData()"
      >
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="pagedData"
      fit
    >
      <el-table-column-tag
        prop="status"
        :label="$t('general.Status')"
        min-width="85"
        size="midium"
        location="systemRegistry"
      />
      <el-table-column
        align="center"
        :label="$t('Maintenance.RegistryName')"
        prop="name"
        min-width="150"
      />
      <el-table-column
        label="Registries"
        prop="registries"
        min-width="250"
      />
      <el-table-column-time
        prop="created"
        :label="$t('general.CreateTime')"
      />
      <el-table-column
        align="center"
        :label="$t('general.Actions')"
      >
        <template slot-scope="scope">
          <el-tooltip
            placement="bottom"
            :content="$t('general.Delete')"
          >
            <template v-if="scope.row.status !== 'Removing'">
              <el-popconfirm
                :title="$t('Notify.confirmDelete')"
                :confirm-button-text="$t('general.Delete')"
                :cancel-button-text="$t('general.Cancel')"
                icon="el-icon-info"
                icon-color="red"
                @confirm="handleDelete(scope.row.name)"
              >
                <em
                  slot="reference"
                  class="ri-delete-bin-2-line danger operate-button"
                />
              </el-popconfirm>
            </template>
            <div v-else class="disabled">
              <em class="ri-delete-bin-2-line disabled operate-button" />
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
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
            <em slot="suffix" class="el-input__icon el-icon-view" @click="showPassword = !showPassword" />
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" class="buttonSecondaryReverse" @click="dialogVisible = false">
          {{ $t('general.Cancel') }}
        </el-button>
        <el-button id="dialog-btn-confirm" class="buttonPrimary" :loading="confirmLoading" @click="handleConfirm">
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addSystemRegistry, deleteSystemRegistry, getSystemRegistries } from '@/api/maintenance'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { ElTableColumnTime, ElTableColumnTag } from '@/components'

const defaultFormData = () => ({
  name: '',
  url: '',
  username: '',
  password: ''
})

export default {
  name: 'SystemRegistry',
  components: { ElTableColumnTime, ElTableColumnTag },
  mixins: [BasicData, Pagination, SearchBar],
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
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.formData = defaultFormData()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.disabled {
  cursor: not-allowed;
}
</style>
