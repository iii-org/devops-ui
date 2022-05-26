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
      highlight-current-row
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
      />
      <!-- <el-table-column
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
              class="mr-1"
              icon-class="ion-git-commit-outline"
            />{{ scope.row.commit }}
          </el-link>
        </template>
      </el-table-column> -->
      <el-table-column-tag
        prop="scan_status"
        size="medium"
        location="zap"
        min-width="130"
        i18n-key="Status"
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
        label="Fixable"
        prop="fixable"
      />
      <el-table-column-time
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
            v-if="scope.row.status === 'Finished'"
            class="linkTextColor"
            style="font-size: 16px"
            :underline="false"
            @click="showFullLog(scope.row.full_log)"
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
      :page-sizes="[listQuery.per_page]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-row>
</template>

<script>
// import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import { getHarborScan } from '@/api_v2/harbor'
import { BasicData, Pagination, Table, ProjectSelector } from '@/newMixins'

const params = () => ({
  per_page: 10,
  page: 1
})

export default {
  name: 'Clair',
  components: {
    ElTableColumnTime,
    ElTableColumnTag
  },
  mixins: [BasicData, Pagination, Table, ProjectSelector],
  data() {
    return {
      confirmLoading: false,
      keyword: '',
      params: params(),
      testList: []
    }
  },
  watch: {
    keyword: {
      handler(val) {
        this.onSearch(val)
      }
    }
  },
  methods: {
    async fetchData() {
      console.log(this.params)
      const res = await getHarborScan(this.selectedProjectId, this.params)
      console.log(res.data.scan_list)
      this.setListData(res)
    },
    setListData(res) {
      this.testList = res.data.scan_list
      this.listQuery = Object.assign({}, res.data.page)
    },
    durationText(duration) {
      return this.$dayjs.duration(duration, 'seconds').humanize()
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    },
    async onSearch(keyword) {
      this.params.search = keyword
      if (keyword === '') delete this.params.search
      await this.loadData()
      this.initParams()
    },
    async onPagination(listQuery) {
      const { current } = listQuery
      this.params.page = current
      if (this.keyword !== '') this.params.search = this.keyword
      await this.loadData()
      this.initParams()
    },
    initParams() {
      this.params = params()
    }
  }
}
</script>
