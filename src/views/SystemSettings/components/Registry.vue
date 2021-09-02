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
        <el-table-column type="expand" width="100">
          <template slot-scope="scope">
            <ul v-if="scope.row.application.length > 0">
              <li v-for="(item, index) in scope.row.application" :key="index" class="mb-5">
                <span class="mr-5">{{ item.project_name }}</span>
                <span class="mr-5">{{ item.tag }}</span>
                <el-tag :type="tagType(item.status)" effect="dark">{{ registryStatus(item.status) }}</el-tag>
              </li>
            </ul>
            <div v-else>{{ $t('SystemDeploySettings.NoImage') }}</div>
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
            <el-button size="mini" @click.stop="toggleUsage(scope.row)">
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
              <el-input v-model="form.name" />
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
import { getRegistryHostsLists, addRegistryHosts, updateRegistryHostsById } from '@/api/deploy'

export default {
  name: 'Registry',
  mixins: [BasicData],
  data() {
    return {
      showAddRegistryPage: false,
      updateStatus: 'UPDATE_PUT',
      editingId: 1,
      form: {
        type: 'harbor',
        description: '',
        insecure: true,
        name: '',
        disabled: false,
        url: '',
        account: '',
        password: ''
      },
      updatedFormData: {},
      originData: [],
      isSaved: false
    }
  },
  computed: {
    isRegistryFormChanged() {
      if (this.originData.length === 0) return false
      for (const key in this.form) {
        if (this.originData[key] !== this.form[key]) return true
      }
      return false
    }
  },
  methods: {
    async fetchData() {
      const res = await getRegistryHostsLists()
      return res.data.registries
    },
    async addRegistryHosts() {
      await addRegistryHosts(this.updatedFormData)
        .then(() => {
          this.loadData()
          this.showAddRegistryPage = false
          this.showUpdateMessage()
        })
        .catch((err) => {
          this.showAddRegistryPage = false
          console.error(err)
        })
    },
    async updateRegistryHostsById() {
      await updateRegistryHostsById(this.editingId, this.updatedFormData)
        .then(() => {
          this.loadData()
          this.showAddRegistryPage = false
          this.showUpdateMessage()
        })
        .catch((err) => {
          this.showAddRegistryPage = false
          console.error(err)
        })
    },
    async updateHostsDisabled(row) {
      const { name, disabled, url, access_key, access_secret, type, description } = row
      const registry_id = row.registries_id
      const data = { name, disabled, type, description, insecure: true, login_server: url, access_key, access_secret }
      await updateRegistryHostsById(registry_id, data)
        .then(() => {
          this.loadData()
          this.showUpdateMessage()
        })
        .catch((err) => {
          console.error(err)
        })
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
      this.updateHostsDisabled(row)
    },
    addRegistry() {
      this.initFormData()
      this.updateStatus = 'UPDATE_POST'
      this.showAddRegistryPage = true
    },
    async handleBackPage() {
      if (this.isRegistryFormChanged) {
        if (this.isSaved) return
        const res = await this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        }).catch(() => {})
        if (res !== 'confirm') return
      }
      this.initFormData()
      this.isSaved = false
      this.showAddRegistryPage = false
    },
    initFormData() {
      this.form = {
        type: 'harbor',
        description: '',
        insecure: true,
        name: '',
        disabled: false,
        url: '',
        account: '',
        password: ''
      }
    },
    rowClicked(row) {
      this.editingId = row.registries_id
      this.isSaved = false
      this.setFormData(row)
      this.updateStatus = 'UPDATE_PUT'
      this.showAddRegistryPage = true
    },
    setFormData(rowData) {
      const { name, disabled, type, description, url, access_key, access_secret } = rowData
      this.form.name = name
      this.form.disabled = disabled
      this.form.url = url
      this.form.account = access_key
      // this.form.password = access_secret
      this.form.type = type
      this.form.description = description
      this.setOriginData(this.form)
    },
    getUpdateFormData() {
      const formData = {}
      formData.name = this.form.name
      formData.access_key = this.form.account
      formData.access_secret = this.form.password
      formData.type = this.form.type
      formData.login_server = this.form.url
      formData.description = this.form.description
      formData.insecure = this.form.insecure
      formData.disabled = this.form.disabled
      Object.assign(this.updatedFormData, formData)
    },
    handleSave() {
      this.isSaved = true
      this.getUpdateFormData()
      if (this.updatedFormData.access_secret === '') {
        this.showFailUpdateMessage()
        return
      }

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
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('SystemDeploySettings.RegistryMessage'),
        type: 'success'
      })
    },
    showFailUpdateMessage() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('SystemDeploySettings.FailMessage'),
        type: 'warning'
      })
    },
    registryStatus(status) {
      switch (status) {
        case 'Initializing':
          return this.$t('SystemDeploySettings.Initializing')
        case 'Start Image replication':
          return this.$t('SystemDeploySettings.StartReplication')
        case 'Finish Image replication':
          return this.$t('SystemDeploySettings.Finished')
        case 'Error, No Image need to be replicated':
          return this.$t('general.Error')
      }
    },
    tagType(status) {
      switch (status) {
        case 'Initializing':
          return 'info'
        case 'Start Image replication':
          return 'warning'
        case 'Finish Image replication':
          return 'success'
        case 'Error, No Image need to be replicated':
          return 'danger'
      }
    }
  }
}
</script>
