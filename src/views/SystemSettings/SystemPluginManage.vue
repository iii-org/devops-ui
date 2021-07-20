<template>
  <el-row v-loading="isLoading" class="app-container">
    <el-col>
      <el-row type="flex" justify="space-between">
        <el-button type="success" icon="el-icon-plus" @click="handleAddClick">{{ $t('System.AddPlugin') }}</el-button>
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          prefix-icon="el-icon-search"
          style="width: 250px"
        />
      </el-row>
      <el-divider />
      <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit>
        <el-table-column :label="$t('general.Name')" align="center" prop="name" />
        <el-table-column :label="$t('general.Status')" align="center" prop="disabled">
          <template slot-scope="scope">
            <el-tag :type="scope.row.disabled ? 'danger' : 'success'">{{
              scope.row.disabled ? $t('general.Disable') : $t('general.Enable')
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column-time prop="create_at" min-width="200" />
        <el-table-column :label="$t('general.Actions')" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEditClick(scope.row.name)">
              {{ $t('general.Edit') }}
            </el-button>
            <el-popconfirm
              :confirm-button-text="$t('general.Remove')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              :title="$t('Member.confirmRemove')"
              @onConfirm="handleDelete(scope.row.name)"
            >
              <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete">
                {{ $t('general.Remove') }}
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
    </el-col>

    <el-dialog v-if="isDialogVisible" :title="dialogTitle" :visible.sync="isDialogVisible" width="50vw" top="3vh" destroy-on-close @close="handleClose">
      <el-form ref="form" :model="form" :rules="formRules" label-position="top">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item :label="$t('general.Name')" prop="name">
              <el-input v-model="form.name" :placeholder="$t('general.PleaseInput') + $t('general.Name')" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('general.Disable')" prop="disabled">
              <el-switch v-model="form.disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(param, paramIdx) in form.arguments" :key="paramIdx" :gutter="12">
          <el-col :span="13">
            <el-form-item
              class="text-gray-500"
              :label="$t(`Plugins.${form.name}.${param.key}.title`)"
              :prop="'arguments.' + paramIdx + '.value'"
              :rules="[{ required: true, message: $t(`Plugins.${form.name}.${param.key}.placeholder`), trigger: 'blur' }]"
            >
              <el-input v-model="form.arguments[paramIdx].value" show-password :placeholder="$t(`Plugins.${form.name}.${param.key}.placeholder`)" />
            </el-form-item>
          </el-col>
          <el-col :span="3" style="padding-top: 45px">
            <el-button type="danger" size="small" @click.prevent="removeItem(param)">
              {{ $t('general.Delete') }}
            </el-button>
          </el-col>
        </el-row>
        <div class="my-2">
          <el-button type="success" size="small" icon="el-icon-plus" @click="addItem">
            {{ $t('System.AddParams') }}
          </el-button>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" @click="handleConfirm">{{ $t('general.Confirm') }}</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import i18n from '@/lang'
import { getPlugins, getPluginDetails, updatePlugin, addPlugin, deletePlugin } from '@/api/systemPlugin'
import { BasicData, SearchBar, Pagination } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'

const formTemplate = () => ({
  name: '',
  disabled: false,
  arguments: [{ key: '', title: '', type: '', value: '' }]
})

export default {
  name: 'SystemPluginManage',
  components: { ElTableColumnTime },
  mixins: [BasicData, SearchBar, Pagination],
  data() {
    return {
      isLoading: false,
      isAddPlugin: true,
      isDialogVisible: false,
      form: formTemplate(),
      formRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isAddPlugin ? `${i18n.t('general.Add')} Plugins` : `${i18n.t('general.Edit')} Plugins`
    }
  },
  methods: {
    async fetchData() {
      const res = await getPlugins()
      return res.data
    },
    async handleAddClick() {
      this.isAddPlugin = true
      this.isDialogVisible = true
    },
    async handleEditClick(pluginName) {
      this.isAddPlugin = false
      this.isLoading = true
      const res = await getPluginDetails(pluginName)
      const { name, disabled } = res.data
      Object.assign(this.form, { name, disabled, arguments: res.data.arguments })
      this.isLoading = false
      this.isDialogVisible = true
    },
    handleClose() {
      // this.$nextTick(() => {
      //   this.$refs['form'].resetFields()
      //   this.form = formTemplate()
      // })
      this.isDialogVisible = false
    },
    handleConfirm() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const sendData = Object.assign({}, this.form)
          delete sendData.name
          sendData.arguments = this.form.arguments.reduce(
            (result, cur) => Object.assign(result, { [cur.key]: cur.value }),
            {}
          )
          await this.isAddPlugin ? await addPlugin(this.form.name, sendData) : await updatePlugin(this.form.name, sendData)
          this.handleClose()
          this.loadData()
        }
      })
    },
    handleDelete(pluginName) {
      this.isLoading = true
      deletePlugin(pluginName)
        .then(() => {
          this.$message({
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error'
          })
        })
        .then(() => {
          this.loadData()
          this.isLoading = false
        })
    },
    addItem() {
      this.form.arguments.push({ key: '', title: '', type: '', value: '' })
    },
    removeItem(item) {
      const index = this.form.arguments.indexOf(item)
      if (index !== -1) {
        this.form.arguments.splice(index, 1)
      }
    }
  }
}
</script>
