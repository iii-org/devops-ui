<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <el-button
        v-if="pod.has_pod"
        slot="button"
        class="buttonPrimary"
        :disabled="selectedProjectId === -1"
        @click="handleLogClick"
      >
        <em class="ri-computer-line mr-1" />
        {{ $t('SonarQube.ScanLogs') }}
      </el-button>
      <el-input
        v-model="keyword"
        :placeholder="$t('Git.searchBranchOrCommitId')"
        prefix-icon="el-icon-search"
        style="width: 250px"
      />
    </ProjectListSelector>
    <el-divider />
    <div class="text-right mb-2">
      <el-button
        class="buttonPrimaryReverse"
        icon="el-icon-refresh"
        size="mini"
        plain
        @click="fetchData"
      >
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="sbomList"
      :cell-style="{ 'text-align': 'center' }"
      :header-cell-style="{ 'text-align': 'center' }"
      fit
    >
      <el-table-column
        :label="$t('Git.Branch')"
        prop="branch"
      />
      <el-table-column
        :label="$t('Git.Commit')"
        width="140"
      >
        <template slot-scope="scope">
          <el-link
            class="linkTextColor"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.commit_url"
          >
            <svg-icon
              class="mr-1"
              icon-class="ion-git-commit-outline"
            />
            {{ scope.row.commit }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Status')">
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.scan_status === 'Fail'"
            effect="dark"
            placement="bottom"
            :content="scope.row.logs"
          >
            <el-tag
              class="el-tag--circle"
              type="danger"
              effect="dark"
            >
              <span>
                {{ $t('general.Error') }}
              </span>
            </el-tag>
          </el-tooltip>
          <template v-else>
            <el-tag
              v-if="scope.row.scan_status"
              class="el-tag--circle"
              :type="handleType(scope.row.scan_status)"
              :effect="getTagEffect(scope.row.scan_status)"
            >
              <span>
                {{ $t(`Sbom.${scope.row.scan_status}`) }}
              </span>
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Sbom.PackageCount')"
        prop="package_nums"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.package_nums">
            {{ scope.row.package_nums }}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Sbom.HighSeverity')"
        prop="scan_overview.High"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.scan_overview && scope.row.scan_overview.High">
            {{ scope.row.scan_overview.High }}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Sbom.MediumSeverity')"
        prop="scan_overview.Medium"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.scan_overview && scope.row.scan_overview.Medium">
            {{ scope.row.scan_overview.Medium }}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Sbom.LowSeverity')"
        prop="scan_overview.Low"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.scan_overview && scope.row.scan_overview.Low">
            {{ scope.row.scan_overview.Low }}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column-time
        :label="$t('Sbom.RunAt')"
        prop="created_at"
      />
      <el-table-column
        :label="$t('Sbom.Report')"
        width="100"
      >
        <template slot-scope="scope">
          <el-tooltip
            placement="bottom"
            :content="$t('Sbom.TraceabilityDownload')"
          >
            <el-popover
              placement="bottom"
              trigger="click"
              :disabled="!scope.row.finished"
            >
              <div v-loading="downloadLoading">
                <template v-if="downloadList.length!==0">
                  <el-link
                    v-for="(item,index) in downloadList"
                    :key="index"
                    style="display: block; font-size: 16px;"
                    :underline="false"
                    @click="fetchTestReport(scope.row,item)"
                  >
                    {{ item }}
                  </el-link>
                </template>
                <template v-else>
                  <span>{{ $t('general.NoData') }}</span>
                </template>
              </div>
              <el-link
                slot="reference"
                icon="el-icon-download"
                style="font-size: 16px"
                :class="!scope.row.finished ? '' : 'linkTextColor'"
                :disabled="!scope.row.finished"
                :underline="false"
                @click="fetchDownloadList(scope.row)"
              />
            </el-popover>
          </el-tooltip>
          <el-tooltip
            placement="bottom-end"
            :content="$t('Sbom.VulnerabilityReport')"
          >
            <el-link
              :class="!scope.row.finished ? '' : 'linkTextColor'"
              style="font-size: 16px;"
              :disabled="!scope.row.finished"
              :underline="false"
              icon="el-icon-document"
              @click="handleToTestReport(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <template slot="empty">
        <Error v-if="Object.keys(error).length > 0" :error="error" />
        <el-empty v-else :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="listQuery.total"
      :page="listQuery.page"
      :limit="listQuery.per_page"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
    <PodLog
      ref="podLogDialog"
      :pod-name="pod.pod_name"
      :container-name="pod.container_name"
    />
  </el-row>
</template>

<script>
import {
  getSbomList,
  getSbomFile,
  getSbomDownloadFile,
  getSbomPod
} from '@/api_v2/sbom'
import { BasicData, SearchBar, Pagination } from '@/mixins'
import { ProjectListSelector, ElTableColumnTime } from '@/components'
import PodLog from '@/views/SystemResource/PluginResource/components/PodsList/components/PodLog'
import * as elementTagType from '@/utils/elementTagType'

export default {
  name: 'Sbom',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    PodLog,
    Error: () => import('@/views/Error')
  },
  mixins: [BasicData, SearchBar, Pagination],
  data() {
    return {
      storageName: 'sbom',
      storageType: ['SearchBar'],
      params: {
        page: 1,
        per_page: 10,
        search: this.keyword
      },
      sbomList: [],
      pod: {},
      error: {},
      downloadLoading: false,
      downloadList: []
    }
  },
  watch: {
    async keyword(value) {
      this.params.search = value
      this.params.page = 1
      this.storeKeyword()
      await this.loadData()
    }
  },
  async mounted() {
    this.pod = (await getSbomPod(this.selectedProjectId)).data
  },
  methods: {
    async fetchData() {
      const res = await getSbomList(this.selectedProjectId, this.params)
      this.setListData(res)
    },
    setListData(res) {
      this.sbomList = res.data.Sbom_list
      this.listQuery = res.data.page
    },
    async onPagination(query) {
      const { page, limit } = query
      this.params.page = page
      this.params.per_page = limit
      await this.loadData()
    },
    fetchDownloadList(row) {
      this.downloadLoading = true
      getSbomFile(row.id)
        .then((res) => {
          this.downloadList = res.data
        })
        .catch(() => {})
        .finally(() => {
          this.downloadLoading = false
        })
    },
    fetchTestReport(row, item) {
      getSbomDownloadFile(row.id, { file_name: item })
        .then((res) => {
          const url = window.URL.createObjectURL(res)
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', item)
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch(() => {})
    },
    handleLogClick() {
      this.$refs.podLogDialog.fetchData(this.pod.pod_name, this.pod.container_name)
      this.$refs.podLogDialog.dialogVisible = true
    },
    handleType(prop) {
      const location = 'sbom'
      return elementTagType[location][prop] || 'default'
    },
    getTagEffect(status) {
      const tagMap = { Building: 'light' }
      return tagMap[status] || 'dark'
    },
    async handleToTestReport(row) {
      sessionStorage.setItem('sbomTime', row.created_at)
      this.$router.push({
        name: 'SbomReport',
        params: {
          commitId: row.commit,
          commitBranch: row.branch,
          sbomId: row.id,
          packageCount: row.package_nums,
          projectId: this.selectedProjectId
        }
      })
    }
  }
}
</script>
