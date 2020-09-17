<script>
import { mapGetters, mapActions } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import projectBar from './components/project_bar'
import {
  getProjectVersion,
  getProjectIssueProgress,
  getProjectIssueListByVersion,
  getProjectIssueStatistics
} from '@/api/projects'

export default {
  name: 'Dashboard',
  components: {
    projectBar,
    ProjectListSelector
  },
  data() {
    return {
      listLoading: true,
      contentLoading: false,
      workLoad: '',
      workLoadData: {},
      workLoadTypes: [],
      workLoadSelected: {},
      activeNames: '',
      dataList: [],
      workList: {},
      activedIndex: []
    }
  },
  computed: {
    ...mapGetters(['userProjectList', 'projectSelectedId'])
  },
  watch: {
    projectSelectedId(projectId) {
      this.fetchAll()
    }
  },
  async created() {
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      this.listLoading = true
      const res = await getProjectVersion(this.projectSelectedId)
      const resAll = await Promise.all(
        res.data.versions.map(({ id }) => getProjectIssueProgress(this.projectSelectedId, { fixed_version_id: id }))
      )
      this.dataList = resAll.map(({ data }, idx) => {
        return { ...data, vId: res.data.versions[idx].id, name: res.data.versions[idx].name }
      })
      this.listLoading = false
    },
    returnVersionType(item) {
      const percentage = this.percentageMethod(item)
      if (percentage === 0) return 'danger'
      if (percentage === 100) return 'success'
      return 'primary'
    },
    returnTagType(type) {
      switch (type) {
        case 'User Case':
          return 'success'
        case 'Mission':
          return null
        case 'Bug':
          return 'danger'
        default:
          return null
      }
    },
    percentageMethod(item) {
      if (item.total_issue > 0 && item.unfinish_number === 0) return 100
      return item.total_issue > 0 ? ((item.total_issue - item.unfinish_number) / item.total_issue) * 100 : 0
    },
    onCollapseChange(value) {
      if (!value) return
      if (this.activedIndex.includes(value)) return
      this.activedIndex.push(value)
      this.fetchDetails(value)
    },
    async fetchDetails(vId) {
      this.contentLoading = true
      const data = await getProjectIssueListByVersion(this.projectSelectedId, { fixed_version_id: vId })
      this.$set(this.workList, vId, data.data)

      const statistics = await getProjectIssueStatistics(this.projectSelectedId, { fixed_version_id: vId })
      this.workLoadData = statistics.data
      this.workLoadTypes = Object.keys(this.workLoadData).map(key => {
        return { id: key, name: key }
      })
      this.workLoad = this.workLoadTypes[0].id
      this.workLoadSelected = this.workLoadData[this.workLoad]
      this.contentLoading = false
    },
    onWorkLoadChange(value) {
      this.workLoadSelected = this.workLoadData[value]
    }
  }
}
</script>

<template>
  <div class="dashboard-container" v-loading="listLoading">
    <div>
      <project-list-selector />
    </div>
    <el-divider />
    <el-row :gutter="12">
      <el-col :span="24">
        <el-card shadow="hover" body-style="padding-top:0px;padding-bottom:0px">
          <el-collapse v-model="activeNames" @change="onCollapseChange" :accordion="true">
            <el-collapse-item v-for="item in dataList" :name="item.vId" :key="item.vId">
              <template slot="title">
                <div class="titleProgress">
                  <el-tag effect="dark" :type="returnVersionType(item)">{{ item.name }}</el-tag>
                  <el-progress :percentage="percentageMethod(item)" :status="item.type"></el-progress>
                </div>
              </template>
              <el-divider />
              <div class="contentBody" v-loading="contentLoading">
                <el-row :gutter="12">
                  <el-col :span="8">
                    <el-table :data="workList[item.vId]" style="width: 100%" border stripe>
                      <el-table-column prop="lsit" label="Work List">
                        <template slot-scope="scope">
                          <el-tag :type="scope.row.issue_priority === '急' ? 'warning' : 'danger'">{{
                            scope.row.issue_priority
                          }}</el-tag>
                          <span style="color: #409EFF">
                            [{{ scope.row.issue_category }}]
                            <b>#{{ scope.row.issue_name }}</b>
                          </span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-col>
                  <el-col :span="16">
                    <el-select v-model="workLoad" placeholder="select a project" @change="onWorkLoadChange">
                      <el-option v-for="items in workLoadTypes" :key="items.id" :label="items.name" :value="items.id">
                      </el-option>
                    </el-select>
                    <el-divider />
                    <project-bar v-if="workList[item.vId]" :the-data="workLoadSelected" />
                  </el-col>
                </el-row>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
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
  .contentBody {
    width: 100%;
    padding: 0 12px;
  }
}
>>> .el-collapse-item__header {
  height: 84px;
}
.titleProgress {
  width: 100%;
}
</style>
