<script>
// ready to refactor
import { mapGetters, mapActions } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import projectPie from './components/project_pie'
import projectBar from './components/project_bar'
import {
  getProjectVersion,
  getProjectIssueProgress,
  getProjectIssueStatistics,
  getProjectTest,
  getTestReport
} from '@/api/projects'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'OverviewProject',
  components: {
    projectPie,
    projectBar,
    ProjectListSelector,
    ElTableColumnTime
  },
  data: () => ({
    isLoading: true,
    projectTestLoading: true,
    projectVersion: '',
    projectVersionList: [],
    workLoad: '',
    workLoadData: {},
    workLoadTypes: [],
    workLoadSelected: {},
    issueProgress: { total_issue: 0, unfinished_number: 0 },
    tableData: [],
    projectData: [],
    legend: false
  }),
  computed: {
    ...mapGetters(['userProjectList', 'selectedProjectId'])
  },
  watch: {
    selectedProjectId(projectId) {
      this.fetchAll()
    },
    projectVersion() {
      this.isLoading = true
      this.fetchByVersion()
    }
  },
  async created() {
    this.fetchAll()
  },
  methods: {
    ...mapActions('projects', ['getProjectIssueProgress', 'getProjectIssueStatistics', 'getProjectUserList']),
    onWorkLoadChange(value) {
      this.workLoadSelected = this.workLoadData[value]
    },
    legendFun(value) {
      this.legend = value.toString()
    },
    async fetchAll() {
      this.isLoading = true
      if (this.selectedProjectId !== -1) {
        const versionsRes = await getProjectVersion(this.selectedProjectId)
        this.projectVersionList = versionsRes.data.versions
        if (this.projectVersionList.length !== 0) {
          this.projectVersion = this.projectVersionList[0].id
        } else {
          this.projectVersion = ''
        }
        this.fetchByVersion()
        this.fetchProjectTest()
      } else {
        this.isLoading = false
        this.projectTestLoading = false
      }
    },
    async fetchByVersion() {
      // 如果無版本列表，預設帶整體專案統計資訊，後面不用帶版本參數
      let param = {}
      if (this.projectVersion !== '') {
        param = { fixed_version_id: this.projectVersion }
      }
      const res = await Promise.all([
        getProjectIssueProgress(this.selectedProjectId, param),
        getProjectIssueStatistics(this.selectedProjectId, param),
        this.getProjectUserList(this.selectedProjectId)
      ])
      this.isLoading = false
      this.issueProgress = res[0].data
      const statistics = res[1].data
      this.tableData = res[2].data.user_list || []
      this.workLoadData = statistics
      this.workLoadTypes = Object.keys(statistics).map(key => {
        return { id: key, name: key }
      })
      this.workLoad = this.workLoadTypes[0].id
      this.workLoadSelected = statistics[this.workLoad]
    },
    async fetchProjectTest() {
      this.projectTestLoading = true
      this.projectData = []
      let apiProjectData = await getProjectTest(this.selectedProjectId)
      // apiProjectData = apiProjectData.data
      apiProjectData = {
        test_results: {
          postman: {
            id: 17,
            passed: 1,
            failed: 0,
            total: 1,
            run_at: '2021-03-15 10:05:45.011605'
          },
          checkmarx: {
            message: 'success',
            status: 3,
            highSeverity: 0,
            mediumSeverity: 0,
            lowSeverity: 10,
            infoSeverity: 0,
            statisticsCalculationDate: '2021-03-15T18:25:59.96',
            run_at: '2021-03-15 10:03:47.411070',
            report_id: 5600
          },
          webinspect: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            status: 'Complete',
            run_at: '2021-03-05 08:15:42.146134'
          }
        }
      }

      for (const i in apiProjectData.test_results) {
        const object = {}
        // console.log(apiProjectData.test_result[i])
        let informationText = ''
        for (const j in apiProjectData.test_results[i]) {
          // console.log(j, apiProjectData.test_results[i][j])
          if (
            j !== 'message' &&
            j !== 'statisticsCalculationDate' &&
            j !== 'run_at' &&
            j !== 'status' &&
            j !== 'report_id' &&
            j !== 'id'
          ) {
            informationText = `${informationText} <div>${j}: ${apiProjectData.test_results[i][j]}</div>`
          }
        }
        if (i === 'postman') {
          informationText = `${informationText} <div style="flex: 1"> <div>`
          if (Object.keys(apiProjectData.test_results[i]).length === 0) {
            informationText = 'No data.'
          }
        } else if (i === 'checkmarx') {
          // checkmarx message https://github.com/iii-org/devops-system/wiki/Message-Strings
          if (
            this.$router.history.current.path === '/project/index' &&
            (apiProjectData.test_results[i].status === 1 || apiProjectData.test_results[i].status === 2)
          ) {
            this.timeout = setTimeout(() => {
              this.fetchProjectTest()
            }, 15000)
          }
          if (apiProjectData.test_results[i].status === -1) {
            informationText = 'This project does not have any scan.'
          } else if (apiProjectData.test_results[i].status === 1) {
            informationText = 'The scan is not completed yet. It may take several hours to complete.'
          } else if (apiProjectData.test_results[i].status === 2) {
            informationText = 'Scan done, the system is generating a report. It may take several minutes to complete.'
          } else if (apiProjectData.test_results[i].status === 3) {
            object['report_id'] = apiProjectData.test_results[i].report_id
          } else if (apiProjectData.test_results[i].status === 4) {
            informationText = 'The scan is canceled.'
          } else if (apiProjectData.test_results[i].status === 5) {
            informationText = 'The scan failed.'
          } else if (apiProjectData.test_results[i].status === undefined) {
            informationText = 'No data.'
          }
        } else if (i === 'webinspect') {
          if (Object.keys(apiProjectData.test_results[i]).length === 0) {
            informationText = 'No data.'
          } else {
            informationText = this.handleWebInspectInfoText(informationText)
          }
        }
        object['Software'] = i
        object['status'] = apiProjectData.test_results[i].status
        object['runAt'] = apiProjectData.test_results[i].run_at
        object['informationText'] = informationText
        this.projectData.push(object)
      }
      this.projectTestLoading = false
    },
    async fetchTestReport(reportId) {
      this.projectTestLoading = true
      await getTestReport(reportId).then(res => {
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'checkmarx_Report.pdf')
        document.body.appendChild(link)
        link.click()
      })
      this.projectTestLoading = false
    },
    handleWebInspectInfoText(text) {
      let result = text.replace('0:', 'Critical:')
      result = result.replace('1:', 'High Severity:')
      result = result.replace('2:', 'Medium Severity:')
      result = result.replace('3:', 'Low Severity:')
      result = result.replace('4:', 'Info Severity:')
      return result
    }
  }
}
</script>

