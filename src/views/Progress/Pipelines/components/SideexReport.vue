<template>
  <div>
    <ToolBar>
      <span slot="toolName">Sideex</span>
      <el-button slot="link" type="text" icon="el-icon-position" :class="!disabled ? 'linkTextColor' : ''" :disabled="!showSideexReport" @click="openSideex">
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_sideex"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="sideex"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">Sideex</el-table-column>
      <el-table-column align="center" :label="$t('Sideex.suitesPassedRatio')">
        <template slot-scope="scope">
          <span v-if="scope.row && scope.row.result">
            {{ scope.row.result.suitesPassed }} {{ $t('TestReport.Item') }} /{{ scope.row.result.suitesTotal }} {{ $t('TestReport.Item') }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Sideex.casesPassedRatio')">
        <template slot-scope="scope">
          <span v-if="scope.row && scope.row.result">
            {{ scope.row.result.casesPassed }} {{ $t('TestReport.Item') }} /{{ scope.row.result.casesTotal }} {{ $t('TestReport.Item') }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'
import { getSideexReport } from '@/api/sideex'

export default {
  name: 'Sideex',
  components: { ToolBar },
  props: {
    sideex: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    showSideexReport() {
      return this.sideex[0] ? this.sideex[0].status === 'Finished' && this.sideex[0].has_report : false
    }
  },
  methods: {
    async openSideex() {
      const { id } = this.sideex[0]
      const res = await getSideexReport(id)
      this.showFullLog(res.data)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    }
  }
}
</script>
