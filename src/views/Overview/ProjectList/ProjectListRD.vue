<template>
  <div class="app-container">
    <div class="text-right">
      <SearchFilter
        ref="filter"
        :keyword.sync="keyword"
        @changeFilter="loadData"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 300px)"
      fit
    >
      <el-table-column
        width="60"
        align="center"
        prop="starred"
      >
        <template slot-scope="scope">
          <em v-if="scope.row.starred" class="el-icon-star-on text-yellow-500 text-2xl" @click="setStar(scope.row.id, false)" />
          <em v-else class="el-icon-star-off text-gray-400 text-xl" @click="setStar(scope.row.id, true)" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Project.NameIdentifier')"
        :show-overflow-tooltip="true"
        min-width="200"
      >
        <template slot-scope="scope">
          <div class="flex justify-start">
            <div class="flex items-center mr-5">
              <!-- gitlab button -->
              <el-popover
                v-if="scope.row.git_url"
                class="mr-1"
                placement="top"
                width="400"
                trigger="hover"
                :open-delay="300"
                :close-delay="50"
              >
                <p :id="`copy-${scope.$index}`" class="text-center">
                  <span class="text-title">{{ scope.row.git_url }}</span>
                </p>
                <div class="flex justify-center">
                  <el-button
                    class="mr-2"
                    icon="el-icon-copy-document"
                    circle
                    size="mini"
                    @click="copyUrl(`copy-${scope.$index}`)"
                  />
                  <a :href="scope.row.git_url" target="_blank">
                    <el-button circle size="mini">
                      <svg-icon icon-class="foreign" />
                    </el-button>
                  </a>
                </div>
                <el-link slot="reference" :underline="false" style="font-size: 22px">
                  <svg-icon icon-class="gitlab" />
                </el-link>
              </el-popover>
              <!-- redmine button -->
              <el-link
                v-if="scope.row.redmine_url"
                target="_blank"
                class="mr-1"
                style="font-size: 22px"
                :underline="false"
                :href="scope.row.redmine_url"
              >
                <svg-icon icon-class="redmine" />
              </el-link>
              <!-- harbor button -->
              <el-link
                v-if="scope.row.harbor_url"
                target="_blank"
                style="font-size: 22px"
                :underline="false"
                :href="scope.row.harbor_url"
              >
                <svg-icon icon-class="harbor" />
              </el-link>
            </div>
            <div>
              <div style="color: #67c23a">{{ scope.row.display }}</div>
              <div style="color: #949494; font-size: small;">#{{ scope.row.name }}</div>
            </div>
          </div></template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.WorkloadValue')" width="120" prop="issues" />
      <el-table-column-time prop="next_d_time" :label="$t('Project.UpcomingDeadline')" />
      <el-table-column align="center" :label="$t('Project.LastTest')" width="190">
        <template slot-scope="scope">
          <span v-if="scope.row.last_test_time === ''">No Test</span>
          <el-tooltip v-else placement="bottom" :content="scope.row.last_test_time | UTCtoLocalTime">
            <span>{{ scope.row.last_test_time | relativeTime }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.LastTestResult')" width="170">
        <template slot-scope="scope">
          <el-tag class="el-tag--circle" :type="returnTagType(scope.row)" size="large" effect="dark">
            <em v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <em v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.owner_name')" prop="owner_name" />
      <el-table-column align="center" :label="$t('ProjectSettings.Status')">
        <template slot-scope="scope">
          <el-tag :type="scope.row.disabled ? 'danger' : 'success'">
            {{ scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
          </el-tag>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
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
import { mapActions, mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { deleteStarProject, postStarProject } from '@/api/projects'
import SearchFilter from '@/views/Overview/ProjectList/components/SearchFilter'

export default {
  name: 'ProjectListRD',
  components: { ElTableColumnTime, SearchFilter },
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      searchKeys: ['display', 'name', 'owner_name']
    }
  },
  computed: {
    ...mapGetters(['projectList', 'projectListTotal'])
  },
  mounted() {
    this.loadData()
  },
  methods: {
    ...mapActions('projects', ['getMyProjectList']),
    async fetchData() {
      this.listLoading = true
      let params = {}
      if (this.$refs.filter) params = this.getParams()
      await this.getMyProjectList(params)
      this.listLoading = false
      return this.projectList
    },
    getParams() {
      const params = {}
      this.$refs.filter.isDisabled.length === 1 ? params.disabled = this.$refs.filter.isDisabled[0] : delete params.disabled
      return params
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'No Test'
      return `${success} / ${total}`
    },
    copyUrl(id) {
      const message = this.$t('Notify.Copied')
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.showSuccessMessage(message)
    },
    async setStar(id, star) {
      const message = this.$t('Notify.Updated')
      star ? await postStarProject(id) : await deleteStarProject(id)
      await this.loadData()
      this.showSuccessMessage(message)
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    }
  }
}
</script>
