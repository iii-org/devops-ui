<template>
  <div>
    <ToolBar>
      <span slot="toolName">OWASP ZAP</span>
      <el-button slot="link" type="text" icon="el-icon-position" :disabled="disabled" @click="openZap">
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="tableZAP"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="zapData"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">OWASP ZAP</el-table-column>
      <el-table-column align="center" :label="$t('Zap.high')">
        <template slot-scope="scope">
          <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['3'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Zap.medium')">
        <template slot-scope="scope">
          <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['2'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Zap.low')">
        <template slot-scope="scope">
          <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['1'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Info')">
        <template slot-scope="scope">
          <span v-if="scope.row.result && Object.keys(scope.row.result).length > 0">{{ scope.row.result['0'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'

export default {
  name: 'Zap',
  components: { ToolBar },
  props: {
    zapData: {
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
      return this.zapData[0] ? Object.keys(this.zapData[0]).length === 0 : true
    }
  },
  methods: {
    openZap() {
      const { full_log } = this.zapData[0]
      this.showFullLog(full_log)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    }
  }
}
</script>
