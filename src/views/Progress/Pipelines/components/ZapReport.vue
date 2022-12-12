<template>
  <div>
    <ToolBar>
      <span slot="toolName">OWASP ZAP</span>
      <el-button slot="link" type="text" icon="el-icon-position" :class="!disabled ? 'linkTextColor' : ''" :disabled="disabled" @click="openZap">
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_zap"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      class="mb-10"
      :data="zap"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">OWASP ZAP</el-table-column>
      <el-table-column align="center" :label="$t('Zap.high')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['3'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Zap.medium')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['2'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Zap.low')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['1'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Info')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['0'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ToolBar } from './'

export default {
  name: 'Zap',
  components: { ToolBar },
  props: {
    zap: {
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
      return this.zap[0] ? Object.keys(this.zap[0]).length === 0 : true
    },
    hasData() {
      return function (result) {
        if (!result) return false
        return result !== 'None' && Object.keys(result).length > 0
      }
    }
  },
  methods: {
    openZap() {
      const { full_log } = this.zap[0]
      this.showFullLog(full_log)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    }
  }
}
</script>
