<template>
  <div class="app-container">
    <project-list-selector>
      <el-button
        slot="button"
        type="success"
        :disabled="selectedProjectId === -1"
        icon="el-icon-plus"
        @click="handleEditDialog(null)"
      >
        新增部署
      </el-button>
      <el-input
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('general.SearchName')"
        style="width: 300px; float: right"
      />
    </project-list-selector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="id" min-width="110" prop="id" />
      <el-table-column align="center" label="服務名稱" min-width="100" prop="name" />
      <el-table-column align="center" label="部署名稱" min-width="100" prop="cluster.name" />
      <el-table-column align="center" label="狀態" min-width="100" prop="status">
        <template slot-scope="{row}">
          <template v-if="!row.disabled">
            {{ row.status }}
            <Status :id="row.status_id" />
          </template>
          <template v-else>
            已停止
            <Status :id="0" />
          </template>
        </template>
      </el-table-column>
      <el-table-column-time prop="created_at" :label="$t('general.CreateTime')" />
      <el-table-column align="center" :label="$t('general.Actions')" width="240">
        <template slot-scope="{row}">
          <el-dropdown split-button size="small" :type="row.disabled? 'warning': 'success'" @click="handleServiceStatus(row)">
            <em :class="`el-icon-${row.disabled? 'video-play': 'video-pause'}`" /> {{ row.disabled? '啟動':'停止' }}
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item size="mini"
                                type="primary"
                                icon="el-icon-refresh-right"
                                @click.native="handleRedeploy(row.id)"
              >重新部署</el-dropdown-item>
              <el-dropdown-item size="mini"
                                type="primary"
                                icon="el-icon-edit"
                                @click.native="handleEditDialog(row.id)"
              >{{ $t('general.Edit') }}</el-dropdown-item>
              <el-popconfirm
                :confirm-button-text="$t('general.Delete')"
                :cancel-button-text="$t('general.Cancel')"
                icon="el-icon-info"
                icon-color="red"
                placement="bottom-start"
                :title="$t('Notify.confirmDelete')"
                @confirm="handleDelete(row.id)"
              >
                <el-dropdown-item slot="reference" type="danger"><em class="el-icon-delete" /> {{ $t('general.Delete') }}</el-dropdown-item>
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
      title="新增部署服務"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      @closed="onDialogClosed"
    >
      <AddApplication :id="edit_id" ref="AddApplication" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button v-if="edit_id" type="primary" :loading="memberConfirmLoading" @click="handleConfirm(edit_id)">
          {{ $t('general.Save') }}</el-button>
        <el-button v-else type="primary" :loading="memberConfirmLoading" @click="handleConfirm(null)">
          {{ $t('general.Add') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { BasicData, Pagination, SearchBar, Table, ProjectSelector } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { getServices, postService, deleteService, putService, patchService, patchServiceRedeploy } from '@/api/deploy'
import AddApplication from '@/views/Project/Deploy/components/AddApplication'
import Status from './components/Status'

export default {
  name: 'ProjectFiles',
  components: { AddApplication, ElTableColumnTime, Status },
  mixins: [BasicData, Pagination, SearchBar, Table, ProjectSelector],
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
      searchKeys: ['name']
    }
  },
  mounted() {
  },
  methods: {
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      const res = await getServices({ project_id: this.selectedProjectId })
      return res.data.applications
    },
    sortFiles(files) {
      const sortedFiles = files.map(file => file)
      sortedFiles.sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
      return sortedFiles
    },
    handleEditDialog(id) {
      this.dialogVisible = true
      this.edit_id = id
    },
    handleExceed() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.SingleFileLimit'),
        type: 'warning'
      })
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
      this.listLoading = false
    },
    async handleDelete(id) {
      this.listLoading = true
      try {
        await deleteService(id)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    async handleConfirm(id) {
      await this.$refs['AddApplication'].$refs['deployForm'].validate(async valid => {
        if (valid) {
          this.loadingInstance = this.$loading({
            target: '.el-dialog',
            text: 'Loading'
          })
          try {
            if (id) {
              await putService(id, { ...this.$refs['AddApplication'].deployForm, project_id: this.selectedProjectId })
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Updated'),
                type: 'success'
              })
            } else {
              await postService({ ...this.$refs['AddApplication'].deployForm, project_id: this.selectedProjectId })
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Created'),
                type: 'success'
              })
            }
            this.loadingInstance.close()
            this.$refs['AddApplication'].$refs['deployForm'].resetFields()
            this.dialogVisible = false
            await this.loadData()
          } catch (err) {
            this.loadingInstance.close()
            console.error(err)
          }
        } else {
          return false
        }
      })
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['AddApplication'].$refs['deployForm'].resetFields()
      })
    }
  }
}
</script>

<style>

</style>
