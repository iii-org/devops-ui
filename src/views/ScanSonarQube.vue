<script>
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import { getCheckMarxScans } from '@/api/checkMarx'
import { getSonarQubeData } from '@/api/sonarQube'

export default {
  name: 'ScanSonarQube',
  mixins: [MixinElTableWithAProject],
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        return []
      }
      return await getSonarQubeData(this.selectedProject.name).data
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
        :placeholder="$t('CheckMarx.SearchScanId')"
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
      <el-table-column align="center" :label="$t('Git.Commit')" width="100">
        <template slot-scope="scope">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            :href="scope.row.commit_url"
          >
            {{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('CheckMarx.Status')" prop="status" width="100" />
      <el-table-column align="center" :label="$t('CheckMarx.HighSeverity')" prop="stats.highSeverity" />
      <el-table-column align="center" :label="$t('CheckMarx.MediumSeverity')" prop="stats.mediumSeverity" />
      <el-table-column align="center" :label="$t('CheckMarx.LowSeverity')" prop="stats.lowSeverity" />
      <el-table-column align="center" :label="$t('CheckMarx.InfoSeverity')" prop="stats.infoSeverity" />
      <el-table-column-time prop="run_at" :label="$t('CheckMarx.RunAt')" />
      <el-table-column align="center" :label="$t('CheckMarx.Report')" prop="report_ready" max-width="90">
        <template slot-scope="scope">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            class="download-btn"
            :disabled="!scope.row.report_ready"
            :underline="false"
            @click="fetchTestReport(scope.row.report_id)"
          >
            <i class="el-icon-download" style="font-size: 16px" />
          </el-link>
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

<style scoped>

</style>
