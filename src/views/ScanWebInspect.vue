<script>
import {
  getWebInspectReport,
  getWebInspectScans,
  getWebInspectStats,
  getWebInspectStatus
} from '@/api/webInspect'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ScanWebInspect',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    confirmLoading: false,
    searchKey: 'commit_id'
  }),
  methods: {
    async fetchData() {
      const rName = this.selectedProject.name
      const res = await getWebInspectScans(rName)
      const data = this.handleScans(res.data)
      await this.updateWebInspectScans()
      return data
    },
    handleScans(scans) {
      const sortedScans = scans.map(scan => {
        const result = scan
        if (result.stats === 'None') result.stats = {}
        return result
      })
      sortedScans.sort((a, b) => new Date(b.run_at) - new Date(a.run_at))
      return sortedScans
    },
    updateWebInspectScans() {
      this.listData.forEach(item => {
        if (!item.finished) this.fetchStatus(item.scan_id)
      })
    },
    async fetchStatus(wiScanId) {
      this.listLoading = true
      getWebInspectStatus(wiScanId).then(res => {
        const idx = this.listData.findIndex(item => item.scan_id === wiScanId)
        this.listData[idx].stats.status = res.data.status
        if (res.data.status === 'Complete') this.fetchStats(wiScanId)
      })
      this.listLoading = false
    },
    async fetchStats(wiScanId) {
      this.listLoading = true
      await getWebInspectStats(wiScanId).then(res => {
        const idx = this.listData.findIndex(item => item.scan_id === wiScanId)
        this.listData[idx].stats = res.data.severity_count
        this.listData[idx].stats.status = 'Complete'
      })
      this.listLoading = false
    },
    fetchTestReport(wiScanId) {
      getWebInspectReport(wiScanId).then(res => {
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'WebInspect_Report.xml')
        document.body.appendChild(link)
        link.click()
      })
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    getStatusTagType(status) {
      switch (status) {
        case 'Complete':
          return 'success'
        case 'Running':
          return 'slow'
        case 'NotRunning':
          return 'warning'
        case 'Interrupted':
          return 'danger'
        default:
          return 'slow'
      }
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="d-flex justify-space-between">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="mr-3"
        :placeholder="$t('WebInspect.SearchCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :element-loading-text="$t('Loading')" border fit highlight-current-row :data="pagedData" height="100%">
      <el-table-column align="center" :label="$t('WebInspect.ScanId')" prop="scan_id" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column align="center" :label="$t('WebInspect.Branch')" prop="branch" min-width="120" />
      <el-table-column align="center" :label="$t('WebInspect.Commit')" prop="commit_id" min-width="100">
        <template slot-scope="scope">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            :href="scope.row.issue_link"
          >
            {{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.Status')" prop="stats.status" min-width="130">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.stats.status" :type="getStatusTagType(scope.row.stats.status)" effect="dark">
            {{ scope.row.stats.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.Critical')" prop="stats.4" />
      <el-table-column align="center" :label="$t('WebInspect.HighSeverity')" prop="stats.3" />
      <el-table-column align="center" :label="$t('WebInspect.MediumSeverity')" prop="stats.2" />
      <el-table-column align="center" :label="$t('WebInspect.LowSeverity')" prop="stats.1" />
      <el-table-column align="center" :label="$t('WebInspect.InfoSeverity')" prop="stats.0" />
      <el-table-column-time :label="$t('WebInspect.RunAt')" prop="run_at" />
      <el-table-column align="center" :label="$t('WebInspect.Report')" min-width="100">
        <template slot-scope="scope">
          <el-link
            type="primary"
            style="font-size: 16px"
            :disabled="!scope.row.scan_id"
            :underline="false"
            @click="fetchTestReport(scope.row.scan_id)"
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
