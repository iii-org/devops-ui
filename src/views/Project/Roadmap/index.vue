<template>
  <el-row v-loading="listLoading" :element-loading-text="$t('Loading')" class="app-container">
    <ProjectListSelector />
    <el-divider />
    <el-row :gutter="10">
      <el-col :span="24">
        <el-card shadow="hover">
          <div v-if="versionList.length" style="overflow-y: scroll; max-height: calc(100vh - 230px);">
            <el-collapse v-model="activeNames" accordion @change="onCollapseChange">
              <ul v-infinite-scroll="fetchAll" :infinite-scroll-disabled="disabled">
                <el-collapse-item v-for="version in versionList" :key="version.id" :name="version.id">
                  <template slot="title">
                    <div class="flex items-center">
                      <el-tag class="el-tag--circle mr-5" effect="dark" :type="getVersionTagType(version)" size="small">
                        {{ version.name }}
                      </el-tag>
                      <div class="mr-7" style="width: 700px">
                        <el-progress :percentage="getProgressPercentage(version)" :status="version.type" />
                      </div>
                      <div class="text-title">{{ version.close }}／{{ version.total_issue }}</div>
                    </div>
                  </template>
                  <el-row v-loading="contentLoading" :gutter="12">
                    <el-col :span="8">
                      <el-table :data="workList[version.id]" style="width: 100%" stripe>
                        <el-table-column :label="$t('Issue.List')">
                          <template slot-scope="{row}">
                            <div>
                              <Priority v-if="row.priorityName" class="mr-2" :name="$t(`Issue.${row.priorityName}`)" :type="row.priorityName" />
                              <Tracker :name="$t(`Issue.${row.trackerName}`)" :type="row.trackerName" />
                              <div class="mt-2">
                                <el-tag v-for="item in row.tags" :key="item.id" size="mini" class="mr-1">[{{ item.name }}]</el-tag>
                                {{ row.name }}</div>
                            </div>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-col>
                    <el-col :span="16">
                      <WorkloadCard ref="issuePriority" :statistics-obj="version.workLoadData" />
                    </el-col>
                  </el-row>
                </el-collapse-item>
              </ul>
            </el-collapse>
            <p v-if="listLoading">{{ $t('Loading') }}</p>
          </div>
          <el-empty v-else :description="$t('general.NoData')" />
        </el-card>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getProjectVersion,
  getProjectIssueProgress,
  getProjectIssueStatistics,
  getProjectIssueList
} from '@/api/projects'
import Issue from '@/data/issue'
import { ProjectListSelector } from '@/components'
import { Tracker, Priority } from '@/components/Issue'
import WorkloadCard from '@/views/Plan/Overview/components/WorkloadCard'

export default {
  name: 'ProjectRoadmap',
  components: {
    ProjectListSelector,
    WorkloadCard,
    Tracker,
    Priority
  },
  data() {
    return {
      listLoading: false,
      contentLoading: false,
      workLoad: '',
      activeNames: '',
      versionList: [],
      versions: [],
      splitarrayId: [],
      splitCount: 10,
      loadCount: 0,
      noMore: false,
      workList: {},
      activeIndex: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    disabled () {
      return this.loading || this.noMore
    }
  },
  watch: {
    selectedProjectId() {
      this.getVersionList()
    },
    loadCount() {
      if (this.splitarrayId.length === this.loadCount) {
        this.noMore = true
      }
    }
  },
  created() {
    this.getVersionList()
  },
  methods: {
    async getVersionList() {
      this.listLoading = true
      const resVersion = await getProjectVersion(this.selectedProjectId)
      this.versions = resVersion.data.versions
      if (this.versions.length && this.versions.length > this.splitCount) {
        for (var i = 0; i < this.versions.length; i += this.splitCount) {
          this.splitarrayId[this.splitarrayId.length] = this.versions.slice(i, i + this.splitCount)
        }
      } else {
        this.splitarrayId = [this.versions]
      }
      this.fetchAll()
    },
    async fetchAll() {
      if (this.noMore) return
      if (this.selectedProjectId === -1) return
      this.listLoading = true
      await Promise.all(
        this.splitarrayId[this.loadCount].map(({ id }) => getProjectIssueProgress(this.selectedProjectId, { fixed_version_id: id }))
      ).then((res) => {
        if (this.loadCount >= this.splitarrayId.length) return
        const newVersionList = res.map(({ data }, idx) => {
          const close = data.Closed || 0
          const total_issue = Object.values(data).reduce((a, b) => a + b, 0)
          if (!this.splitarrayId[this.loadCount]) return
          return {
            ...data,
            id: this.splitarrayId[this.loadCount][idx]?.id,
            name: this.splitarrayId[this.loadCount][idx]?.name,
            workLoadData: {},
            close,
            total_issue
          }
        })
        this.versionList = [...this.versionList, ...newVersionList]
      })
      this.loadCount++
      this.listLoading = false
    },
    getVersionTagType(version) {
      const percentage = this.getProgressPercentage(version)
      if (percentage === 0) return 'danger'
      if (percentage === 100) return 'success'
      return 'primary'
    },
    getProgressPercentage(version) {
      if (version.total_issue === 0) return 0
      return Number(((version.close / version.total_issue) * 100).toFixed(1))
    },
    onCollapseChange(value) {
      if (!value) return
      if (this.activeIndex.includes(value)) return
      this.activeIndex.push(value)
      this.fetchDetails(value)
    },
    async fetchDetails(versionId) {
      this.contentLoading = true
      const resProjectIssue = await getProjectIssueList(this.selectedProjectId, {
        fixed_version_id: versionId
      })
      const issues = []
      for (const issue_data of resProjectIssue.data) {
        issues.push(new Issue(issue_data))
      }
      this.$set(this.workList, versionId, issues)
      const resStatistics = await getProjectIssueStatistics(this.selectedProjectId, { fixed_version_id: versionId })
      const idx = this.versionList.findIndex(item => item.id === versionId)
      this.versionList[idx].workLoadData = resStatistics.data
      this.contentLoading = false
    }
  }
}
</script>
