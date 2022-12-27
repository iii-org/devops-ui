<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <el-input
        v-model="keyword"
        :placeholder="$t('Git.searchBranchOrCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
        @input="onSearch"
      />
    </ProjectListSelector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      fit
      :data="testList"
    >
      <el-table-column
        align="center"
        :label="$t('Git.Branch')"
        prop="branch"
      />
      <el-table-column
        align="center"
        :label="$t('Git.Commit')"
        prop="commit"
        width="140"
      >
        <template slot-scope="scope">
          <el-link
            class="linkTextColor"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.commit_url"
          >
            <svg-icon
              class="mr-1"
              icon-class="ion-git-commit-outline"
            />{{ scope.row.commit }}
          </el-link>
        </template>
      </el-table-column>
      <ElTableColumnTag
        :label="$t('general.Status')"
        prop="scan_status"
        size="medium"
        location="docker"
        min-width="130"
        i18n-key="Docker"
      />
      <el-table-column
        align="center"
        :label="$t('Docker.Size')"
        prop="size"
      />
      <el-table-column
        align="center"
        :label="$t('Zap.critical')"
        prop="Critical"
      />
      <el-table-column
        align="center"
        :label="$t('Zap.high')"
        prop="High"
      />
      <el-table-column
        align="center"
        :label="$t('Zap.medium')"
        prop="Medium"
      />
      <el-table-column
        align="center"
        :label="$t('Zap.low')"
        prop="Low"
      />
      <el-table-column
        align="center"
        :label="$t('Docker.Fixable')"
        prop="fixable"
      />
      <ElTableColumnTime
        :label="$t('general.RunAt')"
        prop="start_time"
      />
      <el-table-column
        align="center"
        :label="$t('Log.duration')"
      >
        <template slot-scope="scope">
          {{ durationText(scope.row.duration) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Log.fullLog')"
        min-width="50"
      >
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.scan_status === 'Success'"
            class="linkTextColor"
            style="font-size: 16px"
            :underline="false"
            @click="handleToTestReport(scope.row)"
          >
            <em
              class="el-icon-tickets"
              style="font-size: 16px"
            />
          </el-link>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="listQuery.total"
      :page.sync="listQuery.current"
      :limit="listQuery.per_page"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-row>
</template>

<script>
import { BasicData, Pagination, ProjectSelector } from '@/mixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import { getHarborScan } from '@/api_v2/harbor'
import { getDurationTime } from '@/utils/handleTime'

export default {
  name: 'DockerImage',
  components: {
    ElTableColumnTime,
    ElTableColumnTag
  },
  mixins: [BasicData, Pagination, ProjectSelector],
  data() {
    return {
      keyword: '',
      params: {
        page: 1,
        per_page: 10,
        search: sessionStorage.getItem('clairKeyword')
      },
      testList: []
    }
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'DockerReport') {
      next((vm) => {
        vm.keyword = sessionStorage.getItem('clairKeyword')
        sessionStorage.removeItem('clairKeyword')
      })
    } else {
      next()
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'DockerReport') {
      sessionStorage.setItem('clairKeyword', this.keyword)
    }
    next()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const res = await getHarborScan(this.selectedProjectId, this.params)
      this.setListData(res)
      this.listLoading = false
    },
    setListData(res) {
      this.testList = res.data.scan_list
      this.listQuery = res.data.page
    },
    durationText(duration) {
      return getDurationTime(0, duration)
    },
    async onSearch(keyword) {
      this.params.search = keyword
      this.params.page = 1
      await this.fetchData()
    },
    async onPagination(query) {
      const { page, limit } = query
      this.params.page = page
      this.params.per_page = limit
      await this.fetchData()
    },
    async handleToTestReport(row) {
      this.$router.push({
        name: 'DockerReport',
        params: {
          projectId: this.selectedProjectId,
          commitId: row.commit,
          commitBranch: row.branch,
          size: row.size ? row.size : '-'
        }
      })
    }
  }
}
</script>
