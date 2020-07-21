<script>
import { mapGetters, mapActions } from 'vuex'
import projectPie from './components/project_pie'
import projectBar from './components/project_bar'
import projectGantt from './components/project_gantt'

export default {
  name: 'Dashboard',
  components: {
    projectPie,
    projectBar,
    projectGantt
  },
  data() {
    return {
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
  }
}
</script>

<template>
  <div class="dashboard-container">
    <el-row :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover" style="height:400px">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Status</span>
          </div>
          <projectPie />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" style="height:400px">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Workload</span>
          </div>
          <project-bar />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="hover" style="min-height: 400px">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Members</span>
          </div>
          <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column prop="title" label="Title"> </el-table-column>
            <el-table-column prop="name" label="Name">
              <template slot-scope="scope">
                <template v-if="Array.isArray(scope.row.name)">
                  <p v-for="item in scope.row.name" :key="item">
                    {{ item }}
                  </p>
                </template>
                <span v-else>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="hover" style="min-height: 400px">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Weekly Progress</span>
          </div>
          <project-gantt />
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
