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
                :disabled="hasUploadfile"
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
import { getDeployedHostsLists, getDeployedHostsByList, addDeployHosts, updateDeployHostsById } from '@/api/deploySettings'
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
      deployedData: [
        {
          'id': 2,
          'name': '74-clustrer-win',
          'disabled': false,
          'creator_id': 1,
          'create_at': '2021-08-19 09:18:19.787067',
          'update_at': '2021-08-19 09:18:19.787067',
          'cluster_name': 'local',
          'cluster_host': 'https://10.20.0.74:31443/k8s/clusters/local',
          'cluster_user': 'local',
          'application': [
            {
              id: 3,
              'tag': 'V1.0',
              'project_name': 'ui-create-test-case',
              'status': true,
              'namespace': '74-new-59'
            },
            {
              id: 4,
              'tag': 'V1.0',
              'project_name': 'ui-create-test-case',
              'status': null,
              'namespace': '74-new-60'
            }
          ]
        }
      ]
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
      return this.deployedData
      // return res.data.cluster
    },
    async fetchDeployedHostsByList(cluster_id) {
      const res = await getDeployedHostsByList(cluster_id)
      console.log(res)
      this.setFormData(res.data)
    },
    async updateDeployHostsById() {
      try {
        await updateDeployHostsById(this.editingId, this.updateFormData)
      } catch (err) {
        console.error(err)
      } finally {
        this.loadData()
      }
    },
    async addDeployHosts() {
      try {
        await addDeployHosts(this.updateFormData)
      } catch (err) {
        console.error(err)
      } finally {
        this.loadData()
      }
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
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
        const res = await this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        }).catch(() => {})
        if (res !== 'confirm') return
      }
      this.initFormData()
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
      console.log(formData)
      Object.assign(this.updatedFormData, formData)
    },
    handleSave() {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.disabled {
  pointer-events: none;
}
</style>
