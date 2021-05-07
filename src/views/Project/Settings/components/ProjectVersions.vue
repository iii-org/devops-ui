<template>
  <el-collapse-item v-loading="listLoading" name="ProjectVersions">
    <template slot="title">
      <span class="text-subtitle-1 font-weight-bold">{{ $t('Version.Manage') }}</span>
    </template>
    <div class="d-flex justify-space-between mb-4">
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
    <el-table :data="pagedData" border fit>
      <el-table-column prop="name" :label="$t('general.Name')" show-overflow-tooltip />
      <ElTableColumnTime prop="created_on" :label="$t('general.CreateTime')" />
      <el-table-column prop="due_date" align="center" :label="$t('Version.DueDate')" />
      <ElTableColumnTime prop="updated_on" :label="$t('general.LastUpdateTime')" />
      <el-table-column prop="status" align="center" :label="$t('general.Status')" width="90">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status" class="el-tag--circle" :type="getTagType(scope.row.status)" size="mini" effect="dark">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
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
  </el-collapse-item>
</template>

<script>
import MixinBasicTable from '@/mixins/MixinBasicTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { getProjectVersion, deleteProjectVersion } from '@/api/projects'
import ModifyVersionDialog from './ModifyVersionDialog'

export default {
  name: 'ProjectVersions',
  components: { ElTableColumnTime, ModifyVersionDialog },
  mixins: [MixinBasicTable],
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
      this.$confirm(`Are you sure to Delete Version ${row.name}?`, 'Delete', {
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
    },
    getTagType(status) {
      switch (status) {
        case 'open':
          return 'success'
        case 'closed':
          return 'danger'
        default:
          return 'slow'
      }
    }
  }
}
</script>
