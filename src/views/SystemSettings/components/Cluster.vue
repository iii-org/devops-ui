<template>
  <div class="app-container">
    <template v-if="!showAddPage">
      <div class="text-right">
        <el-button type="success" @click="addCluster">+ {{ $t('general.Add') }}</el-button>
      </div>
      <el-divider />
      <el-table
        ref="tableData"
        v-loading="listLoading"
        class="cursor-pointer"
        :element-loading-text="$t('Loading')"
        :data="listData"
        :tree-props="{children: 'application', hasChildren: 'hasChildren'}"
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
                <el-tag :type="tagType(item.status)" effect="dark">{{ clusterStatus(item.status) }}</el-tag>
              </li>
            </ul>
            <div v-else>{{ $t('SystemDeploySettings.NoService') }}</div>
          </template>
        </el-table-column>
        <el-table-column type="index" align="center" :label="$t('SystemDeploySettings.Index')" width="100" />
        <el-table-column align="center" :label="$t('SystemDeploySettings.RemoteDeploymentEnvironment')" width="150" prop="name" />
        <el-table-column align="center" :label="$t('SystemDeploySettings.ClusterName')" prop="cluster_name" width="150" />
        <el-table-column align="center" label="URL" width="300">
          <template slot-scope="scope">
            <el-link type="primary" target="_blank" :href="scope.row.cluster_host">
              {{ scope.row.cluster_host }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('SystemDeploySettings.Account')" prop="cluster_user" width="100" />
        <el-table-column align="center" :label="$t('SystemDeploySettings.LastUpdateTime')" width="200">
          <template slot-scope="scope">
            {{ handleLastUpdateTime(scope.row.update_at) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('SystemDeploySettings.Status')">
          <template slot-scope="scope">
            <el-tag :type="scope.row.disabled ? 'danger' : 'success'">
              {{ scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('SystemDeploySettings.Actions')" width="140">
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
            <el-form-item :label="$t('SystemDeploySettings.ClusterName')" required>
              <el-input v-model="form.clusterName" />
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
            <el-form-item label="KubeConfig File">
              <ClusterFileUploader
                ref="ClusterFileUploader"
                style="margin-bottom: 40px;"
                :disabled="disabled"
                :class="{disabled: disabled}"
                @hasFileList="hasFileList"
              />
              <el-input
                v-model="form.kubeConfigString"
                :disabled="!!hasUploadfile"
                type="textarea"
                :placeholder="$t('SystemDeploySettings.KubeConfigTextareaHint')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </template>
  </div>
</template>

<script>
import { getDeployedHostsLists, getDeployedHostsByList, addDeployHosts, updateDeployHostsById } from '@/api/deploy'
import { BasicData } from '@/newMixins'

const formData = () => ({
  clusterName: '',
  disabled: false,
  kubeConfigString: null
})

export default {
  name: 'Cluster',
  components: { ClusterFileUploader: () => import('@/views/Project/IssueDetail/components/ClusterFileUploader') },
  mixins: [BasicData],
  data() {
    return {
      showAddPage: false,
      updateStatus: 'UPDATE_INIT',
      editingId: 1,
      hasUploadfile: false,
      isSaved: false,
      form: formData(),
      origin: {}
    }
  },
  computed: {
    disabled() {
      return !!this.form.kubeConfigString
    },
    isFormChanged() {
      if (this.origin.length === 0) return false
      for (const key in this.form) {
        if (this.origin[key] !== this.form[key]) return true
      }
      return false
    }
  },
  methods: {
    async fetchData() {
      const res = await getDeployedHostsLists()
      this.initData()
      return res.data.cluster
    },
    async fetchDeployedHostsByList(cluster_id) {
      const res = await getDeployedHostsByList(cluster_id)
      this.setFormData(res.data)
    },
    async updateDeployHostsById(formData, cluster_id) {
      const id = cluster_id || this.editingId
      await updateDeployHostsById(id, formData)
        .then(() => {
          this.loadData()
          this.initClusterTab()
          this.showUpdateMessage()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async addDeployHosts(formData) {
      await addDeployHosts(formData)
        .then(() => {
          this.loadData()
          this.initClusterTab()
          this.showUpdateMessage()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async updateHostsDisabled(row) {
      const { name, disabled } = row
      const cluster_id = row.id
      const formData = new FormData()
      const params = ['name', 'disabled', 'k8s_config_file', 'k8s_config_string']
      params.forEach(param => formData.delete(param))
      formData.append('name', name)
      formData.append('disabled', disabled)
      this.updateDeployHostsById(formData, cluster_id)
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
      this.updateHostsDisabled(row)
    },
    handleLastUpdateTime(time) {
      const date = new Date(time)
      const hours = date.getHours()
      date.setHours(hours + 8)
      return this.$dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    rowClicked(row) {
      this.editingId = row.id
      this.isSaved = false
      this.fetchDeployedHostsByList(row.id)
      this.updateStatus = 'UPDATE_PUT'
      this.showAddPage = true
    },
    setFormData(data) {
      const { name, disabled } = data
      this.form.clusterName = name
      this.form.disabled = disabled
      this.setOriginData(this.form)
    },
    addCluster() {
      this.initData()
      this.updateStatus = 'UPDATE_POST'
      this.showAddPage = true
    },
    async handleBackPage() {
      const confirm_options = {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      }
      if (this.isFormChanged && !this.isSaved) {
        const res = await this.$confirm(
          this.$t('Notify.UnSavedChanges'),
          this.$t('general.Warning'),
          confirm_options).catch(() => {})
        if (res !== 'confirm') return
      }
      this.initClusterTab()
    },
    initClusterTab() {
      this.initData()
      this.isSaved = false
      this.showAddPage = false
      this.hasUploadfile = false
    },
    initData() {
      console.log(this.$options.data().form)
      this.form = formData()
      this.setOriginData(this.form)
    },
    hasFileList(val) {
      this.form.kubeConfigString = null
      this.hasUploadfile = val
    },
    getUpdateFormData() {
      const formData = new FormData()
      const encodedData = btoa(this.form.kubeConfigString)
      const params = ['name', 'disabled', 'k8s_config_file', 'k8s_config_string']
      params.forEach(param => formData.delete(param))
      formData.append('name', this.form.clusterName)
      formData.append('disabled', this.form.disabled)
      if (this.hasUploadfile) formData.append('k8s_config_file', this.hasUploadfile)
      if (this.form.kubeConfigString) formData.append('k8s_config_string', encodedData)
      return formData
    },
    handleSave() {
      if (!this.form.clusterName) {
        this.showNoNameWarning()
        return
      }
      this.isSaved = true
      const formData = this.getUpdateFormData()
      this.updateData(formData)
    },
    updateData(formData) {
      switch (this.updateStatus) {
        case 'UPDATE_PUT':
          this.updateDeployHostsById(formData)
          break
        case 'UPDATE_POST':
          this.addDeployHosts(formData)
      }
    },
    setOriginData(data) {
      this.origin = JSON.parse(JSON.stringify(data))
    },
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('SystemDeploySettings.ClusterMessage'),
        type: 'success'
      })
    },
    showNoNameWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('SystemDeploySettings.NoNameWarning'),
        type: 'warning'
      })
    },
    clusterStatus(status) {
      switch (status) {
        case 'Initializing':
          return this.$t('SystemDeploySettings.Initializing')
        case 'Start Kubernetes deployment':
          return this.$t('SystemDeploySettings.StartDeployment')
        case 'Finish Kubernetes deployment':
          return this.$t('SystemDeploySettings.Finished')
        case 'Error, No Image need to be replicated':
          return this.$t('general.Error')
      }
    },
    tagType(status) {
      switch (status) {
        case 'Initializing':
          return 'info'
        case 'Start Kubernetes deployment':
          return 'warning'
        case 'Finish Kubernetes deployment':
          return 'success'
        case 'Error, No Image need to be replicated':
          return 'danger'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.disabled {
  pointer-events: none;
}
</style>
