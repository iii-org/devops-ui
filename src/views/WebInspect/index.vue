<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { getWebInspectScans, getWebInspectStatus, getWebInspectStats, getWebInspectReport } from '@/api/webInspect'
import ProjectListSelector from '../../components/ProjectListSelector'

export default {
  name: 'WebInspect',
  components: { ProjectListSelector, Pagination },
  data() {
    return {
      webInspectScans: [],
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
      this.fetchWebInspectScans(this.projectSelectedObject.name)
    }
  },
  created() {
    this.fetchWebInspectScans(this.projectSelectedObject.name)
  },

  methods: {
    async fetchWebInspectScans(projectName) {
      this.listLoading = true
      await getWebInspectScans(projectName).then(res => {
        this.webInspectScans = res.data.map(item => item)
      })
      this.updateWebInspectStatus()
      this.listLoading = false
    },
    updateWebInspectStatus() {
      this.webInspectScans.forEach(item => {
        if (!item.finished) this.fetchStatus(item.scan_id)
        // if (item.stats === null) this.fetchStats(item.scan_id)
      })
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
        this.webInspectScans[idx].stats = res.data
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
      <el-table-column align="center" :label="$t('WebInspect.Branch')" prop="branch" />
      <el-table-column align="center" :label="$t('WebInspect.CommitId')" prop="commit_id" />
      <el-table-column align="center" :label="$t('WebInspect.ProjectName')" prop="project_name" />
      <el-table-column align="center" :label="$t('WebInspect.Stats')" prop="stats" />
      <el-table-column align="center" :label="$t('WebInspect.RunAt')" width="200">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.run_at | YMDhmA }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.Report')">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.scan_id"
            target="_blank"
            type="primary"
            :underline="false"
            class="download-btn"
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
