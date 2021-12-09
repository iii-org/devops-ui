<template>
  <div>
    <ToolBar>
      <span slot="toolName">SonarQube</span>
      <el-button slot="link" type="text" icon="el-icon-position" :disabled="!sonarQubeLink" @click="openSonarQube">
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
import { getSonarQubeData } from '@/api/sonarQube'

export default {
  name: 'SonarQube',
  components: { ToolBar },
  props: {
    // sonarqube: {
    //   type: Array,
    //   default: () => []
    // },
    // sonarQubeLink: {
    //   type: String,
    //   default: ''
    // },
    // listLoading: {
    //   type: Boolean,
    //   default: false
    // }
  },
  data() {
    return {
      sonarqube: [],
      sonarQubeLink: '',
      listLoading: false
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
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) return []
      this.listLoading = true
      const res = (await getSonarQubeData(this.selectedProject.name)).data
      this.listLoading = false
      this.setSonarQubeData(res)
    },
    setSonarQubeData(data) {
      if (data) {
        const sonarqubeData = this.handleSonarQubeData(data.history)
          .sort((a, b) => Date.parse(b) - Date.parse(a))
        const foundData = sonarqubeData.find(item => item.commit_id === this.commitId)
        foundData ? this.sonarqube.push(foundData) : this.sonarqube = []
        this.sonarQubeLink = data.link
      } else this.sonarqube = undefined
    },
    handleSonarQubeData(data) {
      const ret = []
      if (!data) return ret
      Object.keys(data).forEach(key => {
        const row = data[key]
        row['run_at'] = key
        ret.push(row)
      })
      return ret
    },
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

