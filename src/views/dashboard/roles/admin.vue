<template>
  <el-row class="app-container">
    <el-row type="flex" :gutter="10" class="flex-wrap">
      <el-col :xs="24" :sm="24" :md="10">
        <el-card class="overview">
          <template slot="header">
            <span class="font-weight-bold">Overview</span>
          </template>
          <el-row class="circle hidden-sm-and-down" type="flex" justify="center" align="middle">
            <el-col v-for="(item,idx) in overview" :key="idx" :xs="24" :sm="24" :md="8">
              <CircleDashboard :count="item.count" :item="item.item" :class="'circle-'+item.class" />
            </el-col>
          </el-row>
          <div class="table hidden-md-and-up">
            <el-row v-for="(item,idx) in overview" :key="idx" :class="'table-'+item.class" align="bottom" type="flex">
              <el-col :span="12" class="text-right count">{{ item.count }}</el-col>
              <el-col :span="12">{{ item.item }}</el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="7">
        <el-card>
          <template slot="header">
            <span class="font-weight-bold">Project Members</span>
          </template>
          <v-chart class="chart" :option="projectMembers" autoresize theme="macarons" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="7">
        <el-card>
          <template slot="header">
            <span class="font-weight-bold">Commit Log
            </span></template>
          <el-col class="inner">
            <transition-group name="slide-fade" tag="el-timeline">
              <el-timeline-item v-for="commit in gitCommitLog" :key="commit.id" :timestamp="commit.commit_time"
                                placement="top"
              >
                <el-card class="timeline-item-card">
                  <h4>{{ commit.commit_title }}</h4>
                  <p v-if="commit.commit_message!==commit.commit_title">{{ commit.commit_message }}</p>
                  <p class="author">{{ commit.author_name }} @ {{ commit.pj_name }}</p>
                </el-card>
              </el-timeline-item>
            </transition-group>
          </el-col>
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" class="flex-wrap" :gutter="10">
      <el-col :xs="24" :sm="24" :md="10">
        <el-card>
          <template slot="header">
            <span class="font-weight-bold">開放議題排行榜 Top 5</span>
          </template>
          <el-col>
            <el-table :data="rank" cell-class-name="align-center" header-cell-class-name="align-center">
              <el-table-column prop="name" label="專案成員" />
              <el-table-column prop="active" label="尚待解決" />
              <el-table-column prop="project" label="專案參與數" />
            </el-table>
          </el-col>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="14">
        <el-card>
          <template slot="header">
            <span class="font-weight-bold">通過比率</span>
          </template>
          <v-chart class="chart" :option="passive" autoresize theme="macarons" />
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" class="flex-wrap" :gutter="10">
      <el-col :xs="24" :sm="24" :md="24">
        <el-card>
          <template slot="header">
            <el-row type="flex" align="center" class="no-margin">
              <el-col :span="12" class="font-weight-bold">專案清單</el-col>
              <el-col :span="12" class="text-right">最後更新：{{ lastUpdate }}</el-col>
            </el-row>
          </template>
          <el-table :data="projectList" :row-class-name="tableRowClassName" cell-class-name="align-center"
                    header-cell-class-name="align-center"
          >
            <el-table-column prop="project_name" label="專案名稱" />
            <el-table-column prop="name" label="專案經理" />
            <el-table-column prop="percentage" label="完成百分比" />
            <el-table-column prop="active" label="未解決問題數" />
            <el-table-column prop="resolved" label="已解決問題數" />
            <el-table-column prop="people" label="參與人數" />
            <el-table-column prop="due_days" label="到期天數" />
            <el-table-column prop="due_date" label="到期日" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import VChart from 'vue-echarts'
import { use } from 'echarts/core'

import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, ScatterChart } from 'echarts/charts'
import CircleDashboard from '../components/circle_dashboard'
import { getGitCommitLog } from '@/api/dashboard'
import { UTCtoLocalTime } from '@/filters'

require('echarts/theme/macarons') // echarts theme

