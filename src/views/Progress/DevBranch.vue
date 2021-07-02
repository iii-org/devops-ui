<template>
  <el-row class="app-container" style="overflow: hidden;">
    <div class="flex justify-between">
      <project-list-selector />
      <el-input
        v-model="keyword"
        :placeholder="$t('ProcessDevBranch.SearchBranch')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit height="100%">
      <el-table-column align="center" :label="$t('ProcessDevBranch.Branch')" width="200" prop="name" />
      <el-table-column align="center" :label="$t('general.Description')" min-width="160" prop="last_commit_message" />
      <el-table-column align="center" :label="$t('ProcessDevBranch.Commit')" width="120" prop="short_id">
        <template slot-scope="scope">
          <el-link type="primary" target="_blank" style="font-size: 16px" :href="scope.row.commit_url">
            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ scope.row.short_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-time prop="last_commit_time" width="170" :label="$t('general.LastUpdateTime')" />
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ProgressDevBranch',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  computed: {
    ...mapGetters(['branchesByProject'])
  },
  watch: {
    branchesByProject(ary) {
      this.branchList = ary
    }
  },
  methods: {
    ...mapActions('branches', ['getBranchesByProject']),
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      await this.getBranchesByProject(this.selectedRepositoryId)
      return this.branchList
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    formatEnvironment(env) {
      const serviceArray = Object.keys(env)
      const environmentArray = []
      serviceArray.forEach(function(item) {
        const detailArray = env[item]
        const serviceName = Object.keys(env[item])
        detailArray[serviceName].forEach(function(item) {
          environmentArray.push({ service: serviceName[0], port: item.port, url: item.url })
        })
      })
      return environmentArray
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    }
  }
}
</script>
