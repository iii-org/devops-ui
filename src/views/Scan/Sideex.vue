<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <ScanLogButton slot="button" />
      <el-input
        v-model="keyword"
        :placeholder="$t('Git.searchBranchOrCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </ProjectListSelector>
    <el-divider />
    <p class="text-right text-info">
      <em class="el-icon-warning" />{{ $t('Sideex.promptMessage') }}
    </p>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      :data="pagedData"
    >
      <el-table-column
        align="center"
        :label="$t('Log.testId')"
        prop="id"
      />
      <el-table-column
        align="center"
        :label="$t('Git.Branch')"
        prop="branch"
      />
      <el-table-column
        align="center"
        :label="$t('Git.Commit')"
        prop="commit_id"
        width="140"
      >
        <template slot-scope="scope">
          <el-link
            class="linkTextColor"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.issue_link"
          >
            <svg-icon
              class="mr-1"
              icon-class="ion-git-commit-outline"
            />{{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-tag
        prop="status"
        min-width="130"
        location="sideex"
        i18n-key="Status"
      />
      <el-table-column
        align="center"
        :label="$t('Sideex.suitesPassedRatio')"
      >
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">
            {{ scope.row.result.suitesPassed }}/{{ scope.row.result.suitesTotal }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Sideex.casesPassedRatio')"
      >
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">
            {{ scope.row.result.casesPassed }}/{{ scope.row.result.casesTotal }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column-time
        :label="$t('general.RunAt')"
        prop="run_at"
      />
      <el-table-column
        align="center"
        :label="$t('Log.duration')"
      >
        <template slot-scope="scope">
          {{ durationText(scope.row.run_at, scope.row.finished_at) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Log.fullLog')"
      >
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.status === 'Finished' && scope.row.has_report"
            placement="bottom"
<<<<<<< HEAD
            :content="$t('Log.fullLog')"
=======
            :content="$t('Dashboard.Report')"
>>>>>>> 7b6e71d1 (feat: modify table button layout)
          >
            <em
              class="ri-external-link-line active operate-button"
              @click="fetchReportData(scope.row.id)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-row>
</template>

<script>
import { getSideexScans, getSideexReport } from '@/api/sideex'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import {
  ProjectListSelector,
  ElTableColumnTime,
  ElTableColumnTag
} from '@/components'
import ScanLogButton from './ScanLogButton'
import { getDurationTime } from '@/utils/handleTime'

export default {
  name: 'ScanSideex',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    ElTableColumnTag,
    ScanLogButton
  },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      confirmLoading: false,
      searchKeys: ['branch', 'commit_id']
    }
  },
  methods: {
    async fetchData() {
      const res = await getSideexScans(this.selectedProjectId)
      return this.handleScans(res.data)
    },
    handleScans(scans) {
      const sortedScans = scans.map((scan) => {
        if (scan.result === 'None') scan.result = {}
        return scan
      })
      sortedScans.sort((a, b) => new Date(b.run_at) - new Date(a.run_at))
      return sortedScans
    },
    durationText(start, end) {
      return getDurationTime(start, end)
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
