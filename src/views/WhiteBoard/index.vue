<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        slot="button"
        class="buttonPrimary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        {{ $t('general.Add') }}
      </el-button>
      <SearchFilter :keyword.sync="keyword" />
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
            @click="handleEdit(scope.row,false)"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-popconfirm
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            :title="$t('Notify.confirmDelete')"
            @confirm="handleDelete(scope.row)"
          >
            <el-button
              slot="reference"
              size="mini"
              type="danger"
            >
              <em class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
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
    <CreateBoardDialog
      ref="CreateBoardDialog"
      @update="loadData"
      @handle="handleAfterCreate"
    />
    <EditBoardDialog
      ref="EditBoardDialog"
      @update="loadData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BasicData, Table, Pagination, SearchBar, ProjectSelector } from '@/newMixins'
import { getExcalidraw, deleteExcalidraw } from '@/api_v2/excalidraw'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import SearchFilter from './components/SearchFilter'
import CreateBoardDialog from './components/CreateBoardDialog'
import EditBoardDialog from './components/EditBoardDialog'

export default {
  name: 'WhiteBoardList',
  components: { ElTableColumnTime, SearchFilter, CreateBoardDialog, EditBoardDialog },
  mixins: [BasicData, Table, Pagination, SearchBar, ProjectSelector],
  data() {
    return {
      searchKeys: ['name'],
      issueQuery: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  methods: {
    async fetchData() {
      return (await getExcalidraw({ project_id: this.selectedProjectId })).data
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    handleCreate() {
      this.$refs.CreateBoardDialog.dialogVisible = true
    },
    async handleAfterCreate(row) {
      this.$refs.EditBoardDialog.isCollapse = ['1']
      this.$refs.EditBoardDialog.row = row
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.EditBoardDialog.dialogVisible = true
        }, 500)
      })
    },
    handleEdit(row, isCollapse) {
      this.$refs.EditBoardDialog.isCollapse = isCollapse ? ['1'] : []
      this.$refs.EditBoardDialog.row = row
      this.$nextTick(() => {
        this.$refs.EditBoardDialog.dialogVisible = true
      })
    },
    async handleDelete(row) {
      try {
        await deleteExcalidraw(row.id)
        const message = this.$t('Notify.Deleted')
        this.showSuccessMessage(message)
      } catch (error) {
        console.error(error)
      } finally {
        this.loadData()
      }
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