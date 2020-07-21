<script>
import { mapGetters, mapActions } from 'vuex'
import projectBar from './components/project_bar'

export default {
  name: 'Dashboard',
  components: {
    projectBar
  },
  data() {
    return {
      dataList: [
        {
          value: 100,
          type: 'success',
          version: '1.0.0'
        },
        {
          value: 77,
          type: null,
          version: '1.0.1'
        },
        {
          value: 0,
          type: null,
          version: '2.0.0'
        }
      ],
      workList: [
        { value: 'User Login', type: 'User Case', number: '2' },
        { value: 'Login Page', type: 'Mission', number: '3' },
        { value: 'Reset Password Error', type: 'Bug', number: '5' },
        { value: 'Adding Work', type: 'User Case', number: '3' }
      ]
    }
  },
  computed: {
    activeNames() {
      return this.dataList.map((e, idx) => {
        return idx
      })
    }
  },
  methods: {
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
    }
  }
}
</script>

<template>
  <div class="dashboard-container">
    <el-row :gutter="12">
      <el-col :span="24">
        <el-card shadow="hover">
          <el-collapse v-model="activeNames">
            <el-collapse-item v-for="(item, idx) in dataList" :name="idx" :key="item.version">
              <template slot="title">
                <div class="titleProgress">
                  Version&nbsp;&nbsp;<el-tag effect="dark" :type="item.type">{{ item.version }}</el-tag>
                  <el-progress :percentage="item.value" :status="item.type"></el-progress>
                </div>
              </template>
              <el-divider />
              <div class="contentBody">
                <el-row :gutter="12">
                  <el-col :span="8">
                    <el-table :data="workList" style="width: 100%" border stripe>
                      <el-table-column prop="lsit" label="Work List">
                        <template slot-scope="scope">
                          <el-tag :type="returnTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
                          <span style="color: #409EFF">
                            {{ scope.row.value }}
                            <b>#{{ scope.row.number }}</b>
                          </span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-col>
                  <el-col :span="16">
                    <project-bar />
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
  height: 78px;
}
.titleProgress {
  width: 30%;
}
</style>
