<script>
import { mapGetters } from 'vuex'
import {
  getCheckMarxReport,
  getCheckMarxReportStatus,
  getCheckMarxScans,
  getCheckMarxScanStats,
  getCheckMarxScanStatus,
  registerCheckMarxReport
} from '@/api/checkMarx'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ScanCheckmarx',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    searchKey: 'scan_id'
  }),
  computed: {
    ...mapGetters(['userRole'])
  },
  watch: {
    listData: function() {
      this.updateCheckMarxScansStatus(this.listData)
    }
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        return []
      }
      const res = await getCheckMarxScans(this.selectedProjectId)
      return res.data
    },
    async updateCheckMarxScansStatus(listData) {
      listData.forEach(item => {
        if (item.status === null) {
          this.fetchScanStatus(item.scan_id)
          return
        }
        if (item.report_id && !item.report_ready) {
          this.fetchReportStatus(item.report_id)
        }
      })
    },
    fetchScanStatus(scanId) {
      this.listLoading = true
      getCheckMarxScanStatus(scanId)
        .then(res => {
          const idx = this.listData.findIndex(item => item.scan_id === scanId)
          this.listData[idx].status = res.data.name
          if (res.data.id === 7) {
            this.fetchScanStats(scanId)
            this.registerReport(scanId)
          }
        })
        .then(() => {
          this.listLoading = false
        })
    },
    fetchScanStats(scanId) {
      getCheckMarxScanStats(scanId).then(res => {
        const idx = this.listData.findIndex(item => item.scan_id === scanId)
        this.listData[idx].stats = res.data
      })
    },
    registerReport(scanId) {
      this.listLoading = true
      registerCheckMarxReport(scanId).then(res => {
        const idx = this.listData.findIndex(item => item.scan_id === scanId)
        this.listData[idx].reportId = res.data.reportId
        if (res.data.reportId > 0) {
          this.fetchReportStatus(res.data.reportId)
        }
      })
      this.listLoading = false
    },
    fetchReportStatus(reportId) {
      this.listLoading = true
      getCheckMarxReportStatus(reportId).then(res => {
        const idx = this.listData.findIndex(item => item.report_id === reportId)
        if (res.data.id === 2) {
          this.listData[idx].report_ready = true
        }
      })
      this.listLoading = false
    },
    fetchTestReport(reportId, scanId) {
      getCheckMarxReport(reportId)
        .then(res => {
          const url = window.URL.createObjectURL(new Blob([res]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'checkmarx_Report.pdf')
          document.body.appendChild(link)
          link.click()
        })
        .catch(_ => {
          this.registerReport(scanId)
          this.loadData()
        })
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
        :placeholder="$t('CheckMarx.SearchScanId')"
        prefix-icon="el-icon-search"
        style="width: 250px"
      />
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
      <el-table-column align="center" :label="$t('CheckMarx.ScanId')" prop="scan_id" width="110" />
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
            :disabled="!scope.row.report_ready"
            :underline="false"
            icon="el-icon-download"
            @click="fetchTestReport(scope.row.report_id, scope.row.scan_id)"
          />
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
