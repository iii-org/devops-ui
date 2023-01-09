<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <el-input
        v-model="keyword"
        :placeholder="$t('Git.searchBranchOrCommitId')"
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
import { getDurationTime } from '@/utils/handleTime'
import { getHarborScan } from '@/api_v2/harbor'
import { BasicData, SearchBar, Pagination } from '@/mixins'
import {
  ProjectListSelector,
  ElTableColumnTime,
  ElTableColumnTag
} from '@/components'

export default {
  name: 'DockerImage',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    ElTableColumnTag
  },
  mixins: [BasicData, SearchBar, Pagination],
  data() {
    return {
      storageName: 'clair',
      storageType: ['SearchBar'],
      params: {
        page: 1,
        per_page: 10,
        search: this.keyword
      },
      testList: []
    }
  },
  watch: {
    async keyword(value) {
      this.params.search = value
      this.params.page = 1
      this.storeKeyword()
      await this.loadData()
    }
  },
  methods: {
    async fetchData() {
      const res = await getHarborScan(this.selectedProjectId, this.params)
      this.setListData(res)
    },
    setListData(res) {
      this.testList = res.data.scan_list
      this.listQuery = res.data.page
    },
    durationText(duration) {
      return getDurationTime(0, duration)
    },
    async onPagination(query) {
      const { page, limit } = query
      this.params.page = page
      this.params.per_page = limit
      await this.loadData()
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
