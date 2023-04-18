<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <ScanLogButton slot="button" />
      <el-input
        v-model="keyword"
        class="mr-3"
        :placeholder="$t('Git.searchBranchOrCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
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
      >{{ $t('general.Refresh') }}</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="pagedData"
      fit
    >
      <el-table-column
        align="center"
        :label="$t('WebInspect.ScanId')"
        prop="scan_id"
        min-width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        align="center"
        :label="$t('WebInspect.Branch')"
        prop="branch"
        min-width="120"
      />
      <el-table-column
        align="center"
        :label="$t('WebInspect.Commit')"
        prop="commit_id"
        min-width="120"
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
      <el-table-column
        align="center"
        :label="$t('general.Status')"
        prop="status"
        min-width="130"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.status"
            class="el-tag--circle"
            :type="mapStatusTagType(scope.row.status)"
            effect="dark"
          >
            {{ $t(`Status.${scope.row.status}`) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('WebInspect.Critical')"
      >
        <template slot-scope="scope">
          {{ typeof scope.row.state.critical === 'number' ? scope.row.state.critical : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('WebInspect.HighSeverity')"
        prop="state.high"
      >
        <template slot-scope="scope">
          {{ typeof scope.row.state.high === 'number' ? scope.row.state.high : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('WebInspect.MediumSeverity')"
        prop="state.medium"
      >
        <template slot-scope="scope">
          {{ typeof scope.row.state.medium === 'number' ? scope.row.state.medium : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('WebInspect.LowSeverity')"
        prop="state.low"
      >
        <template slot-scope="scope">
          {{ typeof scope.row.state.low === 'number' ? scope.row.state.low : '-' }}
        </template>
      </el-table-column>
      <el-table-column-time
        :label="$t('WebInspect.RunAt')"
        prop="run_at"
      />
      <el-table-column
        align="center"
        :label="$t('WebInspect.Report')"
      >
        <template slot-scope="scope">
          <el-tooltip
<<<<<<< HEAD
            v-if="scope.row.status === 'Finished'"
            placement="bottom"
            :content="$t('Dashboard.Report')"
          >
            <div :class="!scope.row.scan_id || scope.row.stats.status !== 'Complete'
=======
            placement="bottom"
            :content="$t('Dashboard.Report')"
          >
            <div :class="!scope.row.scan_id || scope.row.report_status !== 'Finished'
>>>>>>> e406ea9c (feat: modify webinspect component (#5120 #5121 #5122))
              ? 'disabled'
              : ''"
            >
              <em
<<<<<<< HEAD
                :class="!scope.row.scan_id || scope.row.stats.status !== 'Complete'
                  ? 'ri-file-list-2-line disabled operate-button'
                  : 'ri-file-list-2-line active operate-button'"
                @click="handleTestReportDetail(scope.row)"
              />
=======
                :class="!scope.row.scan_id || scope.row.report_status !== 'Finished'
                  ? 'ri-file-list-2-line disabled operate-button'
                  : 'ri-file-list-2-line active operate-button'"
                @click="handleDownloadReport(scope.row)"
              />
              <div class="text-xs">
                {{ scope.row.report_status ? $t(`Status.${scope.row.report_status}`) : '' }}
              </div>
>>>>>>> e406ea9c (feat: modify webinspect component (#5120 #5121 #5122))
            </div>
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
      @pagination="handleCurrentChange"
    />
  </el-row>
</template>

<script>
import { getWebInspectScans, getWebInspectReport } from '@/api/webInspect'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { ProjectListSelector, ElTableColumnTime } from '@/components'
import { downloadFileFromBinary } from '@/utils/downloadFile'
import ScanLogButton from './ScanLogButton'

export default {
  name: 'ScanWebInspect',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    ScanLogButton
  },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      searchKeys: ['branch', 'commit_id'],
      pod: {}
    }
  },
  methods: {
    async fetchData() {
      return await getWebInspectScans(this.selectedProjectId, this.listQuery)
        .then((res) => {
          return res.data
        })
        .catch((err) => {
          console.error(err)
        })
    },
    async handleDownloadReport(row) {
      const { scan_id } = row
      await getWebInspectReport(this.selectedProjectId, { scan_id })
        .then((res) => {
          downloadFileFromBinary(res, 'WebInspect_Report.pdf')
        })
        .catch((err) => {
          console.error(err)
          this.$message({
            title: this.$t('general.Error'),
            message: this.$t('Notify.DownloadFailed'),
            type: 'error'
          })
        })
    },
    mapStatusTagType(status) {
      const mapKey = {
        Failed: 'danger',
        Created: 'slow',
        Queued: 'warning',
        ResumeScanQueued: 'warning',
        Pending: 'warning',
        Paused: 'warning',
        Running: 'slow',
        Complete: 'success',
        Interrupted: 'info',
        Unknown: 'danger'
      }
      return mapKey[status] || 'slow'
    }
  }
}
</script>

<style lang="scss" scoped>
.disabled {
  cursor: not-allowed;
}
</style>
