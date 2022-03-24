<template>
  <el-row
    v-loading="listLoading"
    :element-loading-text="$t('Loading')"
    class="app-container"
  >
    <el-col>
      <ProjectListSelector>
        <el-input
          v-model="keyword"
          style="width: 250px"
          prefix-icon="el-icon-search"
          :placeholder="$t('general.SearchBranch')"
        />
      </ProjectListSelector>
      <el-divider />
      <el-row
        v-if="filteredData.length > 0"
        :gutter="10"
      >
        <el-col class="text-right text-base mb-2 text-info">
          {{ $t('general.LastUpdateTime') }}：{{ lastUpdateTime }}
        </el-col>

        <el-col
          v-for="pod in filteredData"
          :key="pod.branch + pod.commit_id"
          :span="24"
        >
          <el-card
            class="mb-2"
            :body-style="{ padding: '20px' }"
            shadow="never"
          >
            <div class="flex justify-between mb-2">
              <div>
                <span class="text-title">
                  <em class="ri-git-branch-line mr-1" />
                  {{ pod.branch }}
                </span>
                <el-link
                  class="ml-2 linkTextColor"
                  style="font-size: 14px"
                  target="_blank"
                  :href="pod.commit_url"
                >
                  <svg-icon
                    class="mr-1"
                    icon-class="ion-git-commit-outline"
                  />{{ pod.commit_id }}
                </el-link>
              </div>
              <div>
                <el-button
                  class="buttonPrimaryReverse"
                  size="mini"
                  icon="el-icon-refresh"
                  plain
                  @click="redeploy(selectedProject.id, pod.branch)"
                >
                  {{ $t('general.Redeploy') }}
                </el-button>
                <el-popconfirm
                  :confirm-button-text="$t('general.Delete')"
                  :cancel-button-text="$t('general.Cancel')"
                  icon="el-icon-info"
                  icon-color="red"
                  :title="$t('Notify.confirmDelete')"
                  @confirm="handleDelete(selectedProject.id, pod.branch)"
                >
                  <el-button
                    slot="reference"
                    size="mini"
                    type="danger"
                    plain
                  >
                    <em class="el-icon-delete" />
                    {{ $t('general.Delete') }}
                  </el-button>
                </el-popconfirm>
              </div>
            </div>
            <el-row :gutter="20">
              <el-col
                v-for="(data, type, idx) in pod.pods"
                :key="type + idx"
                :class="data.length > 1 ? 'm-1 pod-border p-3 rounded' : 'm-1'"
                :sm="12"
                :md="8"
                :lg="6"
                :xl="4"
              >
                <div
                  v-for="(item, itemIdx) in data"
                  :key="item.type + itemIdx"
                  class="mb-2"
                >
                  <el-card
                    :body-style="{
                      padding: '10px',
                      'background-color': getCardBackgroundColor(item.type)
                    }"
                    shadow="never"
                  >
                    <div class="mb-2 ml-2">
                      <div class="flex justify-between mb-2">
                        <div class="text-base">
                          <svg-icon
                            class="mr-1"
                            icon-class="k8s-pod"
                          />
                          <span class="">{{ $t('ProcessDevEnvironment.Pod') }}</span>
                        </div>
                        <el-dropdown trigger="click">
                          <el-button
                            size="mini"
                            class="el-icon-more buttonPrimaryReverse"
                            plain
                            circle
                          />
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item
                              v-show="item.containers[0].state === 'running'"
                              @click.native="handleCommandClick(item.name, item.containers[0].name)"
                            >
                              <em class="ri-terminal-line mr-4" />command
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="handleLogClick(item.name, item.containers[0].name)">
                              <em class="ri-terminal-box-line mr-4" />log
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="handleDeletePods(selectedProjectId, item.name)">
                              <em class="el-icon-delete mr-4" />{{ $t('general.Delete') }}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                      </div>
                      <div class="text-xs font-bold">{{ item.name }}</div>
                    </div>

                    <el-row :gutter="10">
                      <el-col :span="24">
                        <el-card
                          v-for="(container, containerIdx) in item.containers"
                          :key="container.name + containerIdx"
                          class="pod-border"
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
                            <em class="mr-1 text-xs ri-inbox-line" />
                            <span class="text-xs">{{ $t('ProcessDevEnvironment.Container') }}</span>
                            <div class="font-bold ml-5">{{ container.name }}</div>
                          </div>

                          <div class="mb-2">
                            <em class="mr-1 text-xs ri-time-line" />
                            <span class="text-xs mr-1">{{ $t('general.StartTime') }}</span>
                            <div class="font-bold ml-5">{{ container.start_time | relativeTime }}</div>
                          </div>

                          <div
                            v-for="(servicePM, servicePMIdx) in container.services"
                            :key="servicePMIdx"
                          >
                            <em class="ri-node-tree mr-1 text-xs" />
                            <span class="text-xs">{{ $t('ProcessDevEnvironment.Services') }}</span>
                            <div
                              v-for="(service, serviceIdx) in servicePM.services"
                              :key="serviceIdx"
                              class="ml-5"
                            >
                              <el-popover
                                v-if="service.type === 'db-server'"
                                placement="top"
                                width="400"
                                trigger="click"
                                :open-delay="300"
                                :close-delay="50"
                              >
                                <p class="text-center">
                                  <span class="text-title">
                                    {{ service.url }}
                                  </span>
                                </p>
                                <div class="flex justify-center">
                                  <el-button
                                    icon="el-icon-copy-document"
                                    circle
                                    size="mini"
                                    @click="copyUrl(service.url)"
                                  />
                                </div>
                                <el-link
                                  slot="reference"
                                  :underline="false"
                                  :class="container.state !== 'running' ? '' : 'linkTextColor'"
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
                                class="mr-3"
                                :class="container.state !== 'running' ? '' : 'linkTextColor'"
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
      <div
        v-else
        class="text-center"
      >
        <el-empty :description="$t('general.NoData')" />
      </div>
      <pod-log
        ref="podLogDialog"
        :pod-name="focusPodName"
        :container-name="focusContainerName"
      />
    </el-col>
  </el-row>
