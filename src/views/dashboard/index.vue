<template>
  <div class="dashboard-container">
    <!-- <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>TBD Issues</span>
          </div>
          <div class="text item" style="font-size: 40px;text-align: center">
            12
          </div>
          <div
            class="text item"
            style="text-align: center;margin-top: 10px;margin-bottom: 13px;"
          >
            daily change
            <span style="margin-left:10px;">8</span>
            <i class="el-icon-caret-top" style="color: red;font-size:5px" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Done / Assign Issues this week</span>
          </div>
          <div class="text item" style="font-size: 40px;text-align: center">
            5/17
            <el-progress :percentage="29.4" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Done / Assign Issues this month</span>
          </div>
          <div class="text item" style="font-size: 40px;text-align: center">
            57/69
            <el-progress :percentage="82.6" />
          </div>
        </el-card>
      </el-col>
    </el-row> -->
    <el-row :gutter="12" style="margin-top:10px">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Assign Issues Priority</span>
          </div>
          <priorityPie />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Assign Issues Project</span>
          </div>
          <projectPie />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>Assign Issues Type</span>
          </div>
          <typePie />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import priorityPie from './components/priority_pie'
import projectPie from './components/project_pie'
import typePie from './components/type_pie'

export default {
  name: 'Dashboard',
  components: {
    priorityPie,
    projectPie,
    typePie
  },
  computed: {
    ...mapGetters(['name'])
  }
}
</script>

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
</style>
