<template>
  <el-row class="app-container">
    <el-col>
      <project-list-selector>
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          prefix-icon="el-icon-search"
          style="width: 250px"
        />
      </project-list-selector>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        height="calc(100vh - 300px)"
        fit
      >
        <el-table-column
          :label="$t('general.Name')"
          header-align="center"
          prop="name"
        >
          <template slot-scope="scope">
            <div class="font-bold">{{ scope.row.name }}</div>
            <div class="text-xs">
              Keys：<span
                v-for="(key, keyIdx) in scope.row.keys"
                :key="keyIdx"
              >
                {{ key }}
                <span v-if="keyIdx !== scope.row.keys.length - 1">/</span>
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('general.Actions')"
          align="center"
          width="240"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.name, scope.row.secrets)"
            >
              {{ $t('general.Edit') }}
            </el-button>
            <el-popconfirm
              confirm-button-text="Delete"
              cancel-button-text="Cancel"
              icon="el-icon-info"
              icon-color="red"
              title="Are you sure?"
              @confirm="handleDelete(selectedProjectId, scope.row.name)"
            >
              <el-button
                slot="reference"
                size="mini"
                type="danger"
                icon="el-icon-delete"
                :disabled="scope.row.secrets.map(item => item.isDisabled).includes(true)"
              >
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
        :title="`${$t('general.Edit')} Secret`"
        :visible.sync="editDialogVisible"
        width="60%"
        @close="closeEditDialog"
      >
        <el-form
          ref="form"
          :rules="formRules"
          :model="form"
        >
          <el-form-item label="Secret Name">
            <el-input
              v-model="form.name"
              autocomplete="off"
            />
          </el-form-item>
          <el-row
            v-for="(secret, secretIdx) in form.secrets"
            :key="secret + secretIdx"
            :gutter="12"
            type="flex"
          >
            <el-col :span="6">
              <el-form-item
                :label="`key ${secretIdx + 1} `"
                :prop="'secrets.' + secretIdx + '.key'"
                :rules="[{ required: true, message: `${$t('general.PleaseInput')} key`, trigger: 'blur' }]"
              >
                <el-input
                  :id="`input-key${secretIdx + 1}`"
                  v-model="form.secrets[secretIdx].key"
                  placeholder="key"
                  :disabled="form.secrets[secretIdx].isDisabled"
                />
              </el-form-item>
            </el-col>
            <el-col :span="15">
              <el-form-item
                :label="`value ${secretIdx + 1}`"
                :prop="'secrets.' + secretIdx + '.value'"
                :rules="[{ required: true, message: `${$t('general.PleaseInput')}  value`, trigger: 'blur' }]"
              >
                <el-input
                  :id="`input-value${secretIdx + 1}`"
                  v-model="form.secrets[secretIdx].value"
                  show-password
                  placeholder="value"
                  :disabled="form.secrets[secretIdx].isDisabled"
                />
              </el-form-item>
            </el-col>
            <el-col
              :span="3"
              style="padding-top: 45px"
            >
              <el-button
                :id="`btn-delete${secretIdx + 1}`"
                type="danger"
                size="small"
                :disabled="form.secrets.length <= 1 || form.secrets[secretIdx].isDisabled"
                @click.prevent="removeItem(secret)"
              >
                {{ $t('general.Delete') }}
              </el-button>
            </el-col>
          </el-row>
          <el-button
            id="btn-add-secret-item"
            type="success"
            size="small"
            @click="addItem"
          >
            <em class="el-icon-plus" /> {{ $t('Maintenance.AddSecret') }}
          </el-button>
        </el-form>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            :loading="isUpdating"
            @click="closeEditDialog"
          >
            {{ $t('general.Cancel') }}
          </el-button>
          <el-button
            type="primary"
            :loading="isUpdating"
            @click="editSecretList"
          >
            {{ $t('general.Confirm') }}
          </el-button>
        </span>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import { deleteSecret, getSecretList, updateSecretList } from '@/api/kubernetes'
import { BasicData, SearchBar, Pagination, Table, ProjectSelector } from '@/newMixins'

const formTemplate = () => ({
  name: '',
  secrets: []
})

export default {
  name: 'SecretList',
  mixins: [BasicData, SearchBar, Pagination, Table, ProjectSelector],
  data() {
    return {
      editDialogVisible: false,
      form: formTemplate(),
      formRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }]
      },
      isUpdating: false
    }
  },
  methods: {
    async fetchData() {
      const res = await getSecretList(this.selectedProjectId)
      return res.data.map((secret) => ({
        name: secret.name,
        keys: Object.keys(secret.data),
        secrets: Object.entries(secret.data).map((item) => ({
          key: item[0],
          value: item[1],
          isDisabled: secret.is_iii
        }))
      }))
    },
    showEditDialog(secretName, secrets) {
      this.editDialogVisible = true
      this.form.name = secretName
      this.form.secrets = secrets.map((item) => item)
    },
    closeEditDialog() {
      this.editDialogVisible = false
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = formTemplate()
      })
    },
    async editSecretList() {
      const sendData = {
        secrets: this.form.secrets.reduce((result, cur) => Object.assign(result, { [cur.key]: cur.value }), {})
      }
      this.isUpdating = true
      const res = await updateSecretList(this.selectedProjectId, this.form.name, sendData)
      this.isUpdating = false
      this.closeEditDialog()
      this.loadData()
    },
    async handleDelete(pId, secretName) {
      this.listLoading = true
      try {
        await deleteSecret(pId, secretName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    addItem() {
      this.form.secrets.push({
        key: '',
        value: '',
        isDisabled: false
      })
    },
    removeItem(item) {
      const index = this.form.secrets.indexOf(item)
      if (index !== -1) {
        this.form.secrets.splice(index, 1)
      }
    }
  }
}
</script>