use([
  CanvasRenderer,
  ScatterChart,
  PieChart
])
const commitLimit = 10
const refreshCommitLog = 30000 // ms
export default {
  name: 'DashboardAdmin',
  components: {
    'v-chart': VChart,
    CircleDashboard
  },
  data() {
    return {
      lastUpdate: '2021/04/01',
      overview: [
        { item: 'Projects', count: 215, class: 'primary' },
        { item: 'Overdue', count: 2, class: 'danger' },
        { item: 'Not Started', count: 10, class: 'info' }
      ],
      projectMembers: {
        tooltip: {
          trigger: 'item',
          textStyle: {
            color: '#FFFFFF'
          }
        },
        legend: {
          type: 'scroll',
          bottom: '0'
        },
        series: [
          {
            name: '專案成員',
            type: 'pie',
            radius: '80%',
            data: [
              { value: 26, name: '專案X' },
              { value: 21, name: '專案Y' },
              { value: 18, name: '專案Z' },
              { value: 91, name: '建構專案' },
              { value: 76, name: '整合案' },
              { value: 28, name: '推廣活動' }
            ],
            label: {
              normal: {
                show: true,
                formatter: '{b}\n\n{c}',
                textStyle: {
                  fontSize: '1em'
                }
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      gitCommitLog: [],
      passive: {
        tooltip: {
          trigger: 'item',
          textStyle: {
            color: '#FFFFFF'
          }
        },
        grid: {
          left: '8%',
          top: '10%'
        },
        xAxis: {
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        yAxis: {
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          scale: true
        },
        series: [{
          symbolSize: function(data) {
            return data[0]
          },
          data: [
            [80, 0.52],
            [16, 0.8],
            [47, 0.45],
            [58, 0.23],
            [103, 0.35]
          ],
          label: {
            normal: {
              show: true,
              formatter: (data) => {
                return data.value[0]
              }
            },
            fontWeight: 'bolder'
          },
          type: 'scatter'
        }]
      },
      rank: [
        { name: '黃立安', active: 230, project: 3 },
        { name: '陳尚品', active: 120, project: 5 },
        { name: '林大儀', active: 112, project: 2 },
        { name: '林長易', active: 80, project: 4 },
        { name: '黃河道', active: 75, project: 1 }
      ],
      projectList: [
        {
          project_name: '專案ㄧ',
          name: '林君容',
          percentage: null,
          active: 32,
          resolved: null,
          people: null,
          due_days: null,
          due_date: '2021/02/20'
        },
        {
          project_name: '專案二',
          name: '陳一成',
          percentage: null,
          active: 3,
          resolved: null,
          people: null,
          due_days: null,
          due_date: '2021/04/30'
        },
        {
          project_name: '專案三',
          name: '王笠人',
          percentage: null,
          active: 12,
          resolved: null,
          people: null,
          due_days: null,
          due_date: '2021/06/30'
        }
      ],
      init: true,
      requestGitLabLastTime: null
    }
  },
  watch: {
    gitCommitLog: {
      deep: true,
      async handler(value) {
        // if (this.init) {
        //   this.init = false
        //   return value
        // }
        if (!this.requestGitLabLastTime) {
          this.requestGitLabLastTime = (new Date()).valueOf()
        }
        await this.sleep(refreshCommitLog)
        const nowTime = (new Date()).valueOf()
        const gap = nowTime - this.requestGitLabLastTime
        if (gap >= refreshCommitLog) {
          this.gitCommitLog = await this.getGitCommitLogData()
        }
      }
    }
  },
  async mounted() {
    this.gitCommitLog = await this.getGitCommitLogData()
  },
  methods: {
    getGitCommitLogData() {
      return getGitCommitLog(commitLimit)
        .then((res) => {
          res.data.forEach((item, index) => {
            item['id'] = index
            item['commit_time'] = UTCtoLocalTime(item['commit_time'])
          })
          return Promise.resolve(res.data)
        })
    },
    tableRowClassName({ row }) {
      if (row.due_date < this.lastUpdate) {
        return 'danger-row'
      }
      return ''
    },
    overviewTableCellClassName({ column }) {
      if (column.property === 'count') {
        return 'count'
      }
    },
    sleep(ms) {
      return new Promise((resolve) => (setTimeout(resolve, ms)))
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
@import '~element-ui/lib/theme-chalk/display.css';

.overview {
  height: 90%;

  .el-row {
    height: 100%;

    .el-col {
      margin-bottom: 0;
    }
  }

}

> > > .el-row, .el-row .el-col {
  margin-bottom: 1em;
}

> > > .el-card {
  height: 100%;

  .el-card__body {
    height: 85%;
  }
}

> > > .align-center {
  text-align: center;
}

.inner {
  height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
}

.chart {
  height: 100%;
  min-height: 250px;
}

> > > .el-table {
  .danger-row {
    background: $danger-4;
  }
}

.circle {
  > > > .circle-primary {
    border-color: $menuActiveText;
    color: $menuActiveText;
  }

  > > > .circle-danger {
    border-color: $danger;
    color: $danger;
  }

  > > > .circle-info {
    border-color: $info-4;
    color: $info-4;
  }
}

> > > .table {
  font-size: 1.5em;

  .count {
    font-size: 2em;
    padding-right: 0.25em;
    text-align: right;
    font-weight: bolder;
  }

  .el-row {
    border-width: 5px;
    border-style: solid;
  }

  .table-primary {
    border-color: $menuActiveText;
    color: $menuActiveText;
  }

  .table-danger {
    border-color: $danger;
    color: $danger;
  }

  .table-info {
    border-color: $info-4;
    color: $info-4;
  }
}

.no-margin {
  margin: 0;
}

.timeline-item-card {
  > > > .el-card__body {
    padding: 10px;
  }

  .author {
    margin-bottom: 0;
  }
}

.slide-fade-enter-active {
  transition: all .5s ease;
}

.slide-fade-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active for below version 2.1.8 */
{
  transform: translateX(10px);
  opacity: 0;
}

</style>
