<template>
  <el-row class="app-container" style="overflow: hidden;">
    <project-list-selector>
      <el-input
        v-model="keyword"
        :placeholder="$t('Git.searchCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </project-list-selector>
    <el-divider />
    <p class="text-right text-info">
      <i class="el-icon-warning" />{{ $t('Sideex.promptMessage') }}
    </p>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      height="100%"
    >
      <el-table-column align="center" :label="$t('Log.testId')" prop="id" />
      <el-table-column align="center" :label="$t('Git.Branch')" prop="branch" />
      <el-table-column align="center" :label="$t('Git.Commit')" prop="commit_id" width="140">
        <template slot-scope="scope">
          <el-link type="primary" target="_blank" style="font-size: 16px" :href="scope.row.issue_link">
            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-tag prop="status" min-width="130" location="sideex" />
      <el-table-column align="center" :label="$t('Sideex.suitesPassedRatio')">
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">
            {{ scope.row.result.suitesPassed }}/{{ scope.row.result.suitesTotal }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Sideex.casesPassedRatio')">
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">
            {{ scope.row.result.casesPassed }}/{{ scope.row.result.casesTotal }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column-time :label="$t('general.RunAt')" prop="run_at" />
      <el-table-column align="center" :label="$t('Log.duration')">
        <template slot-scope="scope">
          {{ durationText(scope.row.run_at, scope.row.finished_at) }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Log.fullLog')" min-width="50">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.status === 'Finished' && scope.row.has_report"
            type="primary"
            style="font-size: 16px"
            :underline="false"
            @click="fetchReportData(scope.row.id)"
          >
            <i class="el-icon-tickets" style="font-size: 16px" />
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
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import { getSideexScans, getSideexReport } from '@/api/sideex'

export default {
  name: 'ScanSideex',
  components: { ElTableColumnTime, ElTableColumnTag },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      confirmLoading: false,
      searchKeys: ['commit_id']
    }
  },
  methods: {
    async fetchData() {
      const res = await getSideexScans(this.selectedProjectId)
      return this.handleScans(res.data)
    },
    handleScans(scans) {
      const sortedScans = scans.map(scan => {
        if (scan.result === 'None') scan.result = {}
        return scan
      })
      sortedScans.sort((a, b) => new Date(b.run_at) - new Date(a.run_at))
      return sortedScans
    },
    durationText(start, end) {
      if (end == null) return ''
      const s = this.$dayjs.utc(start).unix()
      const e = this.$dayjs.utc(end).unix()
      return this.$dayjs.duration(e - s, 'seconds').humanize()
    },
    async fetchReportData(selectedSideexId) {
      const res = await getSideexReport(selectedSideexId)
      this.showFullLog(res.data)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    }
  }
}
</script>
