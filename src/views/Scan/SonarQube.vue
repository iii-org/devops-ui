<template>
  <div class="app-container" style="overflow: hidden;">
    <div class="clearfix">
      <project-list-selector />
      <el-button type="success" @click="openSonarQube">
        <svg-icon icon-class="PhArrowSquareOutFill" />
        {{ $t('SonarQube.ViewReport') }}
      </el-button>
      <el-input
        v-model="searchData"
        :placeholder="$t('Git.Branch')"
        style="width: 250px; float: right"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      height="100%"
    >
      <el-table-column align="center" :label="$t('Git.Branch')" prop="branch" />
      <el-table-column align="center" :label="$t('Git.Commit')" prop="commit_id">
        <template slot-scope="scope" width="140">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.issue_link"
          >
            <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
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
      <el-table-column-time :label="$t('general.RunAt')" prop="date" />
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

<script>
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { getSonarQubeData } from '@/api/sonarQube'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ScanSonarQube',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      searchKey: 'branch',
      sqLink: function() {
        return ''
      }
    }
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        return []
      }
      const res = (await getSonarQubeData(this.selectedProject.name)).data
      this.sqLink = res.link
      const data = res.history
      const ret = []
      for (const key in data) {
        const row = data[key]
        row['date'] = key
        ret.push(row)
      }
      ret.sort((a, b) => {
        return Date.parse(b.date) - Date.parse(a.date)
      })
      return ret
    },
    convertRating(rating) {
      const r = parseInt(rating)
      if (r) {
        return ['0', 'A', 'B', 'C', 'D', 'E'][r]
      } else {
        return '-'
      }
    },
    openSonarQube() {
      window.open(this.sqLink, '_blank')
    }
  }
}
</script>
