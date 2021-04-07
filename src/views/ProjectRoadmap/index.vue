<template>
  <div v-loading="listLoading" class="app-container">
    <div class="d-flex">
      <project-list-selector />
    </div>
    <el-divider />
    <el-row :gutter="10">
      <el-col :span="24">
        <el-card shadow="hover">
          <el-collapse v-if="versionList.length" v-model="activeNames" :accordion="true" @change="onCollapseChange">
            <el-collapse-item v-for="version in versionList" :key="version.id" :name="version.id">
              <template slot="title">
                <div class="d-flex align-center">
                  <el-tag class="mr-5" effect="dark" :type="getVersionTagType(version)" size="small">
                    {{ version.name }}
                  </el-tag>
                  <div class="mr-7" style="width: 700px">
                    <el-progress :percentage="getProgressPercentage(version)" :status="version.type" />
                  </div>
                  <div class="text-h6">{{ version.close }}／{{ version.total_issue }}</div>
                </div>
              </template>
              <el-row v-loading="contentLoading" :gutter="12">
                <el-col :span="8">
                  <el-table :data="workList[version.id]" style="width: 100%" border stripe>
                    <el-table-column label="Work List">
                      <template slot-scope="scope">
                        <div class="d-flex justify-space-between">
                          <el-tag
                            v-if="scope.row.issue_priority"
                            :type="getPriorityType(scope.row.issue_priority)"
                            size="medium"
                            effect="dark"
                          >
                            {{ scope.row.issue_priority }}
                          </el-tag>
                          <div>
                            <span class="font-weight-bold mr-2">[{{ scope.row.issue_category }}]</span>
                            <span>{{ scope.row.issue_name }} </span>
                          </div>
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
          </el-collapse>
          <div v-else class="text-center ma-7">
            <span>{{ $t('general.NoData') }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import {
  getProjectVersion,
  getProjectIssueProgress,
  getProjectIssueListByVersion,
  getProjectIssueStatistics
} from '@/api/projects'

import WorkloadCard from '@/views/ProjectOverview/components/WorkloadCard'

export default {
  name: 'ProjectRoadmap',
  components: {
    ProjectListSelector,
    WorkloadCard
  },
  data() {
    return {
      listLoading: true,
      contentLoading: false,
      workLoad: '',
      activeNames: '',
      versionList: [],
      workList: {},
      activeIndex: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    }
  },
  watch: {
    selectedProjectId() {
      this.fetchAll()
    }
  },
  mounted() {
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      this.listLoading = true
      const resVersion = await getProjectVersion(this.selectedProjectId)
      const { versions } = resVersion.data
      const resIssueProgress = await Promise.all(
        versions.map(({ id }) => getProjectIssueProgress(this.selectedProjectId, { fixed_version_id: id }))
      )
      this.versionList = resIssueProgress.map(({ data }, idx) => {
        const close = data.Closed || 0
        const total_issue = Object.values(data).reduce((a, b) => a + b, 0)
        return {
          ...data,
          id: versions[idx].id,
          name: versions[idx].name,
          workLoadData: {},
          close,
          total_issue
        }
      })
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
      const resProjectIssue = await getProjectIssueListByVersion(this.selectedProjectId, {
        fixed_version_id: versionId
      })
      this.$set(this.workList, versionId, resProjectIssue.data)

      const resStatistics = await getProjectIssueStatistics(this.selectedProjectId, { fixed_version_id: versionId })
      const idx = this.versionList.findIndex(item => item.id === versionId)
      this.versionList[idx].workLoadData = resStatistics.data

      this.contentLoading = false
    },
    getPriorityType(priority) {
      switch (priority) {
        case 'Immediate':
          return 'danger'
        case 'High':
          return 'warning'
        case 'Normal':
          return 'success'
        default:
          return 'slow'
      }
    }
  }
}
</script>
