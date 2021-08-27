<template>
  <div class="app-container">
    <template v-if="!showAddClusterPage">
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
            <el-form-item :label="$t('SystemDeploySettings.ClusterName')">
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
              <IssueFileUploader
                ref="IssueFileUploader"
                style="margin-bottom: 40px;"
                :class="{disabled: disabled}"
                @hasFileList="hasFileList"
              />
              <el-input
                v-model="form.kubeConfigFile"
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

export default {
  name: 'Cluster',
  components: { IssueFileUploader: () => import('@/views/Project/IssueDetail/components/IssueFileUploader') },
  mixins: [BasicData],
  data() {
    return {
      showAddClusterPage: false,
      updateStatus: 'UPDATE_PUT',
      form: {
        clusterName: '',
        disabled: false,
        kubeConfigFile: ''
      },
      editingId: 1,
      hasUploadfile: false,
      updatedFormData: {},
      originData: [],
      isSaved: false
    }
  },
  computed: {
    disabled() {
      return !!this.form.kubeConfigFile
    },
    isFormDataChanged() {
      if (this.originData.length === 0) return false
      for (const key in this.form) {
        if (this.originData[key] !== this.form[key]) return true
      }
      return false
    }
  },
  watch: {
    isFormDataChanged(val) {
      this.$emit('isClusterFormChanged', val)
    }
  },
  methods: {
    async fetchData() {
      const res = await getDeployedHostsLists()
      return res.data.cluster
    },
    async fetchDeployedHostsByList(cluster_id) {
      const res = await getDeployedHostsByList(cluster_id)
      this.setFormData(res.data)
    },
    async updateDeployHostsById() {
      await updateDeployHostsById(this.editingId, this.updatedFormData)
        .then(() => {
          this.loadData()
          this.showAddClusterPage = false
          this.showUpdateMessage()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async addDeployHosts() {
      await addDeployHosts(this.updatedFormData)
        .then(() => {
          this.loadData()
          this.showAddClusterPage = false
          this.showUpdateMessage()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async updateHostsDisabled(row) {
      const { name, disabled } = row
      const cluster_id = row.id
      const data = { name, disabled, k8s_config_file: '' }

      await updateDeployHostsById(cluster_id, data)
        .then(() => {
          this.loadData()
          this.showUpdateMessage()
        })
        .catch(err => {
          console.error(err)
        })
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
      this.fetchDeployedHostsByList(row.id)
      this.updateStatus = 'UPDATE_PUT'
      this.showAddClusterPage = true
    },
    setFormData(data) {
      const { name, disabled } = data
      this.form.clusterName = name
      this.form.disabled = disabled
      this.setOriginData(this.form)
    },
    addCluster() {
      this.initFormData()
      this.updateStatus = 'UPDATE_POST'
      this.showAddClusterPage = true
    },
    async handleBackPage() {
      if (this.isFormDataChanged) {
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
      this.hasUploadfile = false
      this.showAddClusterPage = false
    },
    initFormData() {
      this.form = {
        clusterName: '',
        disabled: false,
        kubeConfigFile: ''
      }
    },
    hasFileList(val) {
      this.form.kubeConfigFile = ''
      this.hasUploadfile = val
    },
    getUpdateFormData() {
      const formData = {}
      formData.name = this.form.clusterName
      formData.disabled = this.form.disabled
      formData.k8s_config_file = this.hasUploadfile ? this.hasUploadfile : this.form.kubeConfigFile
      Object.assign(this.updatedFormData, formData)
    },
    handleSave() {
      this.isSaved = true
      this.getUpdateFormData()
      switch (this.updateStatus) {
        case 'UPDATE_PUT':
          this.updateDeployHostsById()
          break
        case 'UPDATE_POST':
          this.addDeployHosts()
      }
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('SystemDeploySettings.ClusterMessage'),
        type: 'success'
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
