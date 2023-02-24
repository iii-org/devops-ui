<template>
  <div class="app-container">
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
          @click="handleRefresh"
        >
          {{ $t('general.Refresh') }}
        </el-button>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="pagedData"
      :row-key="getRowKey"
      :expand-row-keys="expands"
      fit
      highlight-current-row
      @expand-change="handelExpand"
    >
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <Applications
            :is-loading="expandedLoading"
            :list-data="applications"
            @loadData="getApplications()"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Deploy.ID')"
        width="80"
        prop="id"
      />
      <el-table-column
        align="center"
        :label="$t('Deploy.Name')"
        min-width="150"
        prop="name"
      />
      <el-table-column
        align="center"
        :label="$t('Deploy.Cluster')"
        min-width="150"
        prop="cluster.name"
      />
      <el-table-column
        prop="total_pods"
        align="center"
        min-width="150"
        :label="$t('Deploy.Pod')"
      >
        <template slot-scope="{row}">
          <el-progress
            :percentage="calcPercentage(row)"
            :status="format(row)"
          />
          <span v-if="isPodNumberNotNull(row)">
            {{ row.available_pods }} / {{ row.total_pods }}
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
            <em :class="row.disabled| getActionIcon" />
            {{ getActionText(row.disabled) }}
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                size="mini"
                icon="el-icon-refresh-right"
                @click.native="handleRedeploy(row)"
              >
                {{ $t('Deploy.Redeploy') }}
              </el-dropdown-item>
              <el-dropdown-item
                size="mini"
                icon="el-icon-edit"
                @click.native="handleApplicationSetting(row.id)"
              >
                {{ $t('general.Edit') }}
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
  getMultiServices,
  getMultiService,
  getService,
  patchMultiService,
  deleteMultiService,
  patchServiceRedeploy
} from '@/api/deploy'
import { BasicData, Pagination, SearchBar, CancelRequest } from '@/mixins'
import { ElTableColumnTime } from '@/components'
import Applications from './components/Applications'

export default {
  name: 'Deploy',
  components: {
    ElTableColumnTime,
    Applications
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
      lastUpdateTime: null,
      getRowKey: (row) => row.id,
      expands: [],
      expandedLoading: false,
      app_header_id: null,
      applications: []
    }
  },
  computed: {
    isPodNumberNotNull() {
      return function(row) {
        const { available_pods, total_pods } = row
        return available_pods !== null && total_pods !== null
      }
    },
    format() {
      return function (row) {
        const { available_pods, total_pods } = row
        if (available_pods && total_pods) {
          return available_pods / total_pods === 1 ? 'success' : 'warning'
        }
      }
    },
    calcPercentage() {
      return function (row) {
        const { available_pods, total_pods } = row
        if (available_pods && total_pods) {
          return (available_pods / total_pods) * 100
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
      const res = await getMultiServices(
        { cancelToken: this.cancelToken }
      )
      this.lastUpdateTime = getLocalTime(res.datetime)
      return res.data.app_headers
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
      if (this.expands.length !== 0) {
        this.expandedLoading = true
        this.applications.reduce(async (acc, app, index) => {
          const statusId = app.status_id
          await acc
          if ((statusId > 0 && statusId < 5) || statusId === 9 || statusId === 11) {
            this.applications[index] = (await getService(app.id)).data.application
          }
        }, Promise.resolve())
      }
      this.setTimer()
      this.expandedLoading = false
    },
    handleApplicationSetting(application_id) {
      this.$router.push({ name: 'ApplicationSetting', params: {
        applicationId: application_id || null
      }})
    },
    getActionText(value) {
      return value ? this.$t('Deploy.Start') : this.$t('Deploy.Stop')
    },
    handelExpand(row, expandedRows) {
      this.expands = []
      this.applications = []
      if (expandedRows.length) this.expands.push(row.id)
      if (!expandedRows.some((r) => r.id === row.id)) return
      this.getApplications(row.id)
    },
    async getApplications(app_header_id) {
      this.expandedLoading = true
      const app_header = (await getMultiService(app_header_id || this.app_header_id)).data.app_header
      this.app_header_id = app_header.id
      this.applications = app_header.applications
      this.expandedLoading = false
    },
    handleRefresh() {
      this.expands = []
      this.loadData()
    },
    async handleServiceStatus(row) {
      this.listLoading = true
      try {
        await patchMultiService(row.id, { disabled: !row.disabled })
        this.showSuccessMessage(this.$t('Notify.Updated'))
      } catch (e) {
        console.error(e)
      }
      await this.loadData()
      this.listLoading = false
    },
    async handleRedeploy(row) {
      this.listLoading = true
      const redeploys = row.applications_id.map((id) => patchServiceRedeploy(id))
      try {
        await Promise.all(redeploys)
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
        await deleteMultiService(id)
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
    }
  }
}
</script>
