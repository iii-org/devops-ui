<template>
  <div class="app-container">
    <template v-if="!showAddRegistryPage">
      <div class="text-right">
        <el-button type="success" @click="addRegistry">+ {{ $t('general.Add') }}</el-button>
      </div>
      <el-divider />
      <el-table
        ref="tableData"
        v-loading="listLoading"
        class="cursor-pointer"
        :element-loading-text="$t('Loading')"
        :data="listData"
        border
        fit
        @row-click="rowClicked"
      >
        <el-table-column align="center" label="印象檔儲存庫" width="150" prop="name" />
        <el-table-column align="center" label="URL" width="300">
          <template slot-scope="scope">
            <el-link type="primary" target="_blank" :href="scope.row.url">
              {{ scope.row.url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('SystemDeploySettings.Status')">
          <template slot-scope="scope">
            <el-tag :type="scope.row.disabled ? 'danger' : 'success'">
              {{ scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('SystemDeploySettings.Actions')" width="120">
          <template slot-scope="scope">
            <el-button size="mini" @click="toggleUsage(scope.row)">
              <div class="flex items-center">
                <span class="dot" :class="scope.row.disabled ? 'bg-success' : 'bg-danger'" />
                <span class="ml-2" :class="scope.row.disabled ? 'text-success' : 'text-danger'">
                  {{ !scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
                </span>
              </div>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template v-else>
      <div class="flex justify-between">
        <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous" @click="handleBackPage">
          {{ $t('general.Back') }}
        </el-button>
        <el-button type="success" @click="handleSave">{{ $t('general.Save') }}</el-button>
      </div>
      <el-divider />
      <el-form ref="form" :model="form" label-width="120px" size="medium">
        <el-row :gutter="10">
          <el-col :span="24" :sm="13">
            <el-form-item label="Registry 名稱">
              <el-input v-model="form.registryName" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="24" class="mb-5">
            <el-form-item :label="$t('general.Status')">
              <el-radio-group v-model="form.disabled">
                <el-radio :label="false">{{ $t('general.Enable') }}</el-radio>
                <el-radio :label="true">{{ $t('general.Disable') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="13">
            <el-form-item label="URL">
              <el-input v-model="form.url" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="13">
            <el-form-item label="帳號">
              <el-input v-model="form.account" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="13">
            <el-form-item label="密碼">
              <el-input v-model="form.password" show-password />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </template>
  </div>
</template>

<script>
import { BasicData } from '@/newMixins'
import { getRegistryHostsLists } from '@/api/deploySettings'

export default {
  name: 'Registry',
  mixins: [BasicData],
  data() {
    return {
      showAddRegistryPage: false,
      form: {
        registryName: '',
        disabled: false,
        url: '',
        account: 'xxxxxxx',
        password: 'yyyyyyyy'
      }
    }
  },
  methods: {
    async fetchData() {
      const res = await getRegistryHostsLists()
      console.log(res)
      return res.data
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
    },
    addRegistry() {
      this.showAddRegistryPage = true
    },
    handleBackPage() {
      this.showAddRegistryPage = false
    },
    rowClicked(row) {
      this.setFormData(row)
      this.showAddRegistryPage = true
    },
    setFormData(rowData) {
      const { name, disabled, url } = rowData
      this.form.registryName = name
      this.form.disabled = disabled
      this.form.url = url
    }
  }
}
</script>
