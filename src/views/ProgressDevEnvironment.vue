<template>
  <div v-loading="listLoading" class="app-container">
    <div class="d-flex justify-space-between">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchBranch')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />

    <el-row v-if="filteredData.length > 0" :gutter="10">
      <el-col v-for="deployment in filteredData" :key="deployment.commit_id" v-loading="listLoading" :sm="12" :xl="8">
        <el-card class="mb-2" :body-style="{ padding: '20px' }" shadow="never">
          <div slot="header">
            <div class="d-flex justify-space-between">
              <div class="text-h6 font-weight-bold">
                <svg-icon icon-class="branch" />
                {{ deployment.branch }}
                <el-link
                  class="ml-7"
                  type="primary"
                  :underline="false"
                  style="font-size: 14px"
                  target="_blank"
                  :href="deployment.commit_url"
                >
                  {{ deployment.commit_id }}
                </el-link>
              </div>
              <div>
                <el-button
                  type="slow"
                  size="mini"
                  plain
                  icon="el-icon-refresh"
                  @click="redeploy(selectedProject.id, deployment.branch)"
                >
                  {{ $t('general.Redeploy') }}
                </el-button>
                <el-popconfirm
                  confirm-button-text="Delete"
                  cancel-button-text="Cancel"
                  icon="el-icon-info"
                  icon-color="red"
                  title="Are you sure?"
                  @onConfirm="handleDelete(selectedProject.id, deployment.branch)"
                >
                  <el-button slot="reference" size="mini" type="danger">
                    <i class="el-icon-delete" />
                    {{ $t('general.Delete') }}
                  </el-button>
                </el-popconfirm>
              </div>
            </div>
          </div>

          <el-card v-for="pod in deployment.pods" :key="pod.pod_name" class="mb-5" shadow="hover">
            <div class="text-caption">
              <i class="el-icon-box mr-1" />
              {{ $t('ProcessDevEnvironment.Container') }}
            </div>

            <span class="text-body-1 font-weight-bold">
              {{ pod.app_name }}
            </span>

            <div v-for="(container, idx) in pod.containers" :key="container.name + idx">
              <el-tag
                v-if="container.status.state"
                class="mb-2"
                :type="getStateType(container.status.state)"
                size="mini"
                effect="dark"
              >
                {{ container.status.state }}
              </el-tag>
              <div class="text-caption  mr-1">
                <svg-icon class="mr-1" icon-class="MdiClockOutline" />
                {{ $t('general.StartTime') }}
              </div>
              <div class="font-weight-bold mb-2">{{ container.status.time | relativeTime }}</div>

              <div v-for="(servicePM, servicePMIdx) in container.service_port_mapping" :key="servicePMIdx">
                <div class="text-caption mr-1">
                  <i class="el-icon-box mr-1" />
                  <span class="text-caption">{{ $t('ProcessDevEnvironment.Services') }}</span>
                </div>

                <span v-for="(service, serviceIdx) in servicePM.services" :key="serviceIdx">
                  <el-popover
                    v-if="service.service_type === 'db-server'"
                    placement="top"
                    width="400"
                    trigger="click"
                    :open-delay="300"
                    :close-delay="50"
                  >
                    <p :id="`copy-${serviceIdx}`" class="text-center">
                      <span class="text-subtitle-1 font-weight-bold">{{ service.url[0] }}</span>
                    </p>
                    <div class="d-flex justify-center">
                      <el-button
                        icon="el-icon-copy-document"
                        circle
                        size="mini"
                        @click="copyUrl(`copy-${serviceIdx}`)"
                      />
                    </div>
                    <el-link
                      slot="reference"
                      :underline="false"
                      type="primary"
                      style="font-size: 14px"
                      class="mr-3"
                      :disabled="container.status.state !== 'running'"
                    >
                      <svg-icon :icon-class="getContainerType(service.service_type)" />
                      {{ service.service_type }}（port:{{ service.port }}）
                    </el-link>
                  </el-popover>
                  <el-link
                    v-else
                    :id="`link-commit-${serviceIdx}`"
                    type="primary"
                    class="mr-3"
                    :underline="false"
                    style="font-size: 14px"
                    target="_blank"
                    :href="service.url[0]"
                    :disabled="container.status.state !== 'running'"
                  >
                    <svg-icon :icon-class="getContainerType(service.service_type)" />
                    {{ service.service_type }}（port:{{ service.port }}）
                  </el-link>
                </span>
              </div>
            </div>
          </el-card>
        </el-card>
      </el-col>
    </el-row>

    <div v-else class="text-center">
      {{ $t('general.NoData') }}
    </div>
  </div>
</template>

<script>
import {
  deleteDevEnvironmentByBranchName,
  getDevEnvironmentList,
  redeployDevEnvironmentByBranchName
} from '@/api/projects'
import MixinElCardWithAProject from '@/components/MixinElCardWithAProject'

export default {
  name: 'ProgressDevEnvironment',
  mixins: [MixinElCardWithAProject],
  data: () => ({
    searchKey: 'branch',
    btnLoading: false
  }),
  methods: {
    async fetchData() {
      const res = await getDevEnvironmentList(this.selectedProjectId)
      return res.data
    },
    async redeploy(pId, branchName) {
      this.btnLoading = true
      try {
        await redeployDevEnvironmentByBranchName(pId, branchName)
        await this.loadData()
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
        title: this.$t('general.Success'),
        message: this.$t('Notify.Copied'),
        type: 'success'
      })
    },
    async handleDelete(pId, branchName) {
      this.btnLoading = true
      try {
        await deleteDevEnvironmentByBranchName(pId, branchName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.btnLoading = false
    }
  }
}
</script>
