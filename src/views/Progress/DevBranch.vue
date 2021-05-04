<template>
  <el-row class="app-container">
    <div class="d-flex justify-space-between">
      <project-list-selector />
      <el-input
        v-model="searchData"
        :placeholder="$t('ProcessDevBranch.SearchBranch')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit height="100%">
      <el-table-column align="center" :label="$t('ProcessDevBranch.Branch')" min-width="160" prop="name" />
      <el-table-column align="center" :label="$t('general.Description')" min-width="160" prop="last_commit_message" />
      <el-table-column align="center" :label="$t('ProcessDevBranch.Environment')" min-width="200">
        <template slot-scope="scope">
          <div v-for="(item, index) in formatEnvironment(scope.row.env_url)" :key="index">
            <el-link type="primary" target="_blank" style="font-size: 16px" :underline="false" :href="item.url">
              {{ item.service }} ({{ item.port }})
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('ProcessDevBranch.Commit')" min-width="100" prop="short_id">
        <template slot-scope="scope">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            :href="scope.row.commit_url"
          >
            {{ scope.row.short_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-time prop="last_commit_time" />
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
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
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
      const repository_id = this.selectedProject.repository_id
      await this.getBranchesByProject(repository_id)
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
