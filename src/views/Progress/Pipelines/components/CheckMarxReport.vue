<template>
  <div>
    <ToolBar>
      <span slot="toolName">CheckMarx</span>
      <span slot="warning" style="font-size: 14px;">
        * {{ $t('TestReport.WarningPartOne') }}
        <el-link class="linkTextColor" :underline="false" target="_blank" @click="openDevCheckMarx">
          {{ $t('TestReport.CheckMarxReport') }}
        </el-link>
        {{ $t('TestReport.WarningPartTwo') }}
      </span>
      <el-button slot="link" type="text" icon="el-icon-download" :class="!disabled ? 'linkTextColor' : ''" :disabled="disabled" @click="openCheckMarx">
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_checkmarx"
      v-loading="listLoading"
      class="mb-10"
      :element-loading-text="$t('Loading')"
      :data="checkmarx"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">CheckMarx</el-table-column>
      <el-table-column align="center" :label="$t('CheckMarx.HighSeverity')" prop="stats.highSeverity">
        <template slot-scope="scope">
          <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.highSeverity }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('CheckMarx.MediumSeverity')" prop="stats.mediumSeverity">
        <template slot-scope="scope">
          <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.mediumSeverity }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('CheckMarx.LowSeverity')" prop="stats.lowSeverity">
        <template slot-scope="scope">
          <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.lowSeverity }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('CheckMarx.InfoSeverity')" prop="stats.infoSeverity">
        <template slot-scope="scope">
          <span v-if="scope.row && scope.row.stats">{{ scope.row.stats.infoSeverity }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'
import { getCheckMarxReport, registerCheckMarxReport } from '@/api/checkMarx'

export default {
  name: 'Checkmarx',
  components: { ToolBar },
  props: {
    checkmarx: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    disabled() {
      return this.checkmarx[0] ? !this.checkmarx[0].report_ready : true
    }
  },
  methods: {
    async openCheckMarx() {
      const { report_id, scan_id } = this.checkmarx[0]
      await getCheckMarxReport(report_id)
        .then(res => {
          const url = window.URL.createObjectURL(new Blob([res]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'checkmarx_Report.pdf')
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch(_ => {
          this.confirmRegistryReport(scan_id)
        })
    },
    confirmRegistryReport(scan_id) {
      const h = this.$createElement
      this.$msgbox({
        title: this.$t('general.caution'),
        type: 'warning',
        message: h('p', null, [h('div', { style: 'font-size: large' }, this.$t('CheckMarx.registryReport')), h('div', { style: 'color: red' }, this.$t('CheckMarx.registryReportTip'))]),
        showCancelButton: true,
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel')
      }).then(() => {
        this.registerReport(scan_id)
      })
    },
    async registerReport(scanId) {
      this.listLoading = true
      await registerCheckMarxReport(scanId).then(res => {
        const { reportId } = res.data
        const idx = this.listData.findIndex(item => item.scan_id === scanId)
        this.listData[idx].report_id = reportId
        if (reportId > 0) this.fetchReportStatus(reportId)
      })
      this.listLoading = false
    },
    openDevCheckMarx() {
      const routeUrl = this.$router.resolve({ name: 'Checkmarx' })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
