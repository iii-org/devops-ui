<template>
  <div v-loading="listLoading" :element-loading-text="$t('Loading')" class="app-container">
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
      <el-col class="text-right text-body-1 mb-2 text-info">
        {{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}
      </el-col>
      <el-col v-for="deployment in filteredData" :key="deployment.commit_id" v-loading="listLoading" :span="24">
        <el-card class="mb-2" :body-style="{ padding: '20px' }" shadow="never">
          <div class="d-flex justify-space-between mb-2">
            <div>
              <span class="text-h6 font-weight-bold">
                <svg-icon class="mr-1" icon-class="mdi-branch" />
                {{ deployment.branch }}
              </span>
              <el-link
                class="ml-2"
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
                type="primary"
                size="mini"
                icon="el-icon-refresh"
                plain
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
                <el-button slot="reference" size="mini" type="danger" plain>
                  <i class="el-icon-delete" />
                  {{ $t('general.Delete') }}
                </el-button>
              </el-popconfirm>
            </div>
          </div>
          <el-row :gutter="10">
            <el-col v-for="pod in deployment.pods" :key="pod.pod_name" class="mb-1" :sm="12" :md="8" :lg="6" :xl="4">
              <el-card :body-style="{ padding: '10px', 'background-color': '#f9fafc' }" shadow="never">
                <div class="mb-2 ml-2">
                  <svg-icon class="mr-1 text-caption" icon-class="k8s-pod" />
                  <span class="text-caption">{{ $t('ProcessDevEnvironment.Pod') }}</span>
                  <div class="font-weight-bold">{{ pod.pod_name }}</div>
                </div>
                <el-row :gutter="10">
                  <el-col :span="24">
                    <el-card
                      v-for="(container, idx) in pod.containers"
                      :key="container.name + idx"
                      class="my-1 border border-light"
                      :body-style="{ padding: '10px' }"
                      shadow="hover"
                    >
                      <div class="text-right">
                        <el-tag
                          v-if="container.status.state"
                          :type="getStateType(container.status.state)"
                          size="mini"
                          effect="dark"
                        >
                          {{ container.status.state }}
                        </el-tag>
                      </div>

                      <div class="mb-3">
                        <svg-icon class="mr-1 text-caption" icon-class="mdi-inbox" />
                        <span class="text-caption">{{ $t('ProcessDevEnvironment.Container') }}</span>
                        <div class="font-weight-bold ml-5">{{ container.name }}</div>
                      </div>

                      <div class="mb-3">
                        <svg-icon class="mr-1 text-caption" icon-class="mdi-clock-outline" />
                        <span class="text-caption mr-1">{{ $t('general.StartTime') }}</span>
                        <div class="font-weight-bold ml-5">{{ container.status.time | relativeTime }}</div>
                      </div>

                      <div v-for="(servicePM, servicePMIdx) in container.service_port_mapping" :key="servicePMIdx">
                        <svg-icon class="mr-1 text-caption" icon-class="mdi-family-tree" />
                        <span class="text-caption">{{ $t('ProcessDevEnvironment.Services') }}</span>
                        <div v-for="(service, serviceIdx) in servicePM.services" :key="serviceIdx" class="ml-5">
                          <el-popover
                            v-if="service.service_type === 'db-server'"
                            placement="top"
                            width="400"
                            trigger="click"
                            :open-delay="300"
                            :close-delay="50"
                          >
                            <p :id="`copy-${serviceIdx}`" class="text-center">
                              <span class="text-subtitle-1 font-weight-bold">
                                {{ service.url[0] }}
                              </span>
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
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <div v-else class="text-center">
      {{ $t('general.NoData') }}
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { deleteEnvironmentByBranchName, getEnvironmentList, redeployEnvironmentByBranchName } from '@/api/kubernetes'
import MixinElCardWithAProject from '@/components/MixinElCardWithAProject'

export default {
  name: 'ProgressDevEnvironment',
  mixins: [MixinElCardWithAProject],
  data() {
    return {
      searchKey: 'branch',
      btnLoading: false,
      timer: null,
      lastUpdateTime: ''
    }
  },
  mounted() {
    this.timer = setInterval(() => this.fetchData(), 10000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    async fetchData() {
      const res = await getEnvironmentList(this.selectedProjectId)
      this.lastUpdateTime = this.$dayjs(res.datetime)
        .utcOffset(16)
        .format('YYYY-MM-DD HH:mm:ss')
      res.data.forEach((item, idx) => {
        const result = { ...item }
        this.$set(this.listData, idx, result)
      })
      return res.data
    },
    async redeploy(pId, branchName) {
      this.btnLoading = true
      try {
        await redeployEnvironmentByBranchName(pId, branchName)
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
        await deleteEnvironmentByBranchName(pId, branchName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.btnLoading = false
    }
  }
}
</script>
