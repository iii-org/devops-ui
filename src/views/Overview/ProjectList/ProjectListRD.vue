<template>
  <div class="app-container">
    <div class="text-right">
      <el-input
        v-model="keyword"
        :placeholder="$t('Project.SearchProjectNameOrId')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 300px)"
      border
      fit
    >
      <el-table-column
        width="60"
        align="center"
        prop="starred"
      >
        <template slot-scope="scope">
          <i v-if="scope.row.starred" class="el-icon-star-on text-yellow-500 text-2xl" @click="setStar(scope.row.id, false)" />
          <i v-else class="el-icon-star-off text-gray-400 text-xl" @click="setStar(scope.row.id, true)" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Project.NameIdentifier')"
        :show-overflow-tooltip="true"
        min-width="200"
      >
        <template slot-scope="scope">
          <div style="color: #67c23a">{{ scope.row.display }}</div>
          <div style="color: #949494; font-size: small;">#{{ scope.row.name }}</div>
        </template>
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
            <i v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="GitLab" width="110">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.git_url"
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
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Redmine" width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.redmine_url"
            target="_blank"
            style="font-size: 22px"
            :underline="false"
            :href="scope.row.redmine_url"
          >
            <svg-icon icon-class="redmine" />
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Harbor" width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.harbor_url"
            target="_blank"
            style="font-size: 22px"
            :underline="false"
            :href="scope.row.harbor_url"
          >
            <svg-icon icon-class="harbor" />
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
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

export default {
  name: 'ProjectListRD',
  components: { ElTableColumnTime },
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      keywords: ['display', 'name']
    }
  },
  computed: {
    ...mapGetters(['projectList', 'projectListTotal'])
  },
  methods: {
    ...mapActions(['projects/getMyProjectList']),
    async fetchData() {
      await this['projects/getMyProjectList']()
      return this.projectList
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
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Copied'),
        type: 'success'
      })
    },
    async setStar(id, star) {
      if (star) {
        await postStarProject(id)
        await this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      } else {
        await deleteStarProject(id)
        await this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      }
    }
  }
}
</script>