</template>

<script>
import { deleteEnvironmentByBranchName, getEnvironmentList, redeployEnvironmentByBranchName } from '@/api/kubernetes'
import { BasicData, SearchBar, ProjectSelector } from '@/newMixins'
import PodLog from '@/views/Progress/KubernetesResources/components/PodsList/components/PodLog'
import { deletePod } from '@/api/kubernetes'

export default {
  name: 'ProgressDevEnvironment',
  components: { PodLog },
  mixins: [BasicData, SearchBar, ProjectSelector],
  data() {
    return {
      searchKeys: ['branch'],
      btnLoading: false,
      lastUpdateTime: '',
      focusPodName: '',
      focusContainerName: '',
      pods: []
    }
  },
  mounted() {
    this.handleSetInterval()
  },
  methods: {
    async fetchData() {
      const res = await getEnvironmentList(this.selectedProjectId)
      const result = this.formatEnvironments(res.data)
      this.lastUpdateTime = this.$dayjs().utc(res.datetime).format('YYYY-MM-DD HH:mm:ss')
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
    copyUrl(text) {
      this.$copyText(text).then(
        this.$message({
          message: this.$t('general.copied'),
          type: 'info'
        })
      )
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
    formatEnvironments(envInfos) {
      const result = envInfos.map((envInfo) => {
        const { branch, commit_id, commit_url, pods } = envInfo
        return {
          branch,
          commit_id,
          commit_url,
          pods: this.formatPods(pods)
        }
      })
      result.forEach((item) => {
        item.pods = item.pods.reduce((groups, item) => {
          const val = item['type']
          groups[val] = groups[val] || []
          groups[val].push(item)
          return groups
        }, {})
      })
      return result
    },
    formatPods(pods) {
      return pods.map((pod) => {
        const { pod_name, type, containers } = pod
        return {
          name: pod_name,
          type: type,
          containers: this.formatContainers(containers)
        }
      })
    },
    formatContainers(containers) {
      return containers.map((container) => {
        const { status, name, service_port_mapping } = container
        return {
          state: status.state,
          name: name,
          start_time: status.time,
          services: service_port_mapping.map((service) => ({
            services: service.services.map((service) => ({
              type: service.service_type,
              label: `${service.service_type} (post:${service.target_port})`,
              url: service.url[0]
            }))
          }))
        }
      })
    },
    handleSetInterval() {
      let timer = setInterval(() => this.fetchData(), 10000)
      this.$once('hook:beforeDestroy', () => {
        clearInterval(timer)
        timer = null
      })
    },
    handleCommandClick(podName, containerName) {
      this.$router.push({ name: 'Pod Execute Shell', query: { podName, containerName }})
    },
    handleLogClick(podName, containerName) {
      this.focusPodName = podName
      this.focusContainerName = containerName
      this.$refs.podLogDialog.fetchData(podName, containerName)
      this.$refs.podLogDialog.dialogVisible = true
    },
    async handleDeletePods(pId, podName) {
      this.listLoading = true
      this.$confirm(this.$t('Notify.confirmDeleteSth', { name: podName }), this.$t('general.Delete'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      })
        .then(() => {
          deletePod(pId, podName)
          this.loadData()
        })
        .catch(() => {})
      this.listLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.pod-border {
  border: 1px solid #bbb;
}
</style>