<template>
  <div v-loading="isLoading" class="dashboard-container">
    <div class="clearfix">
      <project-list-selector />
      <el-select v-model="projectVersion" :placeholder="$t('Version.SelectVersion')" clearable>
        <el-option v-for="item in projectVersionList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </div>

    <el-divider />

    <el-row :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover" style="height: 400px">
          <div slot="header" class="clearfix" style="line-height: 40px">
            <span>{{ $t('general.Status') }}</span>
          </div>
          <div v-if="selectedProjectId == -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <project-pie :the-data="issueProgress" />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" style="height:400px">
          <div slot="header" class="clearfix" style="line-height:40px; position: relative">
            <span>{{ $t('Project.Workload') }}</span>
            <el-select
              v-model="workLoad"
              placeholder="select a project"
              style="float: right"
              @change="onWorkLoadChange"
            >
              <el-option v-for="item in workLoadTypes" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <div v-if="legend == 'true'" class="bar-header">
              <div class="d-inline-block">
                <span v-if="workLoad == 'priority'" class="legend-box" style="background: #E85656" />
                <span v-if="workLoad == 'priority'" class="legend-box" style="background: #F9BE6E" />
                <span v-if="workLoad == 'priority'" class="legend-box" style="background: #2EC6C8" />
                <span class="legend-box" style="background: #56b1e8" />
                <span>{{ $t('Dashboard.Finished') }}</span>
              </div>
              <div class="d-inline-block">
                <span class="legend-box" />
                <span>{{ $t('Dashboard.Unfinished') }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedProjectId == -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <project-bar :the-data="workLoadSelected" @legend-fun="legendFun" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover" style="min-height: 400px">
          <div slot="header" class="clearfix">
            <span>{{ $t('Project.ProjectMembers') }}</span>
          </div>
          <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column prop="role_name" :label="$t('Project.Title')" />
            <el-table-column prop="name" :label="$t('general.Name')" />
            <el-table-column prop="email" :label="$t('general.Email')" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card v-loading="projectTestLoading" shadow="hover" style="min-height: 400px" class="status-wrap">
          <div slot="header" class="d-flex justify-space-between align-center">
            <span>{{ $t('Project.TestStatus') }}</span>
            <span class="reload-btn">
              <el-button
                v-if="selectedProjectId !== -1"
                type="text"
                class="text-body-1 py-0"
                icon="el-icon-refresh"
                size="mini"
                @click="fetchProjectTest()"
              >
                Reload
              </el-button>
            </span>
          </div>
          <el-table
            :data="projectData"
            stripe
            style="width: 100%"
            border
            :header-cell-style="{ background: '#f4f7fa', color: '#555' }"
          >
            <el-table-column :label="$t('Project.Software')" prop="Software" width="130" align="center" />
            <el-table-column-time :label="$t('general.RunAt')" prop="runAt" align="center" :min-width="50" />
            <el-table-column :label="$t('Project.Brief')" header-align="center">
              <template slot-scope="scope">
                <div
                  style="width: 100%; display: flex ;word-break: keep-all; flex-wrap: wrap;"
                  v-html="scope.row.informationText"
                />
              </template>
            </el-table-column>
            <el-table-column :label="$t('Project.Report')" width="80" align="center">
              <template slot-scope="scope">
                <el-link
                  v-if="scope.row.status == 3"
                  type="primary"
                  target="_blank"
                  :underline="false"
                  icon="el-icon-download"
                  @click="fetchTestReport(scope.row.report_id)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- <el-col :span="16">
        <el-card shadow="hover" style="min-height: 400px">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Weekly Progress</span>
          </div>
          <project-gantt />
        </el-card>
      </el-col> -->
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}

.el-button--mini.is-circle {
  color: #3ecbbc;
  padding: 0;
  background: none;
  border: none;
}
</style>
