<template>
  <div class="app-container">
    <div
      v-if="step === 0"
      class="flex justify-between"
    >
      <el-button
        type="text"
        size="medium"
        icon="el-icon-arrow-left"
        class="previous linkTextColor"
        @click="handleBackPage"
      >
        {{ $t('general.Back') }}
      </el-button>
      <el-button
        class="buttonSecondary"
        @click="handleAdd"
      >
        {{ $t('general.Add') }}
      </el-button>
    </div>
    <div
      v-if="step === 1"
      class="flex justify-end"
    >
      <el-button
        class="buttonSecondary"
        @click="handleFinish"
      >
        {{ $t('general.Finish') }}
      </el-button>
    </div>
    <el-divider />
    <el-steps
      :active="step"
      align-center
      finish-status="success"
    >
      <el-step
        title="Environment"
        :description="$t('SystemDeploySettings.UploadRemoteK8sConfig')"
      />
      <el-step
        title="Volume"
        :description="$t('SystemDeploySettings.SetVolume')"
      />
    </el-steps>
    <section class="flex justify-center mt-5">
      <el-form
        v-if="step === 0"
        ref="form"
        v-loading="listLoading"
        :model="form"
        label-width="120px"
        size="medium"
      >
        <el-row :gutter="10">
          <el-col :span="24" :sm="24">
            <el-form-item :label="$t('SystemDeploySettings.ClusterName')" required>
              <el-input v-model="form.clusterName" />
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="24" class="mb-5">
            <el-form-item :label="$t('general.Status')">
              <el-radio-group v-model="form.disabled">
                <el-radio :label="false">
                  {{ $t('general.Enable') }}
                </el-radio>
                <el-radio :label="true">
                  {{ $t('general.Disable') }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" :sm="24">
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
                :disabled="!!hasUploadFile"
                type="textarea"
                :placeholder="$t('SystemDeploySettings.KubeConfigTextareaHint')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table
        v-else-if="step === 1"
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="listData"
        fit
      >
        <el-table-column
          label="Id"
          prop="id"
          align="center"
          width="180"
        />
        <el-table-column
          label="Name"
          prop="name"
          align="center"
          width="180"
        />
        <el-table-column
          label="Pods used"
          prop="Pods used"
          align="center"
        />
        <el-table-column
          label="Status"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'Disabled' ? 'danger' : 'success'">
              {{ scope.row.status === 'Disabled' ? $t('general.Disable') : $t('general.Enable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Operation"
          prop="disabled"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="toggleUsage(scope.row)"
            >
              <span
                class="inline-block dot"
                :class="scope.row.disabled ? 'bg-success' : 'bg-danger'"
              />
              <span
                class="ml-2"
                :class="scope.row.disabled ? 'text-success' : 'text-danger'"
              >
                {{ scope.row.disabled ? $t('general.Enable') : $t('general.Disable') }}
              </span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import {
  addDeployHosts,
  getDeployedStorageLists,
  syncDeployedStorageLists,
  patchStorageStatus
} from '@/api/deploy'
import { btoa } from '@/utils/base64'

const formData = () => ({
  clusterName: '',
  disabled: false,
  kubeConfigString: ''
})

export default {
  name: 'AddCluster',
  components: {
    ClusterFileUploader: () => import('./ClusterFileUploader')
  },
  data() {
    return {
      step: 0,
      clusterId: 0,
      form: formData(),
      hasUploadFile: false,
      listLoading: false,
      listData: []
    }
  },
  computed: {
    disabled() {
      return !!this.form.kubeConfigString
    },
    isFormChanged() {
      for (const key in this.form) {
        if (this.form[key] !== formData()[key]) return true
      }
      return false
    }
  },
  methods: {
    handleAdd() {
      this.step = 1
      if (!this.form.clusterName) {
        this.showNoNameWarning()
        return
      }
      const formData = this.getUpdateFormData()
      this.addDeployHosts(formData)
    },
    getUpdateFormData() {
      const formData = new FormData()
      const encodedData = btoa(this.form.kubeConfigString)
      const params = ['name', 'disabled', 'k8s_config_file', 'k8s_config_string']
      params.forEach(param => formData.delete(param))
      formData.append('name', this.form.clusterName)
      formData.append('disabled', this.form.disabled)
      if (this.hasUploadFile) formData.append('k8s_config_file', this.hasUploadFile)
      if (this.form.kubeConfigString) formData.append('k8s_config_string', encodedData)
      return formData
    },
    async addDeployHosts(formData) {
      this.listLoading = true
      await addDeployHosts(formData)
        .then(async(res) => {
          this.clusterId = res.data.cluster_id
          await this.fetchStorageLists()
          this.showUpdateMessage()
          this.step = 1
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    async fetchStorageLists() {
      this.listLoading = true
      await syncDeployedStorageLists(this.clusterId)
      const res = await getDeployedStorageLists(this.clusterId)
      this.listData = res.data
      this.listLoading = false
    },
    async toggleUsage(row) {
      this.listLoading = true
      await patchStorageStatus(row.id, { disabled: !row.disabled })
      this.fetchStorageLists()
      this.listLoading = false
    },
    handleFinish() {
      this.$emit('initCluster', true)
    },
    async handleBackPage() {
      const confirm_options = {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      }
      if (this.isFormChanged || this.hasUploadFile) {
        const res = await this.$confirm(
          this.$t('Notify.UnSavedChanges'),
          this.$t('general.Warning'),
          confirm_options).catch(() => {})
        if (res !== 'confirm') return
      }
      this.$emit('initCluster', false)
    },
    hasFileList(value) {
      this.form.kubeConfigString = ''
      this.hasUploadFile = value
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
    }
  }
}
</script>

<style lang="scss" scoped>
.disabled {
  pointer-events: none;
}

.dot {
  @apply rounded-full w-2 h-2;
}
</style>
