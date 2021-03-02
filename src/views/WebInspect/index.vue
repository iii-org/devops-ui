<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getWebInspectScans, getWebInspectStatus, getWebInspectStats, getWebInspectReport } from '@/api/webInspect'

export default {
  name: 'WebInspect',
  components: { ProjectListSelector, Pagination },
  data: () => ({
    webInspectScans: [],
    listLoading: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    confirmLoading: false,
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedObject']),
    pagedData() {
      const listData = this.webInspectScans.filter(data => {
        const isCommitId = data.commit_id.toString().includes(this.searchData.toString())
        if (!this.searchData || isCommitId) return data
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  watch: {
    projectSelectedObject() {
      this.fetchWebInspectScans()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.fetchWebInspectScans()
  },
  methods: {
    async fetchWebInspectScans() {
      this.listLoading = true
      const rName = this.projectSelectedObject.name || this.projectSelectedObject[0].name
      await getWebInspectScans(rName).then(res => {
        this.webInspectScans = this.handleScans(res.data)
      })
      await this.updateWebInspectScans()
      this.listLoading = false
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
      this.webInspectScans.forEach(item => {
        if (!item.finished) this.fetchStatus(item.scan_id)
      })
    },
    async fetchStatus(wiScanId) {
      this.listLoading = true
      getWebInspectStatus(wiScanId).then(res => {
        const idx = this.webInspectScans.findIndex(item => item.scan_id === wiScanId)
        this.webInspectScans[idx].stats.status = res.data.status
        if (res.data.status === 'Complete') this.fetchStats(wiScanId)
      })
      this.listLoading = false
    },
    async fetchStats(wiScanId) {
      this.listLoading = true
      await getWebInspectStats(wiScanId).then(res => {
        const idx = this.webInspectScans.findIndex(item => item.scan_id === wiScanId)
        this.webInspectScans[idx].stats = res.data.severity_count
        this.webInspectScans[idx].stats.status = 'Complete'
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
    <el-table v-loading="listLoading" :element-loading-text="$t('Loading')" border fit highlight-current-row :data="pagedData">
      <el-table-column align="center" :label="$t('WebInspect.ScanId')" prop="scan_id" min-width="200" />
      <el-table-column align="center" :label="$t('WebInspect.Branch')" prop="branch" min-width="180" />
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
      <el-table-column align="center" :label="$t('WebInspect.Critical')" prop="stats.4" min-width="100" />
      <el-table-column align="center" :label="$t('WebInspect.HighSeverity')" prop="stats.3" min-width="140" />
      <el-table-column align="center" :label="$t('WebInspect.MediumSeverity')" prop="stats.2" min-width="165" />
      <el-table-column align="center" :label="$t('WebInspect.LowSeverity')" prop="stats.1" min-width="140" />
      <el-table-column align="center" :label="$t('WebInspect.InfoSeverity')" prop="stats.0" min-width="140" />
      <el-table-column align="center" :label="$t('WebInspect.RunAt')" min-width="190">
        <template slot-scope="scope">
          <span class="ml-2">{{ scope.row.run_at | formatToLocaleTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.Report')" min-width="100">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.scan_id"
            type="primary"
            style="font-size: 16px"
            :underline="false"
            @click="fetchTestReport(scope.row.scan_id)"
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
