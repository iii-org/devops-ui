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
        :placeholder="$t('Git.searchCommitId')"
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
      height="100%"
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
                {{ $t(`SBOM.${scope.row.scan_status}`) }}
              </span>
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('SBOM.PackageCount')"
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
        :label="$t('SBOM.HighSeverity')"
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
        :label="$t('SBOM.MediumSeverity')"
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
        :label="$t('SBOM.LowSeverity')"
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
        :label="$t('SBOM.RunAt')"
        prop="created_at"
      />
      <el-table-column
        :label="$t('SBOM.Report')"
        width="100"
      >
        <template slot-scope="scope">
          <el-tooltip
            placement="bottom"
            :content="$t('SBOM.TraceabilityDownload')"
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
            :content="$t('SBOM.VulnerabilityReport')"
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
    <pagination
      :total="listQuery.total"
      :page="listQuery.page"
      :limit="listQuery.per_page"
      :layout="'total, prev, pager, next'"
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
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { ElTableColumnTime } from '@/components'
import PodLog from '@/views/SystemResource/PluginResource/components/PodsList/components/PodLog'
import * as elementTagType from '@/utils/elementTagType'

const params = () => ({
  per_page: 10,
  page: 1
})

const listQuery = () => ({
  total: 0,
  current: 0,
  per_page: 0
})

export default {
  name: 'Sbom',
  components: {
    ElTableColumnTime,
    PodLog,
    Error: () => import('@/views/Error')
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      keyword: '',
      params: params(),
      listQuery: listQuery(),
      sbomList: [],
      timeoutId: -1,
      pod: {},
      error: {},
      downloadLoading: false,
      downloadList: []
    }
  },
  watch: {
    keyword(val) {
      clearTimeout(this.timeoutId)
      this.timeoutId = window.setTimeout(() => this.onSearch(val), 1000)
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.timeoutId)
  },
  async mounted() {
    this.pod = (await getSbomPod(this.selectedProjectId)).data
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) return []
      this.listLoading = true
      const res = await getSbomList(this.selectedProjectId, this.params)
      this.setListData(res)
      this.listLoading = false
    },
    setListData(res) {
      this.sbomList = res.data.Sbom_list
      this.listQuery = res.data.page
    },
    async onSearch(keyword) {
      this.params.search = keyword
      this.params.page = 1
      if (keyword === '') delete this.params.search
      await this.fetchData()
    },
    async onPagination(query) {
      const { page } = query
      this.params.page = page
      if (this.keyword !== '') this.params.search = this.keyword
      await this.fetchData()
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
          const url = window.URL.createObjectURL(new Blob([res]))
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
      localStorage.setItem('sbomTime', row.created_at)
      this.$router.push({
        name: 'SbomReport',
        params: {
          commitId: row.commit,
          commitBranch: row.branch,
          sbomId: row.id,
          projectId: this.selectedProjectId
        }
      })
    }
  }
}
</script>