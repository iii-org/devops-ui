<template>
  <el-row class="app-container">
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
        :placeholder="$t('Git.searchBranchOrCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </ProjectListSelector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      :data="pagedData"
    >
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
        size="medium"
        location="zap"
        min-width="130"
        i18n-key="Status"
      />
      <el-table-column
        align="center"
        :label="$t('Zap.high')"
      >
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['3'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Zap.medium')"
      >
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['2'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Zap.low')"
      >
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['1'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('general.Info')"
      >
        <template slot-scope="scope">
          <span v-if="Object.keys(scope.row.result).length > 0">{{ scope.row.result['0'] }}</span>
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
          <el-tooltip
            v-if="scope.row.status === 'Finished'"
            placement="bottom"
            :content="$t('Dashboard.Report')"
          >
            <em
              class="ri-external-link-line active operate-button"
              @click="showFullLog(scope.row.full_log)"
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
    <PodLog
      ref="podLogDialog"
      :pod-name="pod.pod_name"
      :container-name="pod.container_name"
    />
  </el-row>
</template>

<script>
import { getZapScans } from '@/api/zap'
import { getZapPod } from '@/api_v2/zap'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import {
  ProjectListSelector,
  ElTableColumnTime,
  ElTableColumnTag
} from '@/components'
import PodLog from '@/views/SystemResource/PluginResource/components/PodsList/components/PodLog'
import { getDurationTime } from '@/utils/handleTime'

export default {
  name: 'ScanZap',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    ElTableColumnTag,
    PodLog
  },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      confirmLoading: false,
      searchKeys: ['branch', 'commit_id'],
      pod: {}
    }
  },
  methods: {
    async fetchData() {
      const res = await getZapScans(this.selectedProjectId)
      this.pod = (await getZapPod(this.selectedProjectId)).data
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
