<template>
  <div>
    <ToolBar>
      <span slot="toolName">WebInspect</span>
      <el-button slot="link" type="text" icon="el-icon-tickets" :class="!disabled ? 'linkTextColor' : ''" :disabled="disabled" @click="openWebInspect">
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_webinspect"
      v-loading="listLoading"
      class="mb-10"
      :element-loading-text="$t('Loading')"
      :data="webinspect"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">WebInspect</el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.Critical')" prop="stats.criticalCount">
        <template slot-scope="scope">
          <span v-if="showColumn(scope.row)">{{ scope.row.stats.criticalCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.HighSeverity')" prop="stats.highCount">
        <template slot-scope="scope">
          <span v-if="showColumn(scope.row)">{{ scope.row.stats.highCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.MediumSeverity')" prop="stats.mediumCount">
        <template slot-scope="scope">
          <span v-if="showColumn(scope.row)">{{ scope.row.stats.mediumCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.LowSeverity')" prop="stats.lowCount">
        <template slot-scope="scope">
          <span v-if="showColumn(scope.row)">{{ scope.row.stats.lowCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.InfoSeverity')" prop="stats.infoCount">
        <template slot-scope="scope">
          <span v-if="showColumn(scope.row)">{{ scope.row.stats.infoCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('WebInspect.BpSeverity')" prop="stats.bpCount">
        <template slot-scope="scope">
          <span v-if="showColumn(scope.row)">{{ scope.row.stats.bpCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'

export default {
  name: 'Webinspect',
  components: { ToolBar },
  props: {
    webinspect: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    disabled() {
      return this.webinspect[0] ? Object.keys(this.webinspect[0]).length === 0 : true
    },
    showColumn() {
      return function(row) {
        return row.hasOwnProperty('stats') && row.stats !== 'None'
      }
    }
  },
  methods: {
    openWebInspect() {
      const { scan_id, run_at } = this.webinspect[0]
      const routeUrl = this.$router.resolve({
        name: 'WebinspectReport', params: { scanId: scan_id, run_at }
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
