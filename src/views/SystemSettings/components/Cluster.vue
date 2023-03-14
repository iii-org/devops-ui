<template>
  <div class="app-container">
    <template v-if="updateStatus === 'UPDATE_INIT'">
      <div class="text-right">
        <el-button
          class="buttonSecondary"
          @click="addCluster"
        >
          + {{ $t('general.Add') }}
        </el-button>
      </div>
      <el-divider />
      <el-table
        ref="tableData"
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="listData"
        :tree-props="{
          children: 'application',
          hasChildren: 'hasChildren'
        }"
        :row-class-name="getRowClass"
        fit
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <ul>
              <li
                v-for="(item, index) in scope.row.application"
                :key="index"
                class="mb-5"
              >
                <span class="mr-5">
                  {{ item.project_name }}
                </span>
                <span class="mr-5">
                  {{ item.tag }}
                </span>
                <el-tag :type="tagType(item.status)" effect="dark">
                  {{ clusterStatus(item.status) }}
                </el-tag>
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          align="center"
          :label="$t('SystemDeploySettings.Index')"
          width="100"
        />
        <el-table-column
          align="center"
          :label="$t('SystemDeploySettings.RemoteDeploymentEnvironment')"
          prop="name"
        />
        <el-table-column
          align="center"
          :label="$t('SystemDeploySettings.ClusterName')"
          prop="cluster_name"
          width="150"
        />
        <el-table-column
          align="center"
          label="URL"
          width="300"
        >
          <template slot-scope="scope">
            <el-link
              class="linkTextColor"
              target="_blank"
              :href="scope.row.cluster_host"
            >
              {{ scope.row.cluster_host }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('SystemDeploySettings.Account')"
          prop="cluster_user"
        />
        <el-table-column
          align="center"
          :label="$t('SystemDeploySettings.LastUpdateTime')"
          width="200"
        >
          <template slot-scope="scope">
            {{ getLocalTime(scope.row.update_at) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('SystemDeploySettings.Status')"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.disabled ? 'danger' : 'success'">
              {{ scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('SystemDeploySettings.Actions')"
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="editCluster(scope.row)"
            >
              <span class="text-primary">
                {{ $t('general.Edit') }}
              </span>
            </el-button>
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
                {{ !scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
              </span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <AddCluster
      v-else-if="updateStatus === 'UPDATE_POST'"
      @initCluster="initCluster"
    />
    <EditCluster
      v-else-if="updateStatus === 'UPDATE_PUT'"
      :cluster-id="clusterId"
      @initCluster="initCluster"
    />
  </div>
</template>

<script>
import {
  getDeployedHostsLists,
  updateDeployHostsById
} from '@/api/deploy'
import { BasicData } from '@/mixins'
import { getLocalTime } from '@/utils/handleTime'

export default {
  name: 'Cluster',
  components: {
    AddCluster: () => import('./AddCluster'),
    EditCluster: () => import('./EditCluster')
  },
  mixins: [BasicData],
  data() {
    return {
      updateStatus: 'UPDATE_INIT',
      clusterId: 0
    }
  },
  methods: {
    async fetchData() {
      const res = await getDeployedHostsLists()
      return res.data.cluster
    },
    addCluster() {
      this.updateStatus = 'UPDATE_POST'
    },
    async editCluster(row) {
      this.clusterId = row.id
      this.updateStatus = 'UPDATE_PUT'
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
      this.updateHostsDisabled(row)
    },
    async updateHostsDisabled(row) {
      const { name, disabled } = row
      const clusterId = row.id
      const formData = new FormData()
      const params = ['name', 'disabled', 'k8s_config_file', 'k8s_config_string']
      params.forEach(param => formData.delete(param))
      formData.append('name', name)
      formData.append('disabled', disabled)
      this.updateDeployHostsById(clusterId, formData)
    },
    async updateDeployHostsById(clusterId, formData) {
      await updateDeployHostsById(clusterId, formData)
        .then(() => {
          this.loadData()
          this.showUpdateMessage()
        })
        .catch((error) => {
          console.error(error)
        })
    },
    initCluster(isLoad) {
      this.updateStatus = 'UPDATE_INIT'
      if (isLoad) this.loadData()
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
    },
    getRowClass({ row }) {
      if (row.application.length === 0) return 'hide-expand-icon'
      return ''
    },
    getLocalTime(time) {
      return getLocalTime(time)
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}

>>> .el-table {
  .hide-expand-icon {
    .el-table__expand-column .cell {
      display: none;
    }
  }
}
</style>
