<script>
import { mapGetters, mapActions } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import projectPie from './components/project_pie'
import projectBar from './components/project_bar'
import {
  getProjectVersion,
  getProjectIssueProgress,
  getProjectIssueStatistics,
  getProjectTest,
  getTestReport
} from '@/api/projects'

export default {
  name: 'Dashboard',
  components: {
    projectPie,
    projectBar,
    ProjectListSelector
  },
  data() {
    return {
      isLoading: true,
      ProjectTestLoading: true,
      projectVersion: '',
      projectVersionList: [],
      workLoad: '',
      workLoadData: {},
      workLoadTypes: [],
      workLoadSelected: {},
      issueprogress: { total_issue: 0, unfinish_number: 0 },
      tableData: [],
      projectdata: [],
      legend: false
    }
  },
  computed: {
    ...mapGetters(['userProjectList', 'projectSelectedId'])
  },
  watch: {
    projectSelectedId(projectId) {
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
    legendfun(value) {
      this.legend = value.toString()
    },
    async fetchAll() {
      this.isLoading = true
      if (this.projectSelectedId !== -1) {
        const versionsRes = await getProjectVersion(this.projectSelectedId)
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
      }
    },
    async fetchByVersion() {
      // 如果無版本列表，預設帶整體專案統計資訊，後面不用帶版本參數
      let param = {}
      if (this.projectVersion != '') {
        param = { fixed_version_id: this.projectVersion }
      }
      const res = await Promise.all([
        getProjectIssueProgress(this.projectSelectedId, param),
        getProjectIssueStatistics(this.projectSelectedId, param),
        this.getProjectUserList(this.projectSelectedId)
      ])
      this.isLoading = false
      this.issueprogress = res[0].data
      const statistics = res[1].data
      this.tableData = res[2].data.user_list || []
      this.workLoadData = statistics
      this.workLoadTypes = Object.keys(statistics).map((key) => {
        return { id: key, name: key }
      })
      this.workLoad = this.workLoadTypes[0].id
      this.workLoadSelected = statistics[this.workLoad]
    },
    async fetchProjectTest() {
      this.ProjectTestLoading = true
      this.projectdata = []
      let apiProjectdata = await getProjectTest(this.projectSelectedId)
      this.ProjectTestLoading = false
      apiProjectdata = apiProjectdata.data
      for (const i in apiProjectdata.test_results) {
        const object = {}
        // console.log(apiProjectdata.test_result[i])
        let Informationtext = ''
        for (const j in apiProjectdata.test_results[i]) {
          // console.log(j, apiProjectdata.test_results[i][j])
          if (
            (j !== 'message') &
            (j !== 'statisticsCalculationDate') &
            (j !== 'status') &
            (j !== 'report_id') &
            (j !== 'id')
          ) {
            Informationtext =
              Informationtext +
              '<div  style="flex: 1;padding-left: 5px;">' +
              j +
              ':' +
              apiProjectdata.test_results[i][j] +
              ' </div>'
          }
        }
        if (i === 'postman') {
          Informationtext = Informationtext + '<div  style="flex: 1;padding-left: 5px;"> <div>'
          if (Object.keys(apiProjectdata.test_results[i]).length === 0) {
            Informationtext = 'No data.'
          }
        } else if (i === 'checkmarx') {
          // checkmarx message https://github.com/iii-org/devops-system/wiki/Message-Strings
          if (apiProjectdata.test_results[i].status === -1) {
            Informationtext = 'This project does not have any scan.'
          } else if (apiProjectdata.test_results[i].status === 1) {
            Informationtext = 'The scan is not completed yet. It may take several hours to complete.'
          } else if (apiProjectdata.test_results[i].status === 2) {
            Informationtext = 'The scan is done, but the report is not ready yet. It may take several minutes to complete.'
          } else if (apiProjectdata.test_results[i].status === 3) {
            object['report_id'] = apiProjectdata.test_results[i].report_id
          } else if (apiProjectdata.test_results[i].status === undefined) {
            Informationtext = 'No data.'
          }
        }
        object['Software'] = i
        object['status'] = apiProjectdata.test_results[i].status
        object['Informationtext'] = Informationtext
        this.projectdata.push(object)
      }
    },
    async fetchTestReport(Reportid) {
      this.ProjectTestLoading = true
      await getTestReport(Reportid).then((res) => {
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'checkmarx_Report.pdf')
        document.body.appendChild(link)
        link.click()
      })
      this.ProjectTestLoading = false
    }
  }
}
</script>

<template>
  <div v-loading="isLoading" class="dashboard-container">
    <div class="clearfix">
      <project-list-selector />
      <el-select v-model="projectVersion" placeholder="select a version">
        <el-option v-for="item in projectVersionList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </div>
    <el-divider />
    <el-row :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover" style="height: 400px">
          <div slot="header" class="clearfix" style="line-height: 40px">
            <span>Status</span>
          </div>
          <div v-if="projectSelectedId==-1" style="text-align: center;">No Data</div>
          <project-pie :the-data="issueprogress" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" style="height:400px">
          <div slot="header" class="clearfix" style="line-height:40px; position: relative">
            <span>Workload</span>
            <el-select
              v-model="workLoad"
              placeholder="select a project"
              style="float: right"
              @change="onWorkLoadChange"
            >
              <el-option v-for="item in workLoadTypes" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <div v-if="legend=='true'" class="bar-header">
              <div class="d-inline-block">
                <span v-if="workLoad=='priority'" class="legend-box" style="background: #E85656" />
                <span v-if="workLoad=='priority'" class="legend-box" style="background: #F9BE6E" />
                <span v-if="workLoad=='priority'" class="legend-box" style="background: #2EC6C8" />
                <span class="legend-box" style="background: #56b1e8" />
                <span>Finished</span>
              </div>
              <div class="d-inline-block">
                <span class="legend-box" />
                <span>Unfinished</span>
              </div>
            </div>
          </div>
          <div v-if="projectSelectedId==-1" style="text-align: center;">No Data</div>
          <project-bar :the-data="workLoadSelected" @legendfun="legendfun" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover" style="min-height: 400px">
          <div slot="header" class="clearfix">
            <span>Project Members</span>
          </div>
          <el-table :data="tableData" height="250" stripe style="width: 100%">
            <el-table-column prop="role_name" label="Title" />
            <el-table-column prop="name" label="Name" />
            <el-table-column prop="email" label="Email" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card v-loading="ProjectTestLoading" shadow="hover" style="min-height: 400px">
          <div slot="header" class="clearfix">
            <span>Test status</span>
            <span>
              <el-button
                type="primary"
                icon="el-icon-refresh"
                circle
                size="mini"
                @click="fetchProjectTest()"
              />
            </span>
          </div>
          <el-table :data="projectdata" height="250" stripe style="width: 100%">
            <el-table-column prop="Software" label="Software" width="100" />
            <el-table-column label="Brief Information">
              <template slot-scope="scope">
                <div style="width: 100%; display: flex ;word-break: keep-all; flex-wrap: wrap;" v-html="scope.row.Informationtext" />
              </template>
            </el-table-column>
            <el-table-column label="Report" width="100">
              <template slot-scope="scope">
                <el-link
                  v-if="scope.row.status == 3"
                  target="_blank"
                  type="primary"
                  :underline="false"
                  @click="fetchTestReport(scope.row.report_id)"
                >
                  <i class="el-icon-download" style="font-size: 20px" />
                </el-link>
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
</style>
