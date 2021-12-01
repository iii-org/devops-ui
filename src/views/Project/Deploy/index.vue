<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        slot="button"
        type="success"
        :disabled="selectedProjectId === -1"
        icon="el-icon-plus"
        @click="handleEditDialog(null)"
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
    <div class="flex justify-between items-center">
      <div class="flex">{{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}</div>
      <div class="flex">
        <el-button
          type="primary"
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
            :percentage="calcPercentage(row.deployment.available_pod_number, row.deployment.total_pod_number)"
            :status="format(row.deployment.available_pod_number, row.deployment.total_pod_number)"
          />
          <span> {{ row.deployment.available_pod_number }} / {{ row.deployment.total_pod_number }}</span>

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
            v-if="row.status_id!==9"
            split-button
            size="small"
            :type="row.disabled? 'warning': 'success'"
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
                type="primary"
                icon="el-icon-refresh-right"
                @click.native="handleRedeploy(row.id)"
              >{{ $t('Deploy.Redeploy') }}
              </el-dropdown-item>
              <el-dropdown-item
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click.native="handleEditDialog(row.id)"
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
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <el-dialog
      width="80%"
      :title="$t('Deploy.ApplicationSetting')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
    >
      <ApplicationSetting
        v-if="dialogVisible"
        :id="edit_id"
        ref="ApplicationSetting"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="onDialogClosed">{{ $t('general.Cancel') }}</el-button>
        <el-button
          v-if="edit_id"
          type="primary"
          :loading="memberConfirmLoading"
          @click="handleConfirm(edit_id)"
        >
          {{ $t('general.Save') }}</el-button>
        <el-button
          v-else
          type="primary"
          :loading="memberConfirmLoading"
          @click="handleConfirm(null)"
        >
          {{ $t('general.Add') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { BasicData, Pagination, SearchBar, Table, ProjectSelector, CancelRequest } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { getServices, postService, deleteService, putService, patchService, patchServiceRedeploy } from '@/api/deploy'
import ApplicationSetting from '@/views/Project/Deploy/components/ApplicationSetting'
import Status from './components/Status'

export default {
  name: 'Deploy',
  components: { ApplicationSetting, ElTableColumnTime, Status },
  filters: {
    getActionIcon(value) {
      return value ? 'el-icon-video-play' : 'el-icon-video-pause'
    }
  },
  mixins: [BasicData, Pagination, SearchBar, Table, ProjectSelector, CancelRequest],
  data() {
    return {
      dialogVisible: false,
      edit_id: null,
      versionList: [],
      dialogStatus: 1,
      memberConfirmLoading: false,
      uploadFileList: [],
      loadingInstance: '',
      isDownloading: false,
      searchKeys: ['name'],
      timer: null,
      lastUpdateTime: null
    }
  },
  destroyed() {
    this.clearTimer()
  },
  methods: {
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    },
    async loadData() {
      if (this.selectedProjectId === -1) return
      this.listLoading = true
      await this.fetchData()
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      if (this.isUpdating) this.cancelRequest()
      this.isUpdating = true
      const res = await getServices({ project_id: this.selectedProjectId }, { cancelToken: this.cancelToken })
      this.lastUpdateTime = this.$dayjs().utc(res.datetime).format('YYYY-MM-DD HH:mm:ss')
      this.listData = res.data.applications
      this.setTimer()
      this.isUpdating = false
      this.listLoading = false
      return res.data.applications
    },
    sortFiles(files) {
      const sortedFiles = files.map((file) => file)
      sortedFiles.sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
      return sortedFiles
    },
    handleEditDialog(id) {
      this.dialogVisible = true
      this.edit_id = id
    },
    getActionText(value) {
      return value ? this.$t('Deploy.Start') : this.$t('Deploy.Stop')
    },
    async handleServiceStatus(row) {
      this.listLoading = true
      try {
        await patchService(row.id, { disabled: !row.disabled })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
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
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
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
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
      } catch (error) {
        console.error(error)
      }
      await this.loadData()
      this.listLoading = false
    },
    async handleConfirm(id) {
      await this.$refs['ApplicationSetting'].$refs['deployForm'].validate(async (valid) => {
        if (valid) {
          this.loadingInstance = this.$loading({
            target: '.el-dialog',
            text: 'Loading'
          })
          try {
            if (id) {
              await putService(id, {
                ...this.$refs['ApplicationSetting'].deployForm,
                project_id: this.selectedProjectId
              })
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Updated'),
                type: 'success'
              })
            } else {
              await postService({ ...this.$refs['ApplicationSetting'].deployForm, project_id: this.selectedProjectId })
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Created'),
                type: 'success'
              })
            }
            this.loadingInstance.close()
            this.$refs['ApplicationSetting'].$refs['deployForm'].resetFields()
            this.dialogVisible = false
          } catch (err) {
            this.loadingInstance.close()
            console.error(err)
          }
          await this.loadData()
        } else {
          return false
        }
      })
    },
    onDialogClosed() {
      this.$refs['ApplicationSetting'].$refs['deployForm'].resetFields()
      this.dialogVisible = false
    },
    setTimer() {
      if (this.timer) {
        this.clearTimer()
      }
      this.timer = setTimeout(() => this.fetchData(), 10000)
    },
    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    },
    toEndpoint(url) {
      window.open(url, '_blank')
    },
    format(a, b) {
      return a / b === 1 ? 'success' : 'warning'
    },
    calcPercentage(a, b) {
      return (a / b) * 100
    }
  }
}
</script>

<style>
</style>
