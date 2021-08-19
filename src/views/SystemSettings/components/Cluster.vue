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
        :data="clusterData"
        :row-key="id"
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
    <template v-else />
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import { getDeployedHostsLists, getDeployedHostsByList } from '@/api/deploySettings'

export default {
  name: 'Cluster',
  data() {
    return {
      clusterData: [],
      listLoading: false,
      showAddClusterPage: false
    }
  },
  computed: {
    // ...mapGetters(['selectedProjectId'])
  },
  watch: {
    // selectedProjectId(val) {
    //   console.log(val)
    //   if (val) this.fetchData()
    // }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      try {
        const res = await getDeployedHostsLists()
        this.clusterData = res.data.cluster
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
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
      console.log(row)
    },
    addCluster() {
      this.showAddClusterPage = true
    }
  }
}
</script>
