<template>
  <el-row class="app-container">
    <el-col>
      <project-list-selector>
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('ProjectUsage.SearchPods')"
          style="width: 250px"
        />
      </project-list-selector>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        height="calc(100vh - 300px)"
        fit
      >
        <el-table-column :label="$t('PodsList.Pods')" align="center" prop="name">
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
            <div class="text-sm my-1">
              <em class="el-icon-time" />
              <el-tooltip placement="bottom" :content="scope.row.created_time | UTCtoLocalTime">
                <span>{{ scope.row.created_time | relativeTime }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('PodsList.Container')" header-align="center" prop="container">
          <template slot-scope="scope">
            <div v-for="container in scope.row.containers" :key="container.name" class="my-3">
              <div style="text-align: left">
                <div style="display: inline-block; width: 80px;text-align: center">
                  <el-tag
                    v-if="container.state"
                    class="el-tag--circle"
                    :type="getStateType(container.state)"
                    size="mini"
                    effect="dark"
                  >
                    {{ container.state }}
                  </el-tag>
                </div>
                <em class="el-icon-time" />
                <el-tooltip placement="top" :content="container.time | UTCtoLocalTime">
                  <span class="text-sm">{{ container.time | relativeTime }}</span>
                </el-tooltip>
                <div class="ml-3 my-1">
                  <em class="el-icon-box" /> <span class="text-title"> {{ container.name }}</span>
                </div>
                <div class=" ml-3 my-1">
                  <em class="el-icon-refresh-right" />
                  <span>Restarts：{{ container.restart }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('PodsList.Image')" align="center">
          <template slot-scope="scope">
            <div v-for="container in scope.row.containers" :key="container.name" class="my-3">
              <div>{{ container.image }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Actions')" align="center" width="180">
          <template slot-scope="scope">
            <div class="flex items-center">
              <div>
                <div v-for="container in scope.row.containers" :key="container.name" class="my-1">
                  <el-button size="mini" type="primary" @click="handleLogClick(scope.row.name, container.name)">
                    log
                  </el-button>
                </div>
              </div>
              <div>
                <el-popconfirm
                  confirm-button-text="Delete"
                  cancel-button-text="Cancel"
                  icon="el-icon-info"
                  icon-color="red"
                  title="Are you sure?"
                  @confirm="handleDelete(selectedProjectId, scope.row.name)"
                >
                  <el-button slot="reference" size="mini" type="danger">
                    <em class="el-icon-delete" />
                    {{ $t('general.Delete') }}
                  </el-button>
                </el-popconfirm>
              </div>
            </div>
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
      <pod-log
        ref="podLogDialog"
        :pod-name="focusPodName"
        :container-name="focusContainerName"
      />
    </el-col>
  </el-row>
</template>

<script>
import { deletePod, getPodList } from '@/api/kubernetes'
import PodLog from './components/PodLog'
import { BasicData, SearchBar, Pagination, Table, ProjectSelector } from '@/newMixins'

export default {
  name: 'PodsList',
  components: { PodLog },
  mixins: [BasicData, SearchBar, Pagination, Table, ProjectSelector],
  data() {
    return {
      focusPodName: '',
      focusContainerName: ''
    }
  },
  methods: {
    async fetchData() {
      return (await getPodList(this.selectedProjectId)).data
    },
    async handleDelete(pId, podName) {
      this.listLoading = true
      try {
        await deletePod(pId, podName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    handleLogClick(podName, containerName) {
      this.focusPodName = podName
      this.focusContainerName = containerName
      this.$refs.podLogDialog.fetchData(podName, containerName)
      this.$refs.podLogDialog.dialogVisible = true
    },
    showPodLogDialog(visible) {
      this.podLogDialogVisible = visible
    },
    getStateType(state) {
      const mapStateType = {
        pending: 'slow',
        running: 'success',
        succeeded: 'success',
        failed: 'danger',
        unknown: 'warning'
      }
      return mapStateType[state] || 'slow'
    }
  }
}
</script>
