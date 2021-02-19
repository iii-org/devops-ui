<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column :label="$t('ProcessDevEnvironment.Branch')" align="center" prop="branch" width="150" />
      <el-table-column :label="$t('ProcessDevEnvironment.Deployment')" align="center" prop="deployment" width="200" />
      <el-table-column :label="$t('ProcessDevEnvironment.Container')" align="center" min-width="200">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.container" :key="item.name + idx">
            {{ item.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevEnvironment.Image')" align="center" min-width="280">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.container" :key="item.image + idx">
            {{ item.image }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevEnvironment.Service(Url)')" align="center" min-width="300">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.service" :key="item.name + idx">
            <el-link :href="item.url" target="_blank" type="primary" :underline="false">{{ item.name }}</el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.StartTime')" align="center" width="150">
        <template slot-scope="scope">
          {{ scope.row.start_time | formatTime }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="120">
        <template slot-scope="scope">
          <el-button
            :loading="btnLoading"
            type="primary"
            size="mini"
            icon="el-icon-refresh"
            @click="redeploy(projectSelectedId, scope.row.deployment)"
          >
            Redeploy
          </el-button>
        </template>
      </el-table-column>
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

<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { getProjectDeploymentList } from '@/api/projects'
import { updateDeployment } from '@/api/projectResource'

export default {
  name: 'ProgressDevEnvironment',
  components: { ProjectListSelector, Pagination },
  data: () => ({
    deploymentList: [],
    listLoading: true,
    btnLoading: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.deploymentList.filter(data => {
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
    projectSelectedId(projectId) {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      await getProjectDeploymentList(this.projectSelectedId).then(res => {
        this.deploymentList = Object.values(res.data).map(item => ({
          branch: item.branch,
          deployment: item.workload[0].deployment_name,
          container: item.workload[0].container,
          service: item.workload[0].pulicEnpoints,
          start_time: item.workload[0].create_time
        }))
      })
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async redeploy(pId, deploymentName) {
      this.btnLoading = true
      try {
        await updateDeployment(pId, deploymentName)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.btnLoading = false
    }
  }
}
</script>
