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
        border
        fit
        @row-click="rowClicked"
      >
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
                :class="{disabled: hasKubeConfig}"
                :disabled="hasKubeConfig"
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
import { getDeployedHostsLists, getDeployedHostsByList } from '@/api/deploySettings'
import { BasicData } from '@/newMixins'

export default {
  name: 'Cluster',
  components: { IssueFileUploader: () => import('@/views/Project/IssueDetail/components/IssueFileUploader') },
  mixins: [BasicData],
  data() {
    return {
      showAddClusterPage: false,
      form: {
        clusterName: '',
        disabled: false,
        kubeConfigFile: ''
      },
      deployedData: {
        'cluster': {
          'id': 10,
          'name': 'Endpoint 74',
          'disabled': false,
          'creator_id': 1,
          'create_at': '2021-08-12 22:03:44.505271',
          'update_at': '2021-08-12 22:03:44.505271'
        },
        'K8s_Config': {
          'apiVersion': 'v1',
          'kind': 'Config',
          'clusters': [
            {
              'name': 'local',
              'cluster': {
                'server': 'https://10.20.0.74:31443/k8s/clusters/local',
                'certificate-authority-data': 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJoekNDQVM2Z0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQTdNUnd3R2dZRFZRUUtFeE5rZVc1aGJXbGoKYkdsemRHVnVaWEl0YjNKbk1Sc3dHUVlEVlFRREV4SmtlVzVoYldsamJHbHpkR1Z1WlhJdFkyRXdIaGNOTWpFdwpPREF6TURNeU1UUTNXaGNOTXpFd09EQXhNRE15TVRRM1dqQTdNUnd3R2dZRFZRUUtFeE5rZVc1aGJXbGpiR2x6CmRHVnVaWEl0YjNKbk1Sc3dHUVlEVlFRREV4SmtlVzVoYldsamJHbHpkR1Z1WlhJdFkyRXdXVEFUQmdjcWhrak8KUFFJQkJnZ3Foa2pPUFFNQkJ3TkNBQVRXZjhyaE5HSTFoNHBqVGYzRTVXRS9XVCtyM0R5cndxTkZzOUdycCswSwpPZEFuWXBWakZLcWtCSU55eGRLS041c0NBTHBzR005TzhBMzZJdmdwWGE0M295TXdJVEFPQmdOVkhROEJBZjhFCkJBTUNBcVF3RHdZRFZSMFRBUUgvQkFVd0F3RUIvekFLQmdncWhrak9QUVFEQWdOSEFEQkVBaUJoTU92dUxoQzMKUlMzZTNhVTRjQTVCZDh5dGhJYWhqa0tqdE5BOGxNRTlDd0lnWEx4NFdMYWxkWklhVUJ5TjVPNGx3NVppTkppTAo5cjdMNXZWd0ozZk5BMGc9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0='
              }
            }
          ],
          'users': [
            {
              'name': 'local',
              'user': {
                'token': 'kubeconfig-user-rsdjt:l8dwjvd9lzwmmmfdkfkfs9flxqwp2hzvwhgsw9hfqsmzd6lngkkftg'
              }
            }
          ],
          'contexts': [
            {
              'name': 'local',
              'context': {
                'user': 'local',
                'cluster': 'local'
              }
            }
          ],
          'current-context': 'local'
        }
      },
      hasUploadfile: false
    }
  },
  computed: {
    hasKubeConfig() {
      return !!this.form.kubeConfigFile
    }
  },
  methods: {
    async fetchData() {
      const res = await getDeployedHostsLists()
      return res.data.cluster
    },
    async fetchDeployedHostsByList(cluster_id) {
      const res = await getDeployedHostsByList(cluster_id)
      console.log(res)
      this.setFormData(this.deployedData)
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
      this.fetchDeployedHostsByList(row.id)
      this.showAddClusterPage = true
    },
    setFormData(deployedData) {
      const { cluster, K8s_Config } = deployedData
      this.form.clusterName = cluster.name
      this.form.disabled = cluster.disabled
      this.form.kubeConfigFile = K8s_Config.clusters[0].cluster['certificate-authority-data']
    },
    addCluster() {
      this.form = {
        clusterName: '',
        disabled: false,
        kubeConfigFile: ''
      }
      this.showAddClusterPage = true
    },
    handleBackPage() {
      this.showAddClusterPage = false
    },
    hasFileList(bool) {
      if (bool) this.form.kubeConfigFile = ''
      else this.form.kubeConfigFile = this.deployedData.K8s_Config.clusters[0].cluster['certificate-authority-data']
      this.hasUploadfile = bool
    },
    handleSave() {}
  }
}
</script>

<style lang="scss" scoped>
.disabled {
  pointer-events: none;
}
</style>
