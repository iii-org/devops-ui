<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import {
  getCheckMarxScans,
  getCheckMarxScanStatus,
  getCheckMarxScanStats,
  registerCheckMarxReport,
  getCheckMarxReportStatus,
  getCheckMarxReport
} from '@/api/checkMarx'

export default {
  name: 'CheckMarx',
  components: { ProjectListSelector, Pagination },
  data: () => ({
    checkMarxScans: [],
    listLoading: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId', 'userRole']),
    pagedData() {
      const listData = this.checkMarxScans.filter(data => {
        const isScanId = data.scan_id.toString().includes(this.searchData.toString())
        if (!this.searchData || isScanId) return data
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  watch: {
    projectSelectedId() {
      this.fetchCheckMarxScans()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.fetchCheckMarxScans()
  },
  methods: {
    async fetchCheckMarxScans() {
      this.listLoading = true
      if (this.projectSelectedId !== -1) {
        await getCheckMarxScans(this.projectSelectedId).then(res => {
          this.checkMarxScans = res.data.map(item => item)
        })
        this.updateMarxScansStatus()
      }
      this.listLoading = false
    },
    updateMarxScansStatus() {
      this.checkMarxScans.forEach(item => {
        if (item.status === null) this.fetchStatus(item.scan_id)
        if (item.report_id === -1) this.registerReport(item.scan_id)
        if (item.report_id !== -1 && !item.report_ready) this.fetchReportStatus(item.report_id)
      })
    },
    fetchStatus(scanId) {
      getCheckMarxScanStatus(scanId).then(res => {
        const idx = this.checkMarxScans.findIndex(item => item.scan_id === scanId)
        this.checkMarxScans[idx].status = res.data.name
        if (res.data.id === 7) this.fetchStats(scanId)
      })
    },
    fetchStats(scanId) {
      getCheckMarxScanStats(scanId).then(res => {
        const idx = this.checkMarxScans.findIndex(item => item.scan_id === scanId)
        this.checkMarxScans[idx].stats = res.data
      })
    },
    registerReport(scanId) {
      registerCheckMarxReport(scanId).then(res => {
        const idx = this.checkMarxScans.findIndex(item => item.scan_id === scanId)
        this.checkMarxScans[idx].reportId = res.data.reportId
      })
    },
    fetchReportStatus(reportId) {
      getCheckMarxReportStatus(reportId).then(res => {
        const idx = this.checkMarxScans.findIndex(item => item.report_id === reportId)
        if (res.data.id === 2) this.checkMarxScans[idx].report_ready = true
      })
    },
    fetchTestReport(reportId) {
      getCheckMarxReport(reportId).then(res => {
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'checkmarx_Report.pdf')
        document.body.appendChild(link)
        link.click()
      })
    },

    onPagination(listQuery) {
      this.listQuery = listQuery
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
    <el-table v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row :data="pagedData">
      <el-table-column align="center" :label="$t('CheckMarx.ScanId')" prop="scan_id" min-width="110" />
      <el-table-column align="center" :label="$t('CheckMarx.Branch')" prop="branch" min-width="90" />
      <el-table-column align="center" :label="$t('CheckMarx.Commit')" min-width="95">
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
      <el-table-column align="center" :label="$t('CheckMarx.Status')" prop="status" min-width="100" />
      <el-table-column align="center" :label="$t('CheckMarx.HighSeverity')" prop="stats.highSeverity" min-width="135" />
      <el-table-column
        align="center"
        :label="$t('CheckMarx.MediumSeverity')"
        prop="stats.mediumSeverity"
        min-width="165"
      />
      <el-table-column align="center" :label="$t('CheckMarx.LowSeverity')" prop="stats.lowSeverity" min-width="135" />
      <el-table-column align="center" :label="$t('CheckMarx.InfoSeverity')" prop="stats.infoSeverity" min-width="130" />
      <el-table-column align="center" :label="$t('CheckMarx.RunAt')" width="190">
        <template slot-scope="scope">
          <span class="ml-2">{{ scope.row.run_at | UTCtoLocalTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('CheckMarx.Report')" prop="report_ready" min-width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.report_ready"
            type="primary"
            target="_blank"
            style="font-size: 16px"
            class="download-btn"
            :underline="false"
            @click="fetchTestReport(scope.row.report_id)"
          >
            <i class="el-icon-download" style="font-size: 16px" />
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<style lang="scss" scoped>
.clearfix {
  clear: both;
}
</style>
