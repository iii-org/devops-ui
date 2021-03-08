<script>
import { mapActions, mapGetters } from 'vuex'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ProcessDevBranch',
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
      const repository_id = this.selectedProject.repository_id
      await this.getBranchesByProject(repository_id)
      return this.branchList
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      return success + ' / ' + total
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    EnvironmentFormat(env) {
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
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('ProcessDevBranch.SearchBranch')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row height="100%">
      <el-table-column align="center" :label="$t('ProcessDevBranch.Branch')" min-width="160" prop="name" />
      <el-table-column align="center" :label="$t('general.Description')" min-width="160" prop="last_commit_message" />
      <el-table-column align="center" :label="$t('ProcessDevBranch.Environment')" min-width="200">
        <template slot-scope="scope">
          <div v-for="(item, index) in EnvironmentFormat(scope.row.env_url)" :key="index">
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
  </div>
</template>
