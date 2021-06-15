<template>
  <el-row v-loading="isLoading" class="app-container">
    <el-col>
      <el-row type="flex" justify="space-between">
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">{{ $t('System.AddPlugin') }}</el-button>
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
        <el-table-column :label="$t('general.Type')" align="center" prop="type_id">
          <template slot-scope="scope">
            {{ mapTypeName(scope.row.type_id) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Status')" align="center" prop="disabled">
          <template slot-scope="scope">
            <el-tag :type="scope.row.disabled ? 'danger' : 'success'">{{
              scope.row.disabled ? $t('general.Disable') : $t('general.Enable')
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column-time prop="create_at" width="180" />
        <el-table-column :label="$t('general.Actions')" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row.id)">
              {{ $t('general.Edit') }}
            </el-button>
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

    <el-dialog :title="dialogTitle" :visible.sync="isDialogVisible" width="50%" top="3vh" @close="handleClose">
      <el-form ref="form" :model="form" :rules="formRules" label-position="top">
        <el-row :gutter="12">
          <el-col :span="18">
            <el-form-item :label="$t('general.Name')" prop="name">
              <el-input v-model="form.name" :placeholder="$t('general.PleaseInput') + $t('general.Name')" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="$t('general.Type')">
              <el-select v-model="form.type_id" :disabled="!isAddPlugin">
                <el-option
                  v-for="option in pluginOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(param, paramIdx) in form.parameter" :key="paramIdx" :gutter="12">
          <el-col :span="6">
            <el-form-item
              :label="`key ${paramIdx + 1} `"
              :prop="'parameter.' + paramIdx + '.key'"
              :rules="[{ required: true, message: $t('general.PleaseInput') + 'key', trigger: 'blur' }]"
            >
              <el-input v-model="form.parameter[paramIdx].key" placeholder="key" />
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item
              :label="`value ${paramIdx + 1} `"
              :prop="'parameter.' + paramIdx + '.value'"
              :rules="[{ required: true, message: $t('general.PleaseInput') + 'value', trigger: 'blur' }]"
            >
              <el-input v-model="form.parameter[paramIdx].value" show-password placeholder="value" />
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
        <el-row>
          <el-col>
            <el-form-item :label="$t('general.Disable')" prop="disabled">
              <el-switch v-model="form.disabled" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { getPlugins, getPluginDetails, updatePlugin, addPlugin } from '@/api/systemPlugin'
import { BasicData, SearchBar, Pagination } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'

const formTemplate = () => ({
  name: '',
  type_id: 1,
  disabled: false,
  parameter: [{ key: '', value: '' }]
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
      },
      pluginOptions: [
        {
          value: 1,
          label: 'System'
        },
        {
          value: 2,
          label: 'Pipeline'
        }
      ]
    }
  },
  computed: {
    dialogTitle() {
      return this.isAddPlugin ? i18n.t('general.Add') + 'Plugins' : i18n.t('general.Add') + 'Plugins'
    }
  },
  methods: {
    async fetchData() {
      const res = await getPlugins()
      return res.data.plugin_list
    },
    async handleAdd() {
      this.isAddPlugin = true
      this.isDialogVisible = true
    },
    async handleEdit(pluginId) {
      this.isAddPlugin = false
      this.isLoading = true
      const res = await getPluginDetails(pluginId)
      const { name, disabled, id, parameter, type_id } = res.data
      Object.assign(this.form, { name, disabled, id, parameter: Object.entries(parameter).map(item => ({
        key: item[0],
        value: item[1]
      })), type_id })
      this.isLoading = false
      this.isDialogVisible = true
    },
    mapTypeName(id) {
      const typeName = { 1: 'System', 2: 'Pipeline' }
      return typeName[id]
    },
    handleClose() {
      this.isDialogVisible = false
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = formTemplate()
      })
    },
    async handleConfirm() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const sendData = Object.assign({}, this.form)
          sendData.parameter = this.form.parameter.reduce((result, cur) => Object.assign(result, { [cur.key]: cur.value }), {})
          this.isAddPlugin ? await addPlugin(this.form.id, sendData) : await updatePlugin(this.form.id, sendData)
          this.handleClose()
          this.loadData()
        }
      })
    },
    addItem() {
      this.form.parameter.push({ key: '', value: '' })
    },
    removeItem(item) {
      const index = this.form.parameter.indexOf(item)
      if (index !== -1) { this.form.parameter.splice(index, 1) }
    }
  }
}
</script>
