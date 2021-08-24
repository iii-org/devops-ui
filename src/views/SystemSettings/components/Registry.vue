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
        <el-table-column type="expand">
          <template slot-scope="scope">
            <ul v-if="scope.row.application">
              <li v-for="(item, index) in scope.row.application" :key="index" class="mb-5">
                <span class="mr-5">{{ item.project_name }}</span>
                <span class="mr-5">{{ item.tag }}</span>
                <span>{{ item.status }}</span>
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('SystemDeploySettings.ImpressionFileRepo')" prop="name" />
        <el-table-column align="center" label="URL">
          <template slot-scope="scope">
            <el-link type="primary" target="_blank" :href="scope.row.url">
              {{ scope.row.url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('SystemDeploySettings.Status')" width="100">
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
            <el-form-item :label="$t('SystemDeploySettings.RegistryName')">
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
            <el-form-item :label="$t('general.Account')">
              <el-input v-model="form.account" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="13">
            <el-form-item :label="$t('general.Password')">
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
import { getRegistryHostsLists, addRegistryHosts, updateRegistryHostsById } from '@/api/deploySettings'

export default {
  name: 'Registry',
  mixins: [BasicData],
  data() {
    return {
      showAddRegistryPage: false,
      updateStatus: 'UPDATE_PUT',
      editingId: 1,
      form: {
        registryName: '',
        disabled: false,
        url: '',
        account: '',
        password: ''
      },
      updatedFormData: {},
      originData: []
    }
  },
  computed: {
    isFormDataChanged() {
      if (this.originData.length === 0) return false
      for (const key in this.form) {
        console.log(key)
        if (this.originData[key] !== this.form[key]) return true
      }
      return false
    }
  },
  methods: {
    async fetchData() {
      const res = await getRegistryHostsLists()
      console.log(res)
      return res.data
    },
    async addRegistryHosts() {
      try {
        await addRegistryHosts(this.updatedFormData)
      } catch (err) {
        console.error(err)
      } finally {
        this.loadData()
      }
    },
    async updateRegistryHostsById() {
      try {
        await updateRegistryHostsById(this.editingId, this.updatedFormData)
      } catch (err) {
        console.error(err)
      } finally {
        this.loadData()
      }
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
    },
    addRegistry() {
      this.initFormData()
      this.updateStatus = 'UPDATE_POST'
      this.showAddRegistryPage = true
    },
    handleBackPage() {
      this.initFormData()
      this.showAddRegistryPage = false
    },
    initFormData() {
      this.form = {
        registryName: '',
        disabled: false,
        url: '',
        status: '',
        account: '',
        password: ''
      }
    },
    rowClicked(row) {
      this.editingId = row.id
      this.setFormData(row)
      this.updateStatus = 'UPDATE_PUT'
      this.showAddRegistryPage = true
    },
    setFormData(rowData) {
      const { name, disabled, url, credential, status, type, description, insecure } = rowData
      this.form.registryName = name
      this.form.disabled = status === 'healthy'
      // this.form.status = status === 'healthy'
      this.form.url = url
      this.form.account = credential.access_key
      this.form.password = credential.access_secret
      this.form.type = type
      this.form.description = description
      this.form.insecure = insecure
      this.setOriginData(this.form)
    },
    getUpdateFormData() {
      const formData = {}
      formData.name = this.form.registryName
      formData.type = this.form.type
      formData.access_key = this.form.account
      formData.access_secret = this.form.password
      formData.login_server = this.form.url
      formData.description = this.form.description
      formData.insecure = this.form.insecure
      Object.assign(this.updatedFormData, formData)
    },
    handleSave() {
      this.getUpdateFormData()
      switch (this.updateStatus) {
        case 'UPDATE_PUT':
          this.updateRegistryHostsById()
          break
        case 'UPDATE_POST':
          this.addRegistryHosts()
      }
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    isFormDataChanged() {
      for (const key in this.form) {
        console.log(key)
        if (this.originData[key] !== this.form[key]) return true
      }
      return false
    }
  }
}
</script>
