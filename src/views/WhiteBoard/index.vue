<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        slot="button"
        class="buttonSecondary"
        icon="el-icon-plus"
        :disabled="isDisabled"
        @click="handleCreate"
      >
        {{ $t('Excalidraw.CreateBoard') }}
      </el-button>
      <SearchFilter
        :is-alive="isAlive"
        :keyword.sync="keyword"
      />
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
            slot="reference"
            type="primary"
            style="font-size: 16px"
            :disabled="isDisabled"
            @click="handleEdit(scope.row,true)"
          >
            {{ scope.row.name }}
          </el-link>
          <el-link
            size="small"
            :underline="false"
            :disabled="isDisabled"
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
              :disabled="isDisabled"
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
                :disabled="isDisabled"
              />
            </el-tooltip>
          </el-popconfirm>
          <el-tooltip
            :content="$t('Excalidraw.HistoricalRecord')"
            effect="dark"
            placement="bottom"
          >
            <el-button
              size="mini"
              circle
              class="buttonSecondaryReverse"
              type="success"
              icon="el-icon-time"
              :disabled="isDisabled"
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
      :dialog-visible.sync="CreateBoardDialogVisible"
      @update="loadData"
      @handle="handleEdit"
      @handleError="handleError"
    />
    <EditBoardDialog
      ref="EditBoardDialog"
      :dialog-visible.sync="EditBoardDialogVisible"
      :row.sync="row"
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
import { BasicData, Pagination, SearchBar, ProjectSelector } from '@/mixins'
import { getExcalidraw, deleteExcalidraw } from '@/api_v2/excalidraw'
import { getServerStatus } from '@/api_v2/monitoring'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import {
  SearchFilter,
  CreateBoardDialog,
  EditBoardDialog,
  RestoreBoardDialog
} from './components'

export default {
  name: 'WhiteBoardList',
  components: {
    ElTableColumnTime,
    SearchFilter,
    CreateBoardDialog,
    EditBoardDialog,
    RestoreBoardDialog
  },
  mixins: [BasicData, Pagination, SearchBar, ProjectSelector],
  data() {
    return {
      searchKeys: ['name'],
      isClosed: false,
      isAlive: true,
      CreateBoardDialogVisible: false,
      EditBoardDialogVisible: false,
      RestoreBoardDialogVisible: false,
      row: {}
    }
  },
  computed: {
    isDisabled() {
      return this.isClosed || !this.isAlive
    }
  },
  methods: {
    async fetchData() {
      this.isAlive = (await getServerStatus('excalidraw')).status
      try {
        return (await getExcalidraw({ project_id: this.selectedProjectId })).data
      } catch (error) {
        console.error(error)
        this.handleError()
      }
    },
    handleError() {
      this.isClosed = true
      this.listData = []
    },
    handleCreate() {
      this.CreateBoardDialogVisible = true
    },
    handleEdit(row, isCollapse = true) {
      this.$refs.EditBoardDialog.isCollapse = isCollapse ? ['2'] : ['1', '2']
      this.row = row
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
