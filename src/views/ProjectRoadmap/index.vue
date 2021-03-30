<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import {
  getProjectVersion,
  getProjectIssueProgress,
  getProjectIssueListByVersion,
  getProjectIssueStatistics
} from '@/api/projects'

import IssuePriorityCard from '@/views/ProjectOverview/components/IssuePriorityCard'

export default {
  name: 'ProjectRoadmap',
  components: {
    ProjectListSelector,
    IssuePriorityCard
  },
  data() {
    return {
      listLoading: true,
      contentLoading: false,
      workLoad: '',
      workLoadData: {},
      workLoadTypes: [],
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
        const { Active, Assigned, Closed, Finished, Responded, Solved, Unknown } = data
        const total_issue = Active + Assigned + Closed + Finished + Responded + Solved + Unknown
        const open = Active + Assigned + Finished + Responded + Solved + Unknown
        return {
          ...data,
          id: versions[idx].id,
          name: versions[idx].name,
          total_issue,
          open
        }
      })
      this.listLoading = false
    },
    getVersionTagType(item) {
      const percentage = this.getProgressPercentage(item)
      if (percentage === 0) return 'danger'
      if (percentage === 100) return 'success'
      return 'primary'
    },
    getProgressPercentage(item) {
      if (item.total_issue > 0 && item.open === 0) return 100
      return Number((item.total_issue > 0 ? ((item.total_issue - item.open) / item.total_issue) * 100 : 0).toFixed(1))
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
      this.workLoadData = resStatistics.data
      this.workLoadTypes = Object.keys(this.workLoadData).map(key => {
        return { id: key, name: key }
      })
      this.workLoad = this.workLoadTypes.length > 0 ? this.workLoadTypes[0].id : ''
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
                <div class="d-flex justify-space-around align-center">
                  <el-tag class="mr-5" effect="dark" :type="getVersionTagType(version)" size="small">
                    {{ version.name }}
                  </el-tag>
                  <div class="mr-7" style="width: 700px">
                    <el-progress :percentage="getProgressPercentage(version)" :status="version.type" />
                  </div>
                  <div class="text-h6">{{ version.total_issue - version.open }}／{{ version.total_issue }}</div>
                </div>
              </template>
              <el-row v-loading="contentLoading" :gutter="12">
                <el-col :span="8">
                  <el-table :data="workList[version.id]" style="width: 100%" border stripe>
                    <el-table-column label="Work List">
                      <template slot-scope="scope">
                        <el-tag
                          v-if="scope.row.issue_priority"
                          :type="getPriorityType(scope.row.issue_priority)"
                          size="medium"
                          effect="dark"
                        >
                          {{ scope.row.issue_priority }}
                        </el-tag>
                        <span class="font-weight-bold mr-2">[{{ scope.row.issue_category }}]</span>
                        <span>{{ scope.row.issue_name }} </span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-col>
                <el-col :span="16">
                  <issue-priority-card ref="issuePriority" :statistics-obj="workLoadData" />
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
