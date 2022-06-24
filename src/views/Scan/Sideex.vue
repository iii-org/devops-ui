<template>
  <el-row
    class="app-container"
    style="overflow: hidden;"
  >
    <ProjectListSelector>
      <el-button
        v-if="pod.has_pod"
        slot="button"
        class="buttonPrimary"
        :disabled="selectedProjectId === -1"
        @click="handleLogClick"
      >
        <em class="ri-computer-line mr-1" />
        {{ $t('SonarQube.ScanLogs') }}
      </el-button>
      <el-input
        v-model="keyword"
        :placeholder="$t('CheckMarx.SearchScanId')"
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
      height="100%"
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
        min-width="50"
      >
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.status === 'Finished' && scope.row.has_report"
            class="linkTextColor"
            style="font-size: 16px"
            :underline="false"
            @click="fetchReportData(scope.row.id)"
          >
            <em
              class="el-icon-tickets"
              style="font-size: 16px"
            />
          </el-link>
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
    <PodLog
      ref="podLogDialog"
      :pod-name="pod.pod_name"
      :container-name="pod.container_name"
    />
  </el-row>
</template>

<script>
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import { getSideexScans, getSideexReport } from '@/api/sideex'
import { getSideexPod } from '@/api_v2/sideex'
import PodLog from '@/views/SystemResource/PluginResource/components/PodsList/components/PodLog'

export default {
  name: 'ScanSideex',
  components: {
    ElTableColumnTime,
    ElTableColumnTag,
    PodLog
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      confirmLoading: false,
      searchKeys: ['id'],
      pod: {}
    }
  },
  methods: {
    async fetchData() {
      const res = await getSideexScans(this.selectedProjectId)
      this.pod = (await getSideexPod(this.selectedProjectId)).data
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
    },
    handleLogClick() {
      this.$refs.podLogDialog.fetchData(this.pod.pod_name, this.pod.container_name)
      this.$refs.podLogDialog.dialogVisible = true
    }
  }
}
</script>
