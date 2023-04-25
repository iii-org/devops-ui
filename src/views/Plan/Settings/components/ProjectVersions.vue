<template>
  <div v-loading="listLoading">
    <div
      v-if="isShowTitle"
      class="mb-2 text-lg"
    >
      {{ $t('Version.ProjectManage') }}
    </div>
    <el-empty
      v-if="selectedProjectId === -1"
      :description="$t('general.NoData')"
      :image-size="100"
    />
    <template v-else>
      <div class="flex justify-between mb-4">
        <el-button
          class="buttonSecondary"
          size="small"
          icon="el-icon-plus"
          @click="handleAdding"
        >
          {{ $t('Version.AddVersion') }}
        </el-button>
        <el-input
          v-model="keyword"
          size="small"
          prefix-icon="el-icon-search"
          :style="{ width: '130px' }"
          :placeholder="$t('general.SearchName')"
        />
      </div>
      <el-table :data="pagedData" fit>
        <el-table-column
          prop="name"
          :label="$t('general.Name')"
          align="center"
          show-overflow-tooltip
          sortable
          min-width="100"
        />
        <ElTableColumnTime
          prop="created_on"
          :label="$t('general.CreateTime')"
        />
        <el-table-column
          prop="due_date"
          align="center"
          :label="$t('general.DueDate')"
          min-width="120"
        />
        <ElTableColumnTime
          prop="updated_on"
          :label="$t('general.LastUpdateTime')"
        />
        <el-table-column-tag
          prop="status"
          i18n-key="Version"
          :label="$t('general.Status')"
          element-class="el-tag--circle"
          min-width="90"
          size="mini"
          location="projectVersions"
        />
        <el-table-column
          :label="$t('general.Actions')"
          align="center"
        >
          <template slot-scope="scope">
            <el-tooltip
              placement="bottom"
              :content="$t('general.Edit')"
            >
              <em class="ri-file-edit-line finished operate-button" @click="handleEdit(scope.row)" />
            </el-tooltip>
            <el-tooltip
              placement="bottom"
              :content="$t('general.Delete')"
            >
              <em class="ri-delete-bin-2-line danger operate-button" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty
            :description="$t('general.NoData')"
            :image-size="100"
          />
        </template>
      </el-table>
      <Pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[5, 10, 20, 50]"
        :layout="'total, sizes, prev, pager, next'"
        @pagination="onPagination"
      />
      <ModifyVersionDialog
        ref="modifyVersionDialog"
        @update="loadData"
      />
    </template>
  </div>
</template>

<script>
import { getProjectVersion, deleteProjectVersion } from '@/api/projects'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { ElTableColumnTime, ElTableColumnTag } from '@/components'
import ModifyVersionDialog from './ModifyVersionDialog'

export default {
  name: 'ProjectVersions',
  components: {
    ElTableColumnTime,
    ElTableColumnTag,
    ModifyVersionDialog
  },
  mixins: [BasicData, Pagination, SearchBar],
  props: {
    isShowTitle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      listQuery: {
        offset: 0,
        limit: 5,
        total: 0,
        page: 1
      }
    }
  },
  methods: {
    async fetchData() {
      const res = await getProjectVersion(this.selectedProjectId)
      return res.data.versions
    },
    handleAdding() {
      this.$refs.modifyVersionDialog.dialogVisible = true
      this.$refs.modifyVersionDialog.dialogStatus = 1
    },
    handleEdit(row) {
      const { name, due_date, status, description, id } = row
      const rowData = { id, name, due_date, status, description }
      this.$refs.modifyVersionDialog.dialogVisible = true
      this.$refs.modifyVersionDialog.dialogStatus = 2
      this.$refs.modifyVersionDialog.form = Object.assign({}, rowData)
    },
    async handleDelete(row) {
      this.$confirm(this.$t('Version.ConfirmDelete', { version: row.name }), this.$t('general.Delete'), {
        confirmButtonText: this.$t('general.Delete'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'error'
      }).then(async () => {
        await deleteProjectVersion(this.selectedProjectId, row.id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.loadData()
      })
    }
  }
}
</script>
