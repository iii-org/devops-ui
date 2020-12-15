<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import {
  getCheckMarxScans,
  getCheckMarxScanStatus,
  getCheckMarxScanStats,
  registerCheckMarxReport,
  getCheckMarxReportStatus,
  getCheckMarxReport
} from '@/api/checkMarx'
import ProjectListSelector from '../../components/ProjectListSelector'

export default {
  components: { ProjectListSelector, Pagination },

  data() {
    return {
      checkMarxScans: [],

      listLoading: false,
      listQuery: {
        page: 1, // 目前第幾頁
        limit: 10 // 一頁幾筆
      },
      listTotal: 0, // 總筆數
      confirmLoading: false,
      searchData: ''
    }
  },

  computed: {
    ...mapGetters(['projectSelectedId', 'userRole']),

    pagedData() {
      const listData = this.checkMarxScans.filter(data => {
        if (this.searchData === '' || data.scan_id.toString().includes(this.searchData.toString())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },

  watch: {
    projectSelectedId() {
      this.fetchCheckMarxScans(this.projectSelectedId)
    }
  },

  created() {
    this.fetchCheckMarxScans(this.projectSelectedId)
  },

  methods: {
    async fetchCheckMarxScans(projectId) {
      this.listLoading = true
      await getCheckMarxScans(projectId).then(res => {
        this.checkMarxScans = res.data.map(item => item)
      })
      this.updateMarxScansStatus()
      this.listLoading = false
    },

    updateMarxScansStatus() {
      this.checkMarxScans.forEach(item => {
        if (item.status === null) this.fetchStatus(item.scan_id)
        if (item.report_id === -1) this.rigisterReport(item.scan_id)
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

    rigisterReport(scanId) {
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

    async fetchTestReport(reportId) {
      this.ProjectTestLoading = true
      await getCheckMarxReport(reportId).then(res => {
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'checkmarx_Report.pdf')
        document.body.appendChild(link)
        link.click()
      })
      this.ProjectTestLoading = false
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
      <el-table-column align="center" :label="$t('CheckMarx.ScanId')" prop="scan_id" />

      <el-table-column align="center" :label="$t('CheckMarx.Branch')" prop="branch" />

      <el-table-column align="center" :label="$t('CheckMarx.Commit')" prop="commit_id" />

      <el-table-column align="center" :label="$t('CheckMarx.Status')" prop="status" />

      <el-table-column align="center" :label="$t('CheckMarx.HighSeverity')" prop="stats.highSeverity" />

      <el-table-column align="center" :label="$t('CheckMarx.MediumSeverity')" prop="stats.mediumSeverity" />

      <el-table-column align="center" :label="$t('CheckMarx.LowSeverity')" prop="stats.lowSeverity" />

      <el-table-column align="center" :label="$t('CheckMarx.InfoSeverity')" prop="stats.infoSeverity" />

      <el-table-column align="center" :label="$t('CheckMarx.Status')" width="200">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.run_at | YMDhmA }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('CheckMarx.Report')" prop="report_ready">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.report_ready"
            target="_blank"
            type="primary"
            :underline="false"
            class="download-btn"
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
