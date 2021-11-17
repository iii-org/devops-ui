<template>
  <el-collapse-item v-loading="listLoading" name="ProjectVersions">
    <template slot="title">
      <span class="text-title">{{ $t('Version.Manage') }}</span>
    </template>
    <el-empty v-if="selectedProjectId === -1" :description="$t('general.NoData')" :image-size="100" />
    <template v-else>
      <div class="flex justify-between mb-4">
        <el-button type="success" size="small" icon="el-icon-plus" @click="handleAdding">
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
        <ElTableColumnTime prop="created_on" :label="$t('general.CreateTime')" />
        <el-table-column prop="due_date" align="center" :label="$t('general.DueDate')" min-width="120" />
        <ElTableColumnTime prop="updated_on" :label="$t('general.LastUpdateTime')" />
        <el-table-column-tag
          prop="status"
          i18n-key="Version"
          :label="$t('general.Status')"
          element-class="el-tag--circle"
          min-width="90"
          size="mini"
          location="projectVersions"
        />
        <el-table-column :label="$t('general.Actions')" align="center" width="210">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">
              {{ $t('general.Edit') }}
            </el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">
              {{ $t('general.Delete') }}
            </el-button>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" :image-size="100" />
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
      <modify-version-dialog ref="modifyVersionDialog" @update="loadData" />
    </template>
  </el-collapse-item>
</template>

<script>
import { BasicData, Pagination, SearchBar } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import { getProjectVersion, deleteProjectVersion } from '@/api/projects'
import ModifyVersionDialog from './ModifyVersionDialog'

export default {
  name: 'ProjectVersions',
  components: { ElTableColumnTime, ModifyVersionDialog, ElTableColumnTag },
  mixins: [BasicData, Pagination, SearchBar],
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
