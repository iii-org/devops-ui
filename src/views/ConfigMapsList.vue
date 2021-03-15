<script>
import { deleteConfigmap, getConfigmapList, updateConfigmapList } from '@/api/kubernetes'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

const formTemplate = () => ({
  name: '',
  configMaps: []
})

export default {
  name: 'ConfigMapsList',
  mixins: [MixinElTableWithAProject],
  data: () => ({
    editDialogVisible: false,
    form: formTemplate(),
    formRules: {
      name: [{ required: true, message: 'Please input name', trigger: 'blur' }]
    },
    isUpdating: false
  }),
  methods: {
    async fetchData() {
      const res = await getConfigmapList(this.selectedProjectId)
      return res.data.map(configMap => ({
        name: configMap.name,
        keys: Object.keys(configMap.data),
        configMaps: Object.entries(configMap.data).map(item => ({
          key: item[0],
          value: item[1],
          isDisabled: configMap.is_iii
        }))
      }))
    },
    async handleDelete(pId, configMapName) {
      this.listLoading = true
      try {
        await deleteConfigmap(pId, configMapName)
        await this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    showEditDialog(configMapName, configMaps) {
      this.editDialogVisible = true
      this.form.name = configMapName
      this.form.configMaps = configMaps.map(item => item)
    },
    closeEditDialog() {
      this.editDialogVisible = false
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = formTemplate()
      })
    },
    async editList() {
      const sendData = {
        configMaps: this.form.configMaps.reduce((result, cur) => Object.assign(result, { [cur.key]: cur.value }), {})
      }
      this.isUpdating = true
      const res = await updateConfigmapList(this.selectedProjectId, this.form.name, sendData)
      this.isUpdating = false
      this.closeEditDialog()
      this.loadData()
    },
    addItem() {
      this.form.configMaps.push({
        key: '',
        value: '',
        isDisabled: false
      })
    },
    removeItem(item) {
      const index = this.form.configMaps.indexOf(item)
      if (index !== -1) {
        this.form.configMaps.splice(index, 1)
      }
    }
  }
}
</script>

<template>
  <div class="table-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
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
    >
      <el-table-column :label="$t('general.Name')" header-align="center" prop="name">
        <template slot-scope="scope">
          <div class="font-weight-bold">{{ scope.row.name }}</div>
          <div class="text-caption">
            Keys：<span v-for="(key, keyIdx) in scope.row.keys" :key="keyIdx">
              {{ key }}
              <span v-if="keyIdx !== scope.row.keys.length - 1">/</span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="240">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.name, scope.row.configMaps)"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(selectedProjectId, scope.row.name)"
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
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog
      :title="`${$t('general.Edit')} Config Map`"
      :visible.sync="editDialogVisible"
      width="60%"
      @close="closeEditDialog"
    >
      <el-form ref="form" :rules="testCaseFormRules" :model="form">
        <el-form-item label="Config Map Name" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-row v-for="(configMap, configMapIdx) in form.configMaps" :key="configMap + configMapIdx" :gutter="12" type="flex">
          <el-col :span="6">
            <el-form-item
              :label="`key ${configMapIdx + 1} `"
              :prop="'configMaps.' + configMapIdx + '.key'"
              :rules="[{ required: true, message: `${$t('general.PleaseInput')} key`, trigger: 'blur' }]"
            >
              <el-input
                :id="`input-key${configMapIdx + 1}`"
                v-model="form.configMaps[configMapIdx].key"
                placeholder="key"
                :disabled="form.configMaps[configMapIdx].isDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item
              :label="`value ${configMapIdx + 1}`"
              :prop="'configMaps.' + configMapIdx + '.value'"
              :rules="[{ required: true, message: `${$t('general.PleaseInput')}  value`, trigger: 'blur' }]"
            >
              <el-input
                :id="`input-value${configMapIdx + 1}`"
                v-model="form.configMaps[configMapIdx].value"
                show-password
                placeholder="value"
                :disabled="form.configMaps[configMapIdx].isDisabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="3" style="padding-top: 45px">
            <el-button
              :id="`btn-delete${configMapIdx + 1}`"
              type="danger"
              size="small"
              :disabled="form.configMaps.length <= 1 || form.configMaps[configMapIdx].isDisabled"
              @click.prevent="removeItem(configMap)"
            >
              {{ $t('general.Delete') }}
            </el-button>
          </el-col>
        </el-row>
        <el-button id="btn-add-configMap-item" type="success" size="small" @click="addItem">
          <i class="el-icon-plus" /> {{ $t('Maintenance.AddConfigMap') }}
        </el-button>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="isUpdating" @click="closeEditDialog">
          {{ $t('general.Cancel') }}
        </el-button>
        <el-button type="primary" :loading="isUpdating" @click="editList">
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
