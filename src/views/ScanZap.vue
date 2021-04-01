<script>
import {
  getWebInspectReport,
  getWebInspectScans,
  getWebInspectStats,
  getWebInspectStatus
} from '@/api/webInspect'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { getZapScans } from '@/api/zap'

export default {
  name: 'ScanZap',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    confirmLoading: false,
    searchKey: 'commit_id'
  }),
  methods: {
    async fetchData() {
      const res = await getZapScans(this.selectedProjectId)
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
    getStatusTagType(status) {
      switch (status) {
        case 'Finished':
          return 'success'
        case 'Scanning':
          return 'slow'
        case 'Failed':
          return 'danger'
        default:
          return 'slow'
      }
    },
    showFullLog(log) {
      const lines = []
      for (const line of log.split('\n')) {
        lines.push(this.$createElement('div', line))
      }
      const content = this.$createElement('div', { class: 'full-log' }, lines)
      this.$alert(content, null, {
        confirmButtonText: this.$t('general.Confirm')
      })
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
        :placeholder="$t('Git.searchCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :element-loading-text="$t('Loading')" border fit
              highlight-current-row :data="pagedData" height="100%">
      <el-table-column align="center" :label="$t('Zap.id')" prop="id"
                       :show-overflow-tooltip="true" />
      <el-table-column align="center" :label="$t('Git.Branch')" prop="branch" min-width="120" />
      <el-table-column align="center" :label="$t('Git.Commit')" prop="commit_id" min-width="100">
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
      <el-table-column align="center" :label="$t('general.Status')" min-width="130">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status" :type="getStatusTagType(scope.row.status)" effect="dark">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Zap.fail')" prop="result.fail" />
      <el-table-column align="center" :label="$t('Zap.warning')" prop="result.warning" />
      <el-table-column align="center" :label="$t('Zap.info')" prop="result.info" />
      <el-table-column align="center" :label="$t('Zap.ignore')" prop="result.ignore" />
      <el-table-column align="center" :label="$t('Zap.pass')" prop="result.pass" />
      <el-table-column-time :label="$t('general.RunAt')" prop="run_at" />
      <el-table-column align="center" :label="$t('Zap.fullLog')" min-width="100">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.status === 'Finished'"
            type="primary"
            style="font-size: 16px"
            :underline="false"
            @click="showFullLog(scope.row.full_log)"
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
  </div>
</template>

<style scoped>
.full-log {
  overflow: auto;
  height: 70vh;
}
</style>
