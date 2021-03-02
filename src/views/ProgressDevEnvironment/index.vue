<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchBranch')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row>
      <el-table-column :label="$t('ProcessDevEnvironment.Branch')" align="center" prop="branch" width="150">
        <template slot-scope="scope">
          <div>{{ scope.row.branch }}</div>
          <el-link
            :id="`link-commit-${scope.$index}`"
            type="primary"
            :underline="false"
            style="font-size: 14px"
            target="_blank"
            :href="scope.row.commit_url"
          >
            {{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevEnvironment.Deployment')" align="center" prop="deployment" width="370">
        <template slot-scope="scope">
          <div v-for="(name, idx) in scope.row.deployments" :key="name + idx" class="my-1">
            {{ name }}
            <el-link
              :id="`link-service-${scope.$index}`"
              class="ml-2"
              type="primary"
              :underline="false"
              style="font-size: 16px"
              target="_blank"
              :href="scope.row.services[idx].url"
            >
              <svg-icon icon-class="foreign" />
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevEnvironment.State')" align="center" min-width="120">
        <template slot-scope="scope">
          <div v-for="(state, idx) in scope.row.states" :key="state + idx" class="my-1">
            <el-tag v-if="scope.row.states" :type="getStateType(state)" size="small" effect="dark">{{ state }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevEnvironment.Container')" align="center" min-width="200">
        <template slot-scope="scope">
          <div v-for="(container, idx) in scope.row.containers" :key="container + idx" class="my-1">
            {{ container }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevEnvironment.Image')" align="center" min-width="550">
        <template slot-scope="scope">
          <div v-for="(image, idx) in scope.row.images" :key="image + idx" class="my-1">
            {{ image }}
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('ProcessDevEnvironment.Service(Url)')" align="center" min-width="550">
        <template slot-scope="scope">
          <div v-for="(service, idx) in scope.row.services" :key="service + idx" class="my-1">
            <el-link
              :id="`link-service-${scope.$index}`"
              type="primary"
              :underline="false"
              style="font-size: 16px"
              target="_blank"
              :href="service.url"
            >
              {{ service.service_name }}
            </el-link>
          </div>
        </template>
      </el-table-column> -->
      <el-table-column :label="$t('general.StartTime')" align="center" width="190" class="my-1">
        <template slot-scope="scope">
          <div v-for="(time, idx) in scope.row.startTime" :key="time + idx">
            {{ time | formatTime }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="250">
        <template slot-scope="scope">
          <el-button
            :id="`btn-redeploy-${scope.$index}`"
            :loading="btnLoading"
            type="primary"
            size="mini"
            icon="el-icon-refresh"
            @click="redeploy(projectSelectedId, scope.row.branch)"
          >
            Redeploy
          </el-button>
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(projectSelectedId, scope.row.branch)"
          >
            <el-button
              :id="`btn-delete-${scope.$index}`"
              slot="reference"
              :loading="btnLoading"
              size="mini"
              type="danger"
            >
              <i class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
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
import {
  getDevEnvironmentList,
  redeployDevEnvironmentByBranchName,
  deleteDevEnvironmentByBranchName
} from '@/api/projects'

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
        if (this.searchData === '' || data.branch.toLowerCase().includes(this.searchData.toLowerCase())) {
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
    projectSelectedId() {
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
      await getDevEnvironmentList(this.projectSelectedId).then(res => {
        this.deploymentList = this.handledDeploymentList(res.data)
      })
      this.listLoading = false
    },
    handledDeploymentList(data) {
      return data.map(item => ({
        branch: item.branch,
        commit_id: item.commit_id,
        commit_url: item.commit_url,
        deployments: item.deployment.map(i => i.deployment_name),
        states: item.deployment.map(i => i.container.map(i => i.state)).flat(),
        containers: item.deployment.map(i => i.container.map(i => i.name)).flat(),
        images: item.deployment.map(i => i.container.map(i => i.image)).flat(),
        services: item.deployment.flatMap(i => i.services),
        services_type: item.deployment.map(i => i.services_type),
        startTime: item.deployment.map(i => i.container.map(i => i.time)).flat()
      }))
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async redeploy(pId, branchName) {
      this.btnLoading = true
      try {
        await redeployDevEnvironmentByBranchName(pId, branchName)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.btnLoading = false
    },
    getStateType(state) {
      switch (state) {
        case 'pending':
          return 'slow'
        case 'running':
          return 'success'
        case 'succeeded':
          return 'success'
        case 'failed':
          return 'danger'
        case 'unknown':
          return 'warning'
        default:
          return 'slow'
      }
    },
    async handleDelete(pId, branchName) {
      this.btnLoading = true
      try {
        await deleteDevEnvironmentByBranchName(pId, branchName)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.btnLoading = false
    }
  }
}
</script>
