<template>
  <el-row class="app-container">
    <el-col>
      <div class="text-right">
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          prefix-icon="el-icon-search"
          style="width: 250px"
        />
      </div>
      <el-divider />
      <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit>
        <el-table-column :label="$t('general.Name')" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="Size" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ Math.round(scope.row.size / 1024 / 1024) }} MB
          </template>
        </el-table-column>
        <el-table-column :label="$t('ProjectResource.Vulnerabilities')">
          <template slot-scope="scope">
            <span>{{ scope.row.vulnerabilities }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Digest">
          <template slot-scope="scope">
            <span>{{ scope.row.digest }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Labels">
          <template slot-scope="scope">
            <el-tag v-for="label in scope.row.labels" :key="label" class="el-tag--circle" type="success" effect="dark">
              {{ label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column-time prop="push_time" :label="$t('Harbor.PushTime')" />
        <el-table-column :label="$t('general.Actions')" align="center" show-overflow-tooltip width="260">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
              <i class="el-icon-delete" />
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
    </el-col>
  </el-row>
</template>

<script>
import { deleteProjectArtifact, getProjectArtifacts } from '@/api/harbor'
import MixinBasicTableWithProject from '@/mixins/MixinBasicTableWithProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  components: { ElTableColumnTime },
  mixins: [MixinBasicTableWithProject],
  methods: {
    async fetchData() {
      return (await getProjectArtifacts(this.$route.params.rName)).data
    },
    async handleDelete(idx, row) {
      this.$confirm(`Are you sure to Delete Artifact ${row.name}?`, 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(async () => {
        await deleteProjectArtifact(this.$route.params.rName, row.digest, row.name)
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
