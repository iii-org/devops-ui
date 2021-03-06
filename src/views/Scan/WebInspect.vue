<template>
  <el-row class="app-container" style="overflow: hidden;">
    <project-list-selector>
      <el-input
        v-model="keyword"
        class="mr-3"
        :placeholder="$t('WebInspect.SearchCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </project-list-selector>
    <el-divider />
    <div class="text-right mb-2">
      <el-button type="primary" icon="el-icon-refresh" size="mini" plain @click="loadData">{{ $t('general.Refresh') }}</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="pagedData"
      height="60vh"
      fit
      border
    >
      <el-table-column
        align="center"
        :label="$t('WebInspect.ScanId')"
        prop="scan_id"
        min-width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column align="center" :label="$t('WebInspect.Branch')" prop="branch" min-width="120" />
      <el-table-column align="center" :label="$t('WebInspect.Commit')" prop="commit_id" min-width="120">
        <template slot-scope="scope">
          <el-link type="primary" target="_blank" style="font-size: 16px" :href="scope.row.issue_link">
            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Status')" prop="stats.status" min-width="130">
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.stats.status"
            class="el-tag--circle"
            :type="mapStatusTagType(scope.row.stats.status)"
            effect="dark"
          >
            {{ scope.row.stats.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.Critical')" prop="stats.criticalCount" />
      <el-table-column align="center" :label="$t('WebInspect.HighSeverity')" prop="stats.highCount" />
      <el-table-column align="center" :label="$t('WebInspect.MediumSeverity')" prop="stats.mediumCount" />
      <el-table-column align="center" :label="$t('WebInspect.LowSeverity')" prop="stats.lowCount" />
      <el-table-column align="center" :label="$t('WebInspect.InfoSeverity')" prop="stats.infoCount" />
      <el-table-column align="center" :label="$t('WebInspect.BpSeverity')" prop="stats.bpCount">
        <template slot-scope="scope">
          <span v-if="scope.row.stats.bpCount">{{ scope.row.stats.bpCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column-time :label="$t('WebInspect.RunAt')" prop="run_at" />
      <el-table-column align="center" :label="$t('WebInspect.Report')">
        <template slot-scope="scope">
          <el-link
            type="primary"
            style="font-size: 16px"
            :disabled="!scope.row.scan_id || scope.row.stats.status !== 'Complete'"
            :underline="false"
            @click="handleTestReportDetail(scope.row)"
          >
            <i class="el-icon-document" style="font-size: 16px" />
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
  </el-row>
</template>

<script>
import { getWebInspectScans, getWebInspectStats, getWebInspectStatus } from '@/api/webInspect'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ScanWebInspect',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      confirmLoading: false,
      searchKeys: ['commit_id']
    }
  },
  watch: {
    listData() {
      this.updateWebInspectScans()
    }
  },
  methods: {
    async fetchData() {
      let scansData = []
      this.listLoading = true
      try {
        const rName = this.selectedProject.name
        if (!rName) return []
        const res = await getWebInspectScans(rName)
        scansData = this.handleScans(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.listLoading = false
      }
      return scansData
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
        this.$set(this.listData[idx].stats, 'status', res.data.status)
        if (res.data.status === 'Complete') this.fetchStats(wiScanId)
      })
      this.listLoading = false
    },
    async fetchStats(wiScanId) {
      this.listLoading = true
      await getWebInspectStats(wiScanId).then(res => {
        const idx = this.listData.findIndex(item => item.scan_id === wiScanId)
        // res data from WI length is 6, while WIE is 7
        if (res.data.severity_count.length === 7) {
          this.$set(this.listData[idx], 'stats', res.data.severity_count)
        } else {
          this.$set(this.listData[idx].stats, 'criticalCount', res.data.severity_count[4])
          this.$set(this.listData[idx].stats, 'highCount', res.data.severity_count[3])
          this.$set(this.listData[idx].stats, 'mediumCount', res.data.severity_count[2])
          this.$set(this.listData[idx].stats, 'lowCount', res.data.severity_count[1])
          this.$set(this.listData[idx].stats, 'infoCount', res.data.severity_count[0])
        }
        this.listData[idx].stats.status = 'Complete'
      })
      this.listLoading = false
    },
    handleTestReportDetail(row) {
      const { scan_id, run_at } = row
      this.$router.push({ name: 'webinspect-report', params: { scan_id, run_at }})
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    mapStatusTagType(status) {
      const mapKey = {
        Complete: 'success',
        Running: 'slow',
        NotRunning: 'warning',
        Interrupted: 'danger'
      }
      return mapKey[status] || 'slow'
    }
  }
}
</script>
