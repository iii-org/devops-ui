<template>
  <div>
    <ToolBar>
      <span slot="toolName">SonarQube</span>
      <el-button 
        slot="link" 
        type="text" 
        icon="el-icon-position" 
        :class="sonarQubeLink ? 'linkTextColor' : ''"
        :disabled="!sonarQubeLink" 
        @click="openSonarQube"
      >
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_sonarqube"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="sonarqube"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">SonarQube</el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.Bugs')">
        <template slot-scope="scope">
          <span>{{ scope.row.bugs }} ({{ convertRating(scope.row.reliability_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.Vulnerabilities')">
        <template slot-scope="scope">
          <span>{{ scope.row.vulnerabilities }} ({{ convertRating(scope.row.security_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.CodeSmells')">
        <template slot-scope="scope">
          <span>{{ scope.row.code_smells }} ({{ convertRating(scope.row.sqale_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.Duplicates')">
        <template slot-scope="scope">
          <span>{{ scope.row.duplicated_blocks }} ({{ scope.row.duplicated_lines_density }}%)</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('SonarQube.Coverage')">
        <template slot-scope="scope">
          <span>{{ scope.row.coverage === '' ? '-' : `${scope.row.coverage}%` }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'

export default {
  name: 'SonarQube',
  components: { ToolBar },
  props: {
    sonarqube: {
      type: Array,
      default: () => []
    },
    sonarQubeLink: {
      type: String,
      default: ''
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    commitId() {
      return this.$route.params.commitId
    }
  },
  methods: {
    openSonarQube() {
      window.open(this.sonarQubeLink)
    },
    convertRating(rating) {
      const r = parseInt(rating)
      if (r) {
        return ['0', 'A', 'B', 'C', 'D', 'E'][r]
      } else {
        return '-'
      }
    }
  }
}
</script>
