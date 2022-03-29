<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <el-input
        v-model="keyword"
        :placeholder="$t('CheckMarx.SearchScanId')"
        prefix-icon="el-icon-search"
        style="width: 250px"
      />
    </ProjectListSelector>
    <el-divider />
    <div class="text-right mb-2">
      <el-button
        class="buttonPrimaryReverse"
        icon="el-icon-refresh"
        size="mini"
        plain
        @click="loadData"
      >
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="pagedData"
      fit
      height="100%"
      :cell-style="{ 'text-align': 'center' }"
      :header-cell-style="{ 'text-align': 'center' }"
    >
      <el-table-column
        :label="$t('CheckMarx.ScanId')"
        prop="scan_id"
        width="110"
      />
      <el-table-column
        :label="$t('Git.Branch')"
        prop="branch"
      />
      <el-table-column
        :label="$t('Git.Commit')"
        width="140"
      >
        <template slot-scope="scope">
          <el-link
            class="linkTextColor"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.commit_url"
          >
            <svg-icon
              class="mr-1"
              icon-class="ion-git-commit-outline"
            />{{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Status')">
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.status"
            class="el-tag--circle"
            :type="handleType(scope.row.status)"
            :effect="getTagEffect(scope.row.status)"
          >
            <span>{{ $t(`CheckMarx.${scope.row.status}`) }}</span>
          </el-tag>
          <el-tooltip
            v-if="isInQueued(scope.row) && scope.row.queue"
            class="item"
            effect="dark"
            :content="$t('CheckMarx.QueueTooltip')"
            placement="bottom"
          >
            <el-link class="text-xs">
              {{ $t('CheckMarx.QueueSequence') }}: {{ scope.row.queue }}
            </el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('CheckMarx.HighSeverity')"
        prop="stats.highSeverity"
      />
      <el-table-column
        :label="$t('CheckMarx.MediumSeverity')"
        prop="stats.mediumSeverity"
      />
      <el-table-column
        :label="$t('CheckMarx.LowSeverity')"
        prop="stats.lowSeverity"
      />
      <el-table-column
        :label="$t('CheckMarx.InfoSeverity')"
        prop="stats.infoSeverity"
      />
      <el-table-column-time
        prop="run_at"
        :label="$t('CheckMarx.RunAt')"
      />
      <el-table-column
        :label="$t('CheckMarx.Report')"
        prop="report_ready"
        width="100"
      >
        <template slot-scope="scope">
          <template v-if="canBeCanceled(scope.row)">
            <el-link
              type="danger"
              style="font-size: 16px"
              :underline="false"
              icon="el-icon-close"
              @click="cancelScans(scope.row)"
            />
            <div class="text-sm">
              {{ $t('general.Cancel') }}
            </div>
          </template>
          <div v-else-if="isException(scope.row)">-</div>
          <template v-else-if="isInProcess(scope.row)">
            <el-link
              :class="!scope.row.report_ready ? '' : 'linkTextColor'"
              target="_blank"
              style="font-size: 16px"
              :disabled="!scope.row.report_ready"
              :underline="false"
              icon="el-icon-download"
              @click="fetchTestReport(scope.row)"
            />
            <div class="text-sm">
              {{ scope.row.report_ready ? '' : $t('CheckMarx.InProcess') }}
            </div>
          </template>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
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
import {
  getCheckMarxReport,
  getCheckMarxReportStatus,
  getCheckMarxScans,
  getCheckMarxScanStats,
  getCheckMarxScanStatus,
  registerCheckMarxReport,
  cancelCheckMarxScans
} from '@/api/checkMarx'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { ElTableColumnTime } from '@/components'
import * as elementTagType from '@/utils/element-tag-type'

export default {
  name: 'ScanCheckmarx',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      searchKeys: ['scan_id']
    }
  },
  watch: {
    listData() {
      this.updateCheckMarxScansStatus(this.listData)
    }
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) return []
      const res = await getCheckMarxScans(this.selectedProjectId)
      return res.data
    },
    async updateCheckMarxScansStatus(listData) {
      listData.forEach((item) => {
        const { status, scan_id, report_id, report_ready } = item
        if (status === null) {
          this.fetchScanStatus(scan_id)
          return
        }
        if (report_id && report_id > 0 && !report_ready) {
          this.fetchReportStatus(report_id)
        }
      })
    },
    fetchScanStatus(scanId) {
      this.listLoading = true
      getCheckMarxScanStatus(scanId)
        .then((res) => {
          const idx = this.listData.findIndex((item) => item.scan_id === scanId)
          this.listData[idx].status = res.data.name
          this.listData[idx].queue = res.data.queue_position
          this.listData[idx].id = res.data.id
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
      getCheckMarxScanStats(scanId).then((res) => {
        const idx = this.listData.findIndex((item) => item.scan_id === scanId)
        this.listData[idx].stats = res.data
      })
    },
    registerReport(scanId) {
      this.listLoading = true
      registerCheckMarxReport(scanId).then((res) => {
        const { reportId } = res.data
        const idx = this.listData.findIndex((item) => item.scan_id === scanId)
        this.listData[idx].report_id = reportId
        if (reportId > 0) this.fetchReportStatus(reportId)
      })
      this.listLoading = false
    },
    fetchReportStatus(reportId) {
      this.listLoading = true
      getCheckMarxReportStatus(reportId).then((res) => {
        const idx = this.listData.findIndex((item) => item.report_id === reportId)
        if (res.data.id === 1) {
          this.listData[idx].report_ready = false
        }
        if (res.data.id === 2) {
          this.listData[idx].report_ready = true
        }
      })
      this.listLoading = false
    },
    fetchTestReport(row) {
      const { report_id, scan_id } = row
      getCheckMarxReport(report_id)
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'checkmarx_Report.pdf')
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch((_) => {
          this.confirmRegistryReport(scan_id)
        })
    },
    confirmRegistryReport(scan_id) {
      const h = this.$createElement
      this.$msgbox({
        title: this.$t('general.caution'),
        type: 'warning',
        message: h('p', null, [
          h('div', { style: 'font-size: large' }, this.$t('CheckMarx.registryReport')),
          h('div', { style: 'color: red' }, this.$t('CheckMarx.registryReportTip'))
        ]),
        showCancelButton: true,
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel')
      }).then(() => {
        this.registerReport(scan_id)
      })
    },
    async cancelScans(row) {
      const { scan_id } = row
      let hasError = false
      try {
        await cancelCheckMarxScans(scan_id)
      } catch (error) {
        hasError = true
        console.error(error)
      } finally {
        if (!hasError) {
          await this.loadData()
          this.$message({
            message: this.$t('CheckMarx.cancelScansMessage', [scan_id]),
            type: 'warning'
          })
        }
      }
    },
    /**
     * all status of checkmarx's scan:
     * 1: New, 2: PreScan, 3: Queued, 4: Scanning, 6: PostScan, 7: Finished, 8: Canceled, 9: Failed
     */
    isInQueued(row) {
      return row.status === 'New' || row.status === 'PreScan' || row.status === 'Queued'
    },
    // if the scan's status are PreScan, Queued or Scanning, users can cancel the scans
    canBeCanceled(row) {
      return row.status === 'PreScan' || row.status === 'Queued' || row.status === 'Scanning'
    },
    isInProcess(row) {
      return row.status !== 'Failed' && row.status !== 'Canceled'
    },
    // the scans report sometimes wouldn't be produced when they have been scanned
    isException(row) {
      return row.status === 'Finished' && row.report_id === -1
    },
    handleType(prop) {
      const location = 'checkMarx'
      return elementTagType[location][prop] || 'default'
    },
    getTagEffect(status) {
      const tagMap = { Building: 'light' }
      return tagMap[status] || 'dark'
    }
  }
}
</script>
