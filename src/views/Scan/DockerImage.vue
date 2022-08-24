<template>
  <el-row
    class="app-container"
    style="overflow: hidden;"
  >
    <ProjectListSelector>
      <el-input
        v-model="keyword"
        :placeholder="$t('Git.searchCommitId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </ProjectListSelector>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      fit
      :data="testList"
      height="100%"
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
    <pagination
      :total="listQuery.total"
      :page.sync="listQuery.current"
      :limit="listQuery.per_page"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-row>
</template>

<script>
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import { getHarborScan } from '@/api_v2/harbor'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'

const params = () => ({
  per_page: 10,
  page: 1
})

const listQuery = () => ({
  total: 0,
  current: 0,
  per_page: 0
})

export default {
  name: 'DockerImage',
  components: {
    ElTableColumnTime,
    ElTableColumnTag
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      keyword: '',
      params: params(),
      listQuery: listQuery(),
      testList: [],
      timeoutId: -1
    }
  },
  watch: {
    keyword(val) {
      clearTimeout(this.timeoutId)
      this.timeoutId = window.setTimeout(() => this.onSearch(val), 1000)
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.timeoutId)
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
      return duration ? this.$dayjs.duration(duration, 'seconds').humanize() : '-'
    },
    async onSearch(keyword) {
      this.params.search = keyword
      this.params.page = 1
      if (keyword === '') delete this.params.search
      await this.fetchData()
    },
    async onPagination(query) {
      const { page } = query
      this.params.page = page
      if (this.keyword !== '') this.params.search = this.keyword
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
