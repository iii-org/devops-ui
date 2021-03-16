<script>
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import { getSonarQubeData } from '@/api/sonarQube'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ScanSonarQube',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        return []
      }
      const data = (await getSonarQubeData(this.selectedProject.name)).data
      const ret = []
      for (const key in data) {
        const row = data[key]
        row['date'] = key
        ret.push(row)
      }
      ret.sort((a, b) => {
        return Date.parse(b.date) - Date.parse(a.date)
      })
      return ret
    },
    convertRating(rating) {
      console.log('rating', rating)
      return ['0', 'A', 'B', 'C', 'D', 'E'][parseInt(rating)]
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
        :placeholder="$t('Git.Branch')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      height="100%"
    >
      <el-table-column align="center" :label="$t('Git.Branch')" prop="branch" />
      <el-table-column align="center" :label="$t('Git.Commit')" prop="commit_id" />
      <el-table-column align="center" :label="$t('SonarQube.Bugs')">
        <template slot-scope="scope">
          <span>{{ scope.row.bugs }} ({{ convertRating(scope.row.reliability_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.Vulnerabilities')">
        <template slot-scope="scope">
          <span>{{ scope.row.vulnerabilities }} ({{ convertRating(scope.row.security_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.Duplicates')">
        <template slot-scope="scope">
          <span>{{ scope.row.duplicated_blocks }} ({{ scope.row.duplicated_lines_density }}%)</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.CodeSmells')" prop="code_smells" />
      <el-table-column-time :label="$t('general.RunAt')" prop="date" />
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

<style scoped>

</style>
