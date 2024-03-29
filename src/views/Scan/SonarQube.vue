<template>
  <div class="app-container">
    <ProjectListSelector>
      <el-button
        slot="button"
        class="buttonSecondary"
        :disabled="selectedProjectId === -1"
        @click="openSonarQube"
      >
        <em class="ri-external-link-line mr-1" />
        {{ $t('SonarQube.ViewReport') }}
      </el-button>
      <ScanLogButton slot="button" />
      <el-input
        v-model="keyword"
        :placeholder="$t('Git.searchBranchOrCommitId')"
        style="width: 250px; float: right"
        prefix-icon="el-icon-search"
      />
    </ProjectListSelector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      :data="pagedData"
    >
      <el-table-column
        align="center"
        :label="$t('Git.Branch')"
        prop="branch"
      />
      <el-table-column
        align="center"
        :label="$t('Git.Commit')"
        prop="commit_id"
        width="140"
      >
        <template slot-scope="scope">
          <el-link
            class="linkTextColor"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.issue_link"
          >
            <svg-icon
              v-if="scope.row.commit_id "
              class="mr-1"
              icon-class="ion-git-commit-outline"
            />
            <span>{{ scope.row.commit_id }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('SonarQube.Bugs')"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.bugs }} ({{ convertRating(scope.row.reliability_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('SonarQube.Vulnerabilities')"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.vulnerabilities }} ({{ convertRating(scope.row.security_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('SonarQube.CodeSmells')"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.code_smells }} ({{ convertRating(scope.row.sqale_rating) }})</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('SonarQube.Duplicates')"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.duplicated_blocks }} ({{ scope.row.duplicated_lines_density }}%)</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('SonarQube.Coverage')"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.coverage === '' ? '-' : `${scope.row.coverage}%` }}</span>
        </template>
      </el-table-column>
      <el-table-column-time
        :label="$t('general.RunAt')"
        prop="date"
      />
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { getSonarQubeData } from '@/api/sonarQube'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { ProjectListSelector, ElTableColumnTime } from '@/components'
import ScanLogButton from './ScanLogButton'

export default {
  name: 'ScanSonarQube',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    ScanLogButton
  },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      searchKeys: ['branch', 'commit_id'],
      sqLink: function () {
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
      window.open(this.sqLink)
    }
  }
}
</script>
