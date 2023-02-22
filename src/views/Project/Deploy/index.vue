<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        slot="button"
        class="buttonSecondary"
        :disabled="selectedProjectId === -1"
        icon="el-icon-plus"
        @click="handleApplicationSetting(null)"
      >
        {{ $t('Deploy.AddApplication') }}
      </el-button>
      <el-input
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('general.SearchName')"
        style="width: 300px; float: right"
      />
    </ProjectListSelector>
    <el-divider />
    <div class="flex justify-between items-center mb-1">
      <div class="flex">
        {{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}
      </div>
      <div class="flex">
        <el-button
          class="buttonPrimaryReverse"
          icon="el-icon-refresh"
          size="mini"
          plain
          @click="loadData"
        >
          {{ $t('general.Refresh') }}
        </el-button>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
    >
      <el-table-column
        align="center"
        :label="$t('Deploy.ID')"
        min-width="110"
        prop="id"
      />
      <el-table-column
        align="center"
        :label="$t('Deploy.Name')"
        min-width="100"
        prop="name"
      />
      <el-table-column
        align="center"
        :label="$t('Deploy.Cluster')"
        min-width="100"
        prop="cluster.name"
      />
      <el-table-column
        align="center"
        :label="$t('Deploy.Status')"
        min-width="100"
        prop="status"
      >
        <template slot-scope="{row}">
          <template v-if="!row.disabled">
            {{ row.status }}
            <Status :id="row.status_id" />
          </template>
          <template v-else>
            {{ $t('Deploy.Stopped') }}
            <Status :id="0" />
          </template>
        </template>
      </el-table-column>
      <el-table-column
        prop="pod"
        align="center"
        width="200"
        :label="$t('Deploy.Pod')"
      >
        <template slot-scope="{row}">
          <el-progress
            :percentage="calcPercentage(row.deployment)"
            :status="format(row.deployment)"
          />
          <span v-if="isPodNumberNotNull(row.deployment)">
            {{ row.deployment.available_pod_number }} / {{ row.deployment.total_pod_number }}
          </span>
        </template>
      </el-table-column>
      <el-table-column-time
        prop="created_at"
        :label="$t('general.CreateTime')"
      />
      <el-table-column
        align="center"
        :label="$t('general.Actions')"
        width="240"
      >
        <template slot-scope="{row}">
          <el-dropdown
            v-if="row.status_id !== 9"
            split-button
            size="small"
            :type="row.disabled ? 'warning' : 'success'"
            @click="handleServiceStatus(row)"
          >
            <em :class="row.disabled| getActionIcon" /> {{ getActionText(row.disabled) }}
            <el-dropdown-menu slot="dropdown">
              <template v-if="row.public_endpoint">
                <el-dropdown-item
                  type="danger"
                  icon="el-icon-link"
                  @click.native="toEndpoint(row.public_endpoint)"
                >
                  {{ $t('Deploy.LinkToApplication') }}
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-divider />
                </el-dropdown-item>
              </template>
              <el-dropdown-item
                size="mini"
                icon="el-icon-refresh-right"
                @click.native="handleRedeploy(row.id)"
              >{{ $t('Deploy.Redeploy') }}
              </el-dropdown-item>
              <el-dropdown-item
                size="mini"
                icon="el-icon-edit"
                @click.native="handleApplicationSetting(row.id)"
              >{{ $t('general.Edit') }}
              </el-dropdown-item>
              <el-popconfirm
                :confirm-button-text="$t('general.Delete')"
                :cancel-button-text="$t('general.Cancel')"
                icon="el-icon-info"
                icon-color="red"
                placement="bottom-start"
                :title="$t('Notify.confirmDelete')"
                @confirm="handleDelete(row.id)"
              >
                <el-dropdown-item
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                >
                  {{ $t('general.Delete') }}
                </el-dropdown-item>
              </el-popconfirm>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { getLocalTime } from '@/utils/handleTime'
import {
  getServices,
  getService,
  deleteService,
  patchService,
  patchServiceRedeploy
} from '@/api/deploy'
import { BasicData, Pagination, SearchBar, CancelRequest } from '@/mixins'
import { ProjectListSelector, ElTableColumnTime } from '@/components'
import Status from './components/Status'

export default {
  name: 'Deploy',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    Status
  },
  filters: {
    getActionIcon(value) {
      return value ? 'el-icon-video-play' : 'el-icon-video-pause'
    }
  },
  mixins: [BasicData, Pagination, SearchBar, CancelRequest],
  data() {
    return {
      searchKeys: ['name'],
      lastUpdateTime: null
    }
  },
  computed: {
    isPodNumberNotNull() {
      return function(data) {
        return data.available_pod_number !== null && data.total_pod_number !== null
      }
    },
    format() {
      return function (deployment) {
        const { available_pod_number, total_pod_number } = deployment
        if (available_pod_number && total_pod_number) {
          return available_pod_number / total_pod_number === 1 ? 'success' : 'warning'
        }
      }
    },
    calcPercentage(deployment) {
      return function (deployment) {
        const { available_pod_number, total_pod_number } = deployment
        if (available_pod_number && total_pod_number) {
          return (available_pod_number / total_pod_number) * 100
        }
      }
    }
  },
  methods: {
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        type: 'success',
        message
      })
    },
    async getAllServices() {
      const res = await getServices(
        { project_id: this.selectedProjectId },
        { cancelToken: this.cancelToken }
      )
      this.lastUpdateTime = getLocalTime(res.datetime)
      return res.data.applications
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      if (this.isUpdating) this.cancelRequest()
      this.isUpdating = true
      const listData = await this.getAllServices()
      this.setTimer()
      this.isUpdating = false
      this.listLoading = false
      return listData
    },
    async fetchUnfinishedData() {
      const listData = await this.getAllServices()
      for (const [data, i] of listData.entries()) {
        const statusId = data.status_id
        if ((statusId > 0 && statusId < 5) || statusId === 9 || statusId === 11) {
          const restData = await getService(data.id)
          this.$set(listData, i, restData.data.application)
        }
      }
      this.setTimer()
      this.listData = listData
    },
    handleApplicationSetting(application_id) {
      this.$router.push({ name: 'ApplicationSetting', params: {
        applicationId: application_id || null
      }})
    },
    getActionText(value) {
      return value ? this.$t('Deploy.Start') : this.$t('Deploy.Stop')
    },
    async handleServiceStatus(row) {
      this.listLoading = true
      try {
        await patchService(row.id, { disabled: !row.disabled })
        this.showSuccessMessage(this.$t('Notify.Updated'))
      } catch (e) {
        console.error(e)
      }
      await this.loadData()
      this.listLoading = false
    },
    async handleRedeploy(id) {
      this.listLoading = true
      try {
        await patchServiceRedeploy(id)
        this.showSuccessMessage(this.$t('Notify.Updated'))
      } catch (e) {
        console.error(e)
      }
      await this.loadData()
      this.listLoading = false
    },
    async handleDelete(id) {
      this.listLoading = true
      try {
        await deleteService(id)
        this.showSuccessMessage(this.$t('Notify.Deleted'))
      } catch (error) {
        console.error(error)
      }
      await this.loadData()
      this.listLoading = false
    },
    setTimer() {
      let timer = null
      if (timer) this.clearTimer(timer)
      timer = setTimeout(() => this.fetchUnfinishedData(), 10000)
      this.$once('hook:beforeDestroy', () => {
        this.clearTimer(timer)
      })
    },
    clearTimer(timer) {
      clearTimeout(timer)
      timer = null
    },
    toEndpoint(url) {
      window.open(url, '_blank')
    }
  }
}
</script>
