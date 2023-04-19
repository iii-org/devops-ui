<template>
  <el-row v-loading="listLoading" :element-loading-text="$t('Loading')" class="app-container">
    <ProjectListSelector />
    <el-divider />
    <el-row :gutter="10">
      <el-col :span="24">
        <el-card id="list" shadow="hover">
          <div v-if="versionList.length" style="overflow-y: auto; max-height: calc(100vh - 235px);">
            <div style="display: flex; justify-content: center;">
              <el-button v-if="listLoading && !noMoreNew" type="text">{{ $t('Loading') }}</el-button>
              <el-button
                v-if="!listLoading && !noMoreNew"
                type="text"
                @click="fetchAll(false, 'new')"
              >
                {{ $t('LoadMore') }}
              </el-button>
            </div>
            <el-collapse v-model="activeNames" accordion @change="onCollapseChange">
              <el-collapse-item v-for="version in versionList" :id="`version${version.id}`" :ref="`version${version.id}`" :key="version.id" :name="version.id">
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
            </el-collapse>
            <div style="display: flex; justify-content: center;">
              <el-button v-if="listLoading && !noMoreOld" type="text">{{ $t('Loading') }}</el-button>
              <el-button
                v-if="!listLoading && !noMoreOld"
                type="text"
                @click="fetchAll(false, 'old')"
              >
                {{ $t('LoadMore') }}
              </el-button>
            </div>
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
      splitArray: { old: [], new: [] },
      loadCount: { old: 0, new: 0 },
      splitCount: 5,
      workList: {},
      activeIndex: [],
      closest: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    noMoreOld () {
      return this.splitArray.old.length === this.loadCount.old
    },
    noMoreNew () {
      return this.splitArray.new.length === this.loadCount.new
    }
  },
  watch: {
    selectedProjectId() {
      this.getVersionList()
    }
  },
  created() {
    this.getVersionList()
  },
  methods: {
    async getVersionList() {
      this.listLoading = true
      await getProjectVersion(this.selectedProjectId)
        .then(async (resVersion) => {
          if (resVersion.data.versions.length === 0) return
          this.versions = resVersion.data.versions.sort(
            (objA, objB) => Number(new Date(objB.due_date)) - Number(new Date(objA.due_date)),
          )
          this.closest = this.closestDate()
          if (this.versions.length > this.splitCount) {
            this.makeSplitArray()
          } else this.splitArray.old = [this.versions]
          await this.fetchAll(true, 'old')
        })
      this.listLoading = false
    },
    closestDate() {
      const today = new Date()
      const closest = this.versions.reduce((a, b) => {
        const aDiff = Math.abs(new Date(a.due_date) - today)
        const bDiff = Math.abs(new Date(b.due_date) - today)
        return aDiff < bDiff ? a : b
      })
      return closest
    },
    makeSplitArray() {
      const temp = { old: [], new: [] }
      this.versions.map((data) => {
        if (new Date(data.due_date) > new Date(this.closest.due_date)) {
          temp.new.push(data)
        } else temp.old.push(data)
      })
      temp.new = temp.new.reverse()
      for (const idx of Object.keys(temp)) {
        if (temp[idx].length === 0) return
        for (let i = 0; i < temp[idx].length; i += this.splitCount) {
          const split = temp[idx].slice(i, i + this.splitCount)
          this.splitArray[idx][this.splitArray[idx].length] = idx === 'new' ? split.reverse() : split
        }
      }
    },
    async fetchAll(collapse, type) {
      if (this.selectedProjectId === -1) return
      this.listLoading = true
      await Promise.all(
        this.splitArray[type][this.loadCount[type]].map(async ({ id }) => {
          const res = await getProjectIssueProgress(this.selectedProjectId, { fixed_version_id: id })
          return res
        })
      ).then((res) => {
        if (this.loadCount[type] >= this.splitArray[type].length) return
        const newVersionList = res.map(({ data }, idx) => {
          const close = data.Closed || 0
          const total_issue = Object.values(data).reduce((a, b) => a + b, 0)
          if (!this.splitArray[type][this.loadCount[type]]) return
          return {
            ...data,
            id: this.splitArray[type][this.loadCount[type]][idx]?.id,
            name: this.splitArray[type][this.loadCount[type]][idx]?.name,
            due_date: this.splitArray[type][this.loadCount[type]][idx]?.due_date,
            workLoadData: {},
            close,
            total_issue
          }
        })
        if (newVersionList.length !== 0) {
          if (type === 'new') {
            this.versionList = [...newVersionList, ...this.versionList]
          } else {
            this.versionList = [...this.versionList, ...newVersionList]
          }
        }
      })
      this.loadCount[type]++
      const el = document.getElementById(`version${this.closest.id}`)
      if (collapse && this.versionList.length > 0 && el) {
        this.activeNames = this.closest.id
        await this.onCollapseChange(this.closest.id)
      }
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
    async onCollapseChange(value) {
      if (!value) return
      if (this.activeIndex.includes(value)) return
      this.activeIndex.push(value)
      await this.fetchDetails(value)
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
      const el = document.getElementById(`version${versionId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }
}
</script>
