<template>
  <div>
    <ToolBar>
      <span slot="toolName">Anchore</span>
      <el-button slot="link" type="text" icon="el-icon-position" :class="!disabled ? 'linkTextColor' : ''" :disabled="disabled" @click="openAnchore">
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_anchore"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      class="mb-10"
      :data="anchore"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">Anchore</el-table-column>
      <el-table-column align="center" :label="$t('Anchore.high')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['3'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Anchore.medium')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['2'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Anchore.low')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['1'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Docker.Fixable')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.result)">{{ scope.row.result['0'] }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'

export default {
  name: 'Anchore',
  components: { ToolBar },
  props: {
    anchore: {
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
      return this.anchore[0] ? Object.keys(this.anchore[0]).length === 0 : true
    },
    hasData() {
      return function (result) {
        if (!result) return false
        return result !== 'None' && Object.keys(result).length > 0
      }
    }
  },
  methods: {
    openAnchore() {
      const { full_log } = this.anchore[0]
      this.showFullLog(full_log)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    }
  }
}
</script>
