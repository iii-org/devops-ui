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
        :is-excalidraw-alive="isExcalidrawAlive"
        :keyword.sync="keyword"
      />
    </ProjectListSelector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 300px)"
      fit
    >
      <el-table-column
        type="index"
        align="center"
        :label="$t('general.Index')"
        width="100"
      />
      <el-table-column
        align="center"
        :label="$t('general.Name')"
        prop="name"
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
      />
      <el-table-column
        align="center"
        :label="$t('general.Creator')"
        prop="operator.name"
      />
      <el-table-column
        align="center"
        :label="$t('Issue.Issue')"
        show-overflow-tooltip
        prop="issue_ids"
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
        align="center"
        :label="$t('general.Actions')"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            class="buttonPrimaryReverse"
            icon="el-icon-edit"
            :disabled="isDisabled"
            @click="handleEdit(scope.row,false)"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-popconfirm
            :title="$t('Notify.confirmDelete')"
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            @confirm="handleDelete(scope.row)"
          >
            <el-button
              slot="reference"
              size="mini"
              type="danger"
              :disabled="isDisabled"
            >
              <em class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
          <el-button
            size="mini"
            class="buttonSecondaryReverse"
            icon="el-icon-time"
            :disabled="isDisabled"
            @click="handleRestore(scope.row)"
          >
            {{ $t('Excalidraw.HistoricalRecord') }}
          </el-button>
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
      isExcalidrawAlive: false,
      CreateBoardDialogVisible: false,
      EditBoardDialogVisible: false,
      RestoreBoardDialogVisible: false,
      row: {}
    }
  },
  computed: {
    isDisabled() {
      return this.isClosed || !this.isExcalidrawAlive
    }
  },
  async mounted() {
    this.isExcalidrawAlive = (await getServerStatus('excalidraw')).status
  },
  methods: {
    async fetchData() {
      try {
        return (await getExcalidraw({ project_id: this.selectedProjectId })).data
      } catch (error) {
        console.error(error)
        this.isClosed = true
        return []
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
