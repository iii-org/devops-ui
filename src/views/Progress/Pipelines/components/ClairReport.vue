<template>
  <div>
    <ToolBar>
      <span slot="toolName">Clair</span>
      <el-button
        slot="link"
        type="text"
        icon="el-icon-position"
        :class="!disabled ? 'linkTextColor' : ''"
        :disabled="disabled"
        @click="openClair"
      >
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_clair"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      class="mb-10"
      :data="clair"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">Clair</el-table-column>
      <el-table-column align="center" :label="$t('Clair.size')">
        <template slot-scope="scope">
          <span v-if="scope.row.size">{{ scope.row.size }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Clair.high')">
        <template slot-scope="scope">
          <span v-if="scope.row.High">{{ scope.row.High }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Clair.medium')">
        <template slot-scope="scope">
          <span v-if="scope.row.Medium">{{ scope.row.Medium }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Clair.low')">
        <template slot-scope="scope">
          <span v-if="scope.row.Low">{{ scope.row.Low }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Docker.Fixable')">
        <template slot-scope="scope">
          <span v-if="hasData(scope.row.fixable)">{{ scope.row.fixable }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'

export default {
  name: 'Clair',
  components: { ToolBar },
  props: {
    clair: {
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
      return this.clair[0] ? Object.keys(this.clair[0]).length === 0 : true
    },
    hasData() {
      return function (result) {
        if (!result) return false
        return result !== 'None' && Object.keys(result).length > 0
      }
    }
  },
  methods: {
    openClair() {
      const { project_id, branch, commit } = this.clair[0]
      const routeUrl = this.$router.resolve({
        name: 'DockerReport', params: { projectId: project_id, branch: branch, commitId: commit }
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
