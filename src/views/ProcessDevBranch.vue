<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import { formatTime } from '@/utils/index.js'
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'ProcessDevBranch',
  components: {
    Pagination,
    ProjectListSelector
  },
  mixins: [MixinElTable],
  data: () => ({
    branchList: [],
    listLoading: true,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId', 'selectedProject', 'branchesByProject']),
    pagedData() {
      const listData = this.branchList.filter(data => {
        if (this.searchData === '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  watch: {
    branchesByProject(ary) {
      this.branchList = ary
    },
    selectedProject(obj) {
      this.fetchBranchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  async created() {
    this.fetchBranchData()
  },
  methods: {
    ...mapActions('branches', ['getBranchesByProject']),
    async fetchBranchData() {
      this.listLoading = true
      const repository_id = this.selectedProject.repository_id || this.selectedProject[0].repository_id
      await this.getBranchesByProject(repository_id)
      this.listLoading = false
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      return success + ' / ' + total
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    myFormatTime(time) {
      return formatTime(new Date(time))
    },
    EnvironmentFormat(env) {
      const serviceArray = Object.keys(env)
      const environmentArray = []
      serviceArray.forEach(function(item) {
        const detailArray = env[item]
        const serviceName = Object.keys(env[item])
        detailArray[serviceName].forEach(function(item) {
          environmentArray.push({ service: serviceName[0], port: item.port, url: item.url })
        })
      })
      return environmentArray
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('ProcessDevBranch.SearchBranch')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row height="100%">
      <el-table-column align="center" :label="$t('ProcessDevBranch.Branch')" min-width="160" prop="name" />
      <el-table-column align="center" :label="$t('general.Description')" min-width="160" prop="last_commit_message" />
      <el-table-column align="center" :label="$t('ProcessDevBranch.Environment')" min-width="200">
        <template slot-scope="scope">
          <div v-for="(item, index) in EnvironmentFormat(scope.row.env_url)" :key="index">
            <el-link type="primary" target="_blank" style="font-size: 16px" :underline="false" :href="item.url">
              {{ item.service }} ({{ item.port }})
            </el-link>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" :label="$t('ProcessDevBranch.Status')" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status == 'Failed'" type="danger" size="medium" effect="dark">
            {{ scope.row.status }}
          </el-tag>
          <el-tag v-else-if="scope.row.status == 'Success'" type="success" size="medium" effect="dark">
            {{ scope.row.status }}
          </el-tag>
          <el-tag v-else-if="scope.row.status == 'Waiting'" type="responded" size="medium" effect="dark">
            {{ scope.row.status }}
          </el-tag>
          <el-tag v-else-if="scope.row.status == 'Building'" type="warning" size="medium" effect="dark">
            {{ scope.row.status }}
          </el-tag>
          <el-tag v-else type="close" size="medium" effect="dark">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column align="center" :label="$t('ProcessDevBranch.Commit')" min-width="100" prop="short_id">
        <template slot-scope="scope">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            :href="scope.row.commit_url"
          >
            {{ scope.row.short_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('ProcessDevBranch.LastUpdateTime')" width="180">
        <template slot-scope="scope">
          {{ myFormatTime(scope.row.last_commit_time) }}
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Test Completion">
        <template slot-scope="scope">
          {{ scope.row.test_completion.done }} / {{ scope.row.test_completion.total }}
        </template>
      </el-table-column> -->
    </el-table>
    <pagination
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>
