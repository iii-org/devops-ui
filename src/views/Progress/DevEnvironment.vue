<template>
  <el-row v-loading="listLoading" :element-loading-text="$t('Loading')" class="app-container">
    <el-col>
      <div class="d-flex justify-space-between">
        <project-list-selector />
        <el-input
          v-model="searchData"
          style="width: 250px"
          prefix-icon="el-icon-search"
          :placeholder="$t('general.SearchBranch')"
        />
      </div>
      <el-divider />
      <el-row v-if="filteredData.length > 0" :gutter="10">
        <el-col class="text-right text-body-1 mb-2 text-info">
          {{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}
        </el-col>

        <el-col v-for="pod in filteredData" :key="pod.branch + pod.commit_id" :span="24">
          <el-card class="mb-2" :body-style="{ padding: '20px' }" shadow="never">
            <div class="d-flex justify-space-between mb-2">
              <div>
                <span class="text-h6 font-weight-bold">
                  <svg-icon class="mr-1" icon-class="mdi-branch" />
                  {{ pod.branch }}
                </span>
                <el-link class="ml-2" type="primary" style="font-size: 14px" target="_blank" :href="pod.commit_url">
                  <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ pod.commit_id }}
                </el-link>
              </div>
              <div>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-refresh"
                  plain
                  @click="redeploy(selectedProject.id, pod.branch)"
                >
                  {{ $t('general.Redeploy') }}
                </el-button>
                <el-popconfirm
                  confirm-button-text="Delete"
                  cancel-button-text="Cancel"
                  icon="el-icon-info"
                  icon-color="red"
                  title="Are you sure?"
                  @onConfirm="handleDelete(selectedProject.id, pod.branch)"
                >
                  <el-button slot="reference" size="mini" type="danger" plain>
                    <i class="el-icon-delete" />
                    {{ $t('general.Delete') }}
                  </el-button>
                </el-popconfirm>
              </div>
            </div>
            <el-row :gutter="10">
              <el-col
                v-for="(data, type, idx) in pod.pods"
                :key="type + idx"
                class="ma-1"
                :class="data.length > 1 ? 'border border-light pa-3 rounded' : ''"
                :sm="12"
                :md="8"
                :lg="6"
                :xl="4"
              >
                <div v-for="(item, itemIdx) in data" :key="item.type + itemIdx" class="mb-2">
                  <el-card
                    :body-style="{
                      padding: '10px',
                      'background-color': getCardBackgroundColor(item.type)
                    }"
                    shadow="never"
                  >
                    <div class="mb-2 ml-2">
                      <svg-icon class="mr-1 text-caption" icon-class="k8s-pod" />
                      <span class="text-caption">{{ $t('ProcessDevEnvironment.Pod') }}</span>
                      <div class="text-caption font-weight-bold">{{ item.name }}</div>
                    </div>

                    <el-row :gutter="10">
                      <el-col :span="24">
                        <el-card
                          v-for="(container, containerIdx) in item.containers"
                          :key="container.name + containerIdx"
                          class="border border-light rounded-lg"
                          :body-style="{ padding: '10px' }"
                          shadow="hover"
                        >
                          <div class="text-right">
                            <el-tag
                              v-if="container.state"
                              :type="getStateType(container.state)"
                              size="mini"
                              effect="dark"
                            >
                              {{ container.state }}
                            </el-tag>
                          </div>

                          <div class="mb-2">
                            <svg-icon class="mr-1 text-caption" icon-class="mdi-inbox" />
                            <span class="text-caption">{{ $t('ProcessDevEnvironment.Container') }}</span>
                            <div class="font-weight-bold ml-5">{{ container.name }}</div>
                          </div>

                          <div class="mb-2">
                            <svg-icon class="mr-1 text-caption" icon-class="mdi-clock-outline" />
                            <span class="text-caption mr-1">{{ $t('general.StartTime') }}</span>
                            <div class="font-weight-bold ml-5">{{ container.start_time | relativeTime }}</div>
                          </div>

                          <div v-for="(servicePM, servicePMIdx) in container.services" :key="servicePMIdx">
                            <svg-icon class="mr-1 text-caption" icon-class="mdi-family-tree" />
                            <span class="text-caption">{{ $t('ProcessDevEnvironment.Services') }}</span>
                            <div v-for="(service, serviceIdx) in servicePM.services" :key="serviceIdx" class="ml-5">
                              <el-popover
                                v-if="service.type === 'db-server'"
                                placement="top"
                                width="400"
                                trigger="click"
                                :open-delay="300"
                                :close-delay="50"
                              >
                                <p :id="`copy-${serviceIdx}`" class="text-center">
                                  <span class="text-subtitle-1 font-weight-bold">
                                    {{ service.url }}
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
                                  :disabled="container.state !== 'running'"
                                >
                                  <svg-icon :icon-class="getContainerType(service.type)" />
                                  {{ service.label }}
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
                                :href="service.url"
                                :disabled="container.state !== 'running'"
                              >
                                <svg-icon :icon-class="getContainerType(service.type)" />
                                {{ service.label }}
                              </el-link>
                            </div>
                          </div>
                        </el-card>
                      </el-col>
                    </el-row>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
      <div v-else class="text-center">
        {{ $t('general.NoData') }}
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { deleteEnvironmentByBranchName, getEnvironmentList, redeployEnvironmentByBranchName } from '@/api/kubernetes'
import MixinElCardWithAProject from '@/mixins/MixinElCardWithAProject'

export default {
  name: 'ProgressDevEnvironment',
  mixins: [MixinElCardWithAProject],
  data() {
    return {
      searchKey: 'branch',
      btnLoading: false,
      timer: null,
      lastUpdateTime: '',
      pods: []
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
      const result = this.formatEnvironments(res.data)
      this.lastUpdateTime = this.$dayjs()
        .utc(res.datetime)
        .format('YYYY-MM-DD HH:mm:ss')
      result.forEach((item, idx) => {
        const result = { ...item }
        this.$set(this.listData, idx, result)
      })
      return result
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
      const stateMap = {
        pending: 'slow',
        running: 'success',
        succeeded: 'success',
        failed: 'danger',
        unknown: 'warning'
      }
      return stateMap[state] || 'slow'
    },
    getContainerType(type) {
      const typeMap = {
        'db-server': 'db-server',
        'db-gui': 'db-gui',
        'web-server': 'web-server'
      }
      return typeMap[type] || ''
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
    },
    getCardBackgroundColor(type) {
      const colorMap = {
        'db-server': '#d1edc4',
        'db-gui': '#f8e3c5',
        'web-server': '#cce7f8'
      }
      return colorMap[type] || '#f9fafc'
    },
    formatEnvironments(pods) {
      const result = pods.map(pod => ({
        branch: pod.branch,
        commit_id: pod.commit_id,
        commit_url: pod.commit_url,
        pods: pod.pods.map(pod => ({
          name: pod.pod_name,
          type: pod.type,
          containers: pod.containers.map(container => ({
            state: container.status.state,
            name: container.name,
            start_time: container.status.time,
            services: container.service_port_mapping.map(service => ({
              services: service.services.map(service => ({
                type: service.service_type,
                label: `${service.service_type} (post:${service.target_port})`,
                url: service.url[0]
              }))
            }))
          }))
        }))
      }))
      result.forEach(item => {
        item.pods = item.pods.reduce((groups, item) => {
          const val = item['type']
          groups[val] = groups[val] || []
          groups[val].push(item)
          return groups
        }, {})
      })
      return result
    }
  }
}
</script>
