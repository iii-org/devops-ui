<template>
  <div class="app-container">
    <ProjectListSelector>
      <div slot="button">
        <el-button
          class="buttonSecondary"
          icon="el-icon-plus"
          :disabled="!isAlive"
          @click="handleCreate"
        >
          {{ $t('Excalidraw.CreateBoard') }}
        </el-button>
        <span
          v-if="!isAlive"
          style="color: red; font-size: 12px;"
        >
          <em class="ri-error-warning-fill ri-lg" />
          {{ $t('Notify.ExcalidrawAliveWarning') }}
        </span>
      </div>
      <SearchFilter :keyword.sync="keyword" />
    </ProjectListSelector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      fit
    >
      <el-table-column
        :label="$t('general.Index')"
        type="index"
        align="center"
        width="70"
      />
      <el-table-column
        :label="$t('general.Name')"
        prop="name"
        align="center"
      >
        <template slot-scope="scope">
          <el-link
            type="primary"
            style="font-size: 16px"
            @click="handleEdit(scope.row,true)"
          >
            {{ scope.row.name }}
          </el-link>
          <el-link
            size="small"
            :underline="false"
            @click="handleEdit(scope.row,true)"
          >
            <em class="ri-external-link-line" />
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-time
        :label="$t('general.CreateTime')"
        prop="created_at"
        width="130"
      />
      <el-table-column
        :label="$t('general.Creator')"
        prop="operator.name"
        width="150"
        align="center"
      />
      <el-table-column
        :label="$t('Issue.Issue')"
        prop="issue_ids"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-tag
            v-for="item in scope.row.issue_ids"
            :key="item"
            size="mini"
            class="mr-1"
            @click="enterDetail(item)"
          >
            {{ item }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('general.Actions')"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <el-tooltip
            :content="$t('general.Edit')"
            effect="dark"
            placement="bottom"
          >
            <el-button
              circle
              size="mini"
              class="buttonPrimaryReverse"
              type="primary"
              icon="el-icon-edit"
              @click="handleEdit(scope.row,false)"
            />
          </el-tooltip>
          <el-popconfirm
            :title="$t('Notify.confirmDelete')"
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon-color="red"
            icon="el-icon-info"
            @confirm="handleDelete(scope.row)"
          >
            <el-tooltip
              slot="reference"
              :content="$t('general.Delete')"
              effect="dark"
              placement="bottom"
            >
              <el-button
                circle
                size="mini"
                type="danger"
                icon="el-icon-delete"
              />
            </el-tooltip>
          </el-popconfirm>
          <el-tooltip
            :content="$t('Excalidraw.HistoricalRecord')"
            effect="dark"
            placement="bottom"
          >
            <el-button
              v-if="isProjectOwnerOrAdministrator"
              circle
              size="mini"
              class="buttonSecondaryReverse"
              type="success"
              icon="el-icon-time"
              @click="handleRestore(scope.row)"
            />
          </el-tooltip>
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
    <CreateBoardDialog
      v-if="CreateBoardDialogVisible"
      :dialog-visible.sync="CreateBoardDialogVisible"
      @update="loadData"
      @handle="handleEdit"
      @handleError="handleError"
    />
    <EditBoardDialog
      v-if="EditBoardDialogVisible"
      :dialog-visible.sync="EditBoardDialogVisible"
      :row="row"
      @update="loadData"
      @handleError="handleError"
    />
    <RestoreBoardDialog
      v-if="RestoreBoardDialogVisible"
      :dialog-visible.sync="RestoreBoardDialogVisible"
      :row="row"
      @update="loadData"
      @handleError="handleError"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getExcalidraw, deleteExcalidraw } from '@/api_v2/excalidraw'
import { getServerStatus } from '@/api_v2/monitoring'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { ProjectListSelector, ElTableColumnTime } from '@/components'
import {
  SearchFilter,
  CreateBoardDialog,
  EditBoardDialog,
  RestoreBoardDialog
} from './components'

export default {
  name: 'WhiteBoardList',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    SearchFilter,
    CreateBoardDialog,
    EditBoardDialog,
    RestoreBoardDialog
  },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      searchKeys: ['name'],
      isAlive: true,
      CreateBoardDialogVisible: false,
      EditBoardDialogVisible: false,
      RestoreBoardDialogVisible: false,
      row: {}
    }
  },
  computed: {
    ...mapGetters(['userId', 'userRole', 'selectedProject']),
    isProjectOwnerOrAdministrator() {
      return this.userId === this.selectedProject.owner_id || this.userRole === 'Administrator'
    }
  },
  methods: {
    async fetchData() {
      await this.getExcalidrawStatus()
      if (!this.isAlive) return []
      try {
        return (await getExcalidraw({ project_id: this.selectedProjectId })).data
      } catch (error) {
        console.error(error)
        this.handleError()
      }
    },
    async getExcalidrawStatus() {
      this.isAlive = (await getServerStatus('excalidraw')).status
    },
    handleError() {
      this.isAlive = false
      this.listData = []
    },
    handleCreate() {
      this.CreateBoardDialogVisible = true
    },
    handleEdit(row, isCollapse = true) {
      this.row = row
      this.row.collapse = isCollapse ? ['2'] : ['1', '2']
      this.EditBoardDialogVisible = true
    },
    async handleDelete(row) {
      try {
        await deleteExcalidraw(row.id)
        const message = this.$t('Notify.Deleted')
        this.showSuccessMessage(message)
        this.loadData()
      } catch (error) {
        console.error(error)
        this.handleError()
      }
    },
    handleRestore(row) {
      this.row = row
      this.RestoreBoardDialogVisible = true
    },
    enterDetail(issueId) {
      this.$router.push({ name: 'IssueDetail', params: { issueId }})
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-tag {
  cursor: pointer;
}
</style>
