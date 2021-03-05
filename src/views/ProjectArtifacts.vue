<script>
import { deleteProjectArtifact, getProjectArtifacts } from '@/api/harbor'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  mixins: [MixinElTableWithAProject],
  methods: {
    async fetchData() {
      return (await getProjectArtifacts(this.$route.params.rName)).data
    },
    async handleDelete(idx, row) {
      this.$confirm(`Are you sure to Delete Artifact ${row.name}?`, 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(async() => {
        await deleteProjectArtifact(this.$route.params.rName, row.digest, row.name)
        this.$message({
          type: 'success',
          message: 'Delete Succeed'
        })
        await this.loadData()
      })
    }
  }
}
</script>

<template>
  <div class="table-container">
    <div class="clearfix">
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border style="width: 100%" height="100%">
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
          <el-tag v-for="label in scope.row.labels" :key="label" type="success" effect="dark">{{ label }} </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Push Time" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.push_time | YMDhmA }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" :show-overflow-tooltip="true" width="260">
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
  </div>
</template>

<style lang="scss">
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
</style>
