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
      <el-button
        v-if="hasPod"
        slot="button"
        class="buttonPrimary"
        :disabled="selectedProjectId === -1"
        @click="handleLogClick"
      >
        <em class="ri-computer-line mr-1" />
        {{ $t('SonarQube.ScanLogs') }}
      </el-button>
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
    <PodLog
      ref="podLogDialog"
      :pod-name="focusPodName"
      :container-name="focusContainerName"
    />
  </div>
</template>

<script>
import { BasicData, Pagination, SearchBar, ProjectSelector } from '@/mixins'
import { getSonarQubeData } from '@/api/sonarQube'
import { getSonarQubePod } from '@/api_v2/sonarQube'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import PodLog from '@/views/SystemResource/PluginResource/components/PodsList/components/PodLog'

export default {
  name: 'ScanSonarQube',
  components: { ElTableColumnTime, PodLog },
  mixins: [BasicData, Pagination, SearchBar, ProjectSelector],
  data() {
    return {
      searchKeys: ['branch', 'commit_id'],
      sqLink: function () {
        return ''
      },
      hasPod: false,
      focusPodName: '',
      focusContainerName: ''
    }
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        return []
      }
      const res = (await getSonarQubeData(this.selectedProject.name)).data
      const resPod = (await getSonarQubePod(this.selectedProjectId)).data
      this.hasPod = resPod.has_pod
      this.focusPodName = resPod.pod_name
      this.focusContainerName = resPod.container_name
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
    },
    handleLogClick() {
      this.$refs.podLogDialog.fetchData(this.focusPodName, this.focusContainerName)
      this.$refs.podLogDialog.dialogVisible = true
    }
  }
}
</script>
