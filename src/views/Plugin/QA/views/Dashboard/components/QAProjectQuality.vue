<template>
  <el-col v-loading="loading">
    <v-chart v-if="chartData.length>0" class="chart" :option="projectMembersOptions" autoresize theme="macarons" @click="onClickChart" />
    <no-data v-else />
    <el-dialog :visible.sync="detailDialog" :title="$t('Dashboard.ADMIN.ProjectMembers.NAME')" @close="closeHandler">
      <el-row type="flex" align="middle">
        <el-col :span="12">
          <el-input
            v-model="keyword"
            class="ob-search-input ob-shadow search-input"
            style="width: 250px"
            :placeholder="$t('Project.SearchProjectName')"
            clearable
          />
        </el-col>
        <el-col v-if="listData.length>0" :span="12" class="text-right">
          {{ $t('Dashboard.ADMIN.sync_date', [listData[0].sync_date]) }}
        </el-col>
      </el-row>
      <el-card>
        <el-table v-if="listData.length>0" ref="tableData"
                  :data="pagedData"
                  :row-key="'project_id'"
                  @row-click="rowClicked"
                  @expand-change="loadMembers"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <admin-member-table :key="reload" :loading="props.row.loading" :data="props.row.childrens" />
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('Dashboard.ADMIN.ProjectMembers.project_name')"
            prop="project_name"
            sortable
          />
          <el-table-column
            :label="$t('Dashboard.ADMIN.ProjectMembers.pm_user_name')"
            prop="pm_user_name"
            sortable
          />
          <el-table-column
            :label="$t('Dashboard.ADMIN.ProjectMembers.member_count')"
            prop="member_count"
            sortable
          />
          <el-table-column
            :label="$t('Dashboard.ADMIN.ProjectMembers.start_date')"
            prop="start_date"
            sortable
          />
          <el-table-column
            prop="end_date"
            :label="$t('Dashboard.ADMIN.ProjectMembers.end_date')"
            sortable
          />
        </el-table>
        <pagination
          :total="filteredData.length"
          :page="listQuery.page"
          :limit="listQuery.limit"
          :page-sizes="[listQuery.limit]"
          :layout="'total, prev, pager, next'"
          @pagination="onPagination"
        />
      </el-card>
    </el-dialog>
  </el-col>
</template>

<script>
import VChart from 'vue-echarts'
import { use } from 'echarts/core'

import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { getProjectMembersByProjectID, getProjectMembersDetail } from '@/api/dashboard'
import AdminMemberTable from './widget/AdminMemberTable'
import NoData from './widget/NoData'
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'

require('echarts/theme/macarons') // echarts theme

use([
  CanvasRenderer,
  PieChart
])
export default {
  name: 'QAProjectQuality',
  components: {
    NoData,
    AdminMemberTable,
    'v-chart': VChart
  },
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    data: {
      type: Function,
      default: () => ([])
    }
  },
  data() {
    return {
      loading: false,
      chartData: [],
      detailDialog: false,
      searchKeys: ['project_name', 'pm_user_name'],
      reload: 0
    }
  },
  computed: {
    projectMembersOptions() {
      return {
        tooltip: {
          trigger: 'axis',
          textStyle: {
            color: '#FFFFFF'
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          data: ['失敗', '成功', '測試次數']
        },
        xAxis: [
          {
            type: 'category',
            data: ['專案一', '專案二', '專案三', '專案四'],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '測試通過比',
            min: 0,
            max: 100
            // interval: 5
          },
          {
            type: 'value',
            name: '測試次數',
            min: 0
            // max: 25,
            // interval: 5
          }
        ],
        series: [
          {
            name: '失敗',
            type: 'bar',
            stack: 'total',
            data: [5, 0, 0, 28]
          },
          {
            name: '成功',
            type: 'bar',
            stack: 'total',
            data: [95, 100, 100, 72]
          },
          {
            name: '測試次數',
            type: 'line',
            yAxisIndex: 1,
            data: [8, 10, 20, 40]
          }
        ]
      }
    }
  },
  watch: {
    detailDialog() {
      this.loadData()
    }
  },
  mounted() {
    this.loadChart()
  },
  methods: {
    async loadChart() {
      this.loading = true
      this.chartData = await this.data()
      this.chartData = ['test']
      this.loading = false
    },
    async loadData() {
      if (this.detailDialog) {
        this.listLoading = true
        this.listData = await this.fetchData()
        this.listLoading = false
      }
    },
    async fetchData() {
      return getProjectMembersDetail()
        .then((res) => {
          return Promise.resolve(res.data)
        })
    },
    rowClicked(row) {
      this.$refs['tableData'].toggleRowExpansion(row)
    },
    loadMembers(row) {
      const _this = this
      row.loading = true
      getProjectMembersByProjectID(row.project_id)
        .then((res) => {
          row['childrens'] = res.data
        })
        .finally(() => {
          row.loading = false
          _this.reload += 1
        })
    },
    onClickChart(row) {
      this.detailDialog = true
      this.keyword = row.name
    },
    closeHandler() {
      this.keyword = ''
      this.pagedData.forEach((item) => {
        this.$refs['tableData'].toggleRowExpansion(item, false)
      })
      this.listQuery.page = 1
    }
  }
}
</script>

<style scoped>
.chart {
  height: 100%;
  min-height: 250px;
}
</style>
