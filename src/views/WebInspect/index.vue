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
    ...mapGetters(['projectSelectedObject', 'userRole']),
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
  created() {
    this.fetchWebInspectScans()
  },
  methods: {
    async fetchWebInspectScans() {
      this.listLoading = true
      const rName = this.projectSelectedObject.name || this.projectSelectedObject[0].name
      await getWebInspectScans(rName).then(res => {
        this.webInspectScans = this.handleScans(res.data)
      })
      await this.updateWebInspectStatus()

      this.listLoading = false
    },
    handleScans(scans) {
      const sortedScans = scans.map(scan => {
        const result = Object.assign({}, scan)
        if (result.stats === 'None') result.stats = {}
        result['status'] = ''
        return result
      })
      sortedScans.sort((a, b) => new Date(b.run_at) - new Date(a.run_at))
      return sortedScans
    },
    updateWebInspectStatus() {
      this.listLoading = true
      this.webInspectScans.forEach(item => {
        if (!item.status) this.fetchStatus(item.scan_id)
        if (item.stats === null) this.fetchStats(item.scan_id)
      })
      this.listLoading = false
    },
    fetchStatus(wiScanId) {
      getWebInspectStatus(wiScanId).then(res => {
        const idx = this.webInspectScans.findIndex(item => item.scan_id === wiScanId)
        this.webInspectScans[idx].status = res.data.status
      })
    },
    fetchStats(wiScanId) {
      getWebInspectStats(wiScanId).then(res => {
        const idx = this.webInspectScans.findIndex(item => item.scan_id === wiScanId)
        // this.webInspectScans[idx].stats = res.data.severity_count
        if (res.data.severity_count === 'None') {
          this.webInspectScans[idx].stats = {}
        } else {
          this.webInspectScans[idx].stats = res.data.severity_count
        }
      })
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
        :placeholder="$t('WebInspect.SearchCommitId')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row :data="pagedData">
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
      <el-table-column align="center" :label="$t('WebInspect.Status')" prop="status" min-width="120" />
      <el-table-column align="center" :label="$t('WebInspect.Critical')" prop="stats.4" min-width="100" />
      <el-table-column align="center" :label="$t('WebInspect.HighSeverity')" prop="stats.3" min-width="140" />
      <el-table-column align="center" :label="$t('WebInspect.MediumSeverity')" prop="stats.2" min-width="165" />
      <el-table-column align="center" :label="$t('WebInspect.LowSeverity')" prop="stats.1" min-width="140" />
      <el-table-column align="center" :label="$t('WebInspect.InfoSeverity')" prop="stats.0" min-width="140" />
      <el-table-column align="center" :label="$t('WebInspect.RunAt')" min-width="190">
        <template slot-scope="scope">
          <span class="ml-2">{{ scope.row.run_at | formatTime }}</span>
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

<style lang="scss" scoped>
.clearfix {
  clear: both;
}
</style>
