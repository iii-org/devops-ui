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

    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column :label="$t('ProcessDevEnvironment.Branch')" align="center" prop="branch" width="100">
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
      <el-table-column :label="$t('ProcessDevEnvironment.Container')" header-align="center" min-width="500">
        <template slot-scope="scope">
          <div v-for="(container, idx) in scope.row.containers" :key="container.state + idx" class="my-3">
            <div style="text-align: center">
              <div style="display: inline-block; width: 100px;text-align: center">
                <el-tag v-if="container.state" :type="getStateType(container.state)" size="mini" effect="dark">
                  {{ container.state }}
                </el-tag>
              </div>
              <div class="text-body-2" style="display: inline-block; width: 100px;text-align: left">
                <i class="el-icon-time" />
                {{ container.time | formatTime }}
              </div>
              <div class="text-subtitle-2" style="display: inline-block; width: 160px;text-align: left">
                <i class="el-icon-box" /> {{ container.name }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProcessDevEnvironment.Services')" header-align="center" min-width="220">
        <template slot-scope="scope">
          <div v-for="(container, idx) in scope.row.containers" :key="container.name + idx" class="my-3">
            <span v-for="(service, index) in container.services" :key="service.type + index">
              <el-popover
                v-if="service.type === 'db-server'"
                placement="top"
                width="400"
                trigger="click"
                :open-delay="300"
                :close-delay="50"
              >
                <p :id="`copy-${scope.$index}`" class="text-center">
                  <span class="text-subtitle-1 font-weight-bold">{{ service.url }}</span>
                </p>
                <div class="d-flex justify-center">
                  <el-button icon="el-icon-copy-document" circle size="mini" @click="copyUrl(`copy-${scope.$index}`)" />
                </div>
                <el-link
                  slot="reference"
                  :underline="false"
                  type="primary"
                  style="font-size: 14px"
                  class="mr-3"
                >
                  <svg-icon :icon-class="getContainerType(service.type)" />
                  {{ service.type }}（port:{{ service.target_port }}）
                </el-link>
              </el-popover>
              <el-link
                v-else
                :id="`link-commit-${scope.$index}`"
                type="primary"
                class="mr-3"
                :underline="false"
                style="font-size: 14px"
                target="_blank"
                :href="service.url"
              >
                <svg-icon :icon-class="getContainerType(service.type)" />
                {{ service.type }}（port:{{ service.target_port }}）
              </el-link>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="240">
        <template slot-scope="scope">
          <el-button
            :id="`btn-redeploy-${scope.$index}`"
            :loading="btnLoading"
            type="primary"
            size="mini"
            icon="el-icon-refresh"
            @click="redeploy(projectSelectedId, scope.row.branch)"
          >
            {{ $t('general.Redeploy') }}
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
        containers: item.deployment
          .map(deployment =>
            deployment.container.map(container => {
              const result = container
              result.services = deployment.services.map(service => {
                const result = service
                result.type = deployment.services_type
                return result
              })
              return result
            })
          )
          .flat(),
        services: item.deployment.flatMap(deployment => deployment.services),
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
    getContainerType(type) {
      switch (type) {
        case 'db-server':
          return 'db-server'
        case 'db-gui':
          return 'db-gui'
        case 'web-server':
          return 'web-server'
        default:
          return ''
      }
    },
    copyUrl(id) {
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.$message({
        type: 'success',
        message: this.$t('general.Copied')
      })
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

<style lang="scss" scope>
.table-flex {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: space-around;
}
</style>
