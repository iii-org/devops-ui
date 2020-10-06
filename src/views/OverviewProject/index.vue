<script>
import { mapGetters, mapActions } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import projectPie from './components/project_pie'
import projectBar from './components/project_bar'
import { getProjectVersion, getProjectIssueProgress, getProjectIssueStatistics } from '@/api/projects'

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
      projectVersion: '1.0',
      projectVersionList: [{ id: 1, name: '1.0' }],
      workLoad: '',
      workLoadData: {},
      workLoadTypes: [],
      workLoadSelected: {},
      issueprogress: { total_issue: 0, unfinish_number: 0 },
      tableData: [
        {
          title: 'Host',
          name: 'Zue Wang'
        },
        {
          title: 'Manager',
          name: 'Ting Chang'
        },
        {
          title: 'Members',
          name: ['Ally K Wang', 'Nino Lin']
        }
      ]
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
    async fetchAll() {
      this.isLoading = true
      const versionsRes = await getProjectVersion(this.projectSelectedId)
      this.projectVersionList = versionsRes.data.versions
      this.projectVersion = this.projectVersionList[0].id
      this.fetchByVersion()
    },
    async fetchByVersion() {
      const res = await Promise.all([
        getProjectIssueProgress(this.projectSelectedId, { fixed_version_id: this.projectVersion }),
        getProjectIssueStatistics(this.projectSelectedId, { fixed_version_id: this.projectVersion }),
        this.getProjectUserList(this.projectSelectedId)
      ])
      this.isLoading = false
      this.issueprogress = res[0].data
      const statistics = res[1].data
      this.tableData = res[2].data.user_list || []
      this.workLoadData = statistics
      this.workLoadTypes = Object.keys(statistics).map(key => {
        return { id: key, name: key }
      })
      this.workLoad = this.workLoadTypes[0].id
      this.workLoadSelected = statistics[this.workLoad]
    }
  }
}
</script>

<template>
  <div v-loading="isLoading" class="dashboard-container">
    <div>
      <project-list-selector />
      <el-select v-model="projectVersion" placeholder="select a project">
        <el-option v-for="item in projectVersionList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
      </el-select>
    </div>
    <el-divider />
    <el-row :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover" style="height:400px">
          <div slot="header" class="clearfix" style="line-height:40px">
            <span>Status</span>
          </div>
          <project-pie :the-data="issueprogress" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" style="height:400px">
          <div slot="header" class="clearfix" style="line-height:40px; position: relative">
            <span>Workload</span>
            <el-select v-model="workLoad" placeholder="select a project" style="float:right" @change="onWorkLoadChange">
              <el-option v-for="item in workLoadTypes" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>

            <div class="bar-header">
              <div class="d-inline-block">
                <span class="legend-box" style="background: #E85656"></span>
                <span class="legend-box" style="background: #F9BE6E"></span>
                <span class="legend-box" style="background: #2EC6C8"></span>
                <span>Finshed</span>
              </div>
              <div class="d-inline-block">
                <span class="legend-box"></span>
                <span>Unfinshed</span>
              </div>
            </div> <!-- /bar-header -->
          </div>
          <project-bar :the-data="workLoadSelected" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="24">
        <el-card shadow="hover" style="min-height: 400px">
          <div slot="header" class="clearfix">
            <span>Project Members</span>
          </div>
          <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column prop="role_name" label="Title" />
            <el-table-column prop="name" label="Name" />
            <el-table-column prop="email" label="Email" />
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
