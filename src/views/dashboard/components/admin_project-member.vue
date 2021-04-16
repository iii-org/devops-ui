<template>
  <el-col v-loading="loading">
    <v-chart v-if="chartData.length>0" class="chart" :option="projectMembersOptions" autoresize theme="macarons" @click="onClickChart" />
    <no-data v-else />
    <el-dialog :visible.sync="detailDialog" title="專案總覽" @close="closeHandler">
      <el-row>
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
          統計日期：{{ listData[0].sync_date }}
        </el-col>
      </el-row>
      <el-table v-if="listData.length>0" ref="tableData"
                :data="pagedData"
                row-key="project_id"
                @row-click="rowClicked"
                @expand-change="loadMembers"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <admin-member-table :key="reload" :loading="props.row.loading" :data="props.row.children" />
          </template>
        </el-table-column>
        <el-table-column
          label="專案名稱"
          prop="project_name"
          sortable
        />
        <el-table-column
          label="專案經理"
          prop="pm_user_name"
          sortable
        />
        <el-table-column
          label="參與人數"
          prop="member_count"
          sortable
        />
        <el-table-column
          label="專案起始日"
          prop="start_date"
          sortable
        />
        <el-table-column
          prop="end_date"
          label="專案結束日"
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
    </el-dialog>
  </el-col>
</template>

<script>
import VChart from 'vue-echarts'
import { use } from 'echarts/core'

import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { getProjectMembersByProjectID, getProjectMembersDetail } from '@/api/dashboard'
import MixinBasicTable from '@/components/MixinBasicTable'
import AdminMemberTable from '@/views/dashboard/components/widget/admin_member-table'
import NoData from '@/views/dashboard/components/widget/no_data'

require('echarts/theme/macarons') // echarts theme

use([
  CanvasRenderer,
  PieChart
])
export default {
  name: 'AdminProjectMember',
  components: {
    NoData,
    AdminMemberTable,
    'v-chart': VChart
  },
  mixins: [MixinBasicTable],
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
            data: this.chartData,
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
    loadMembers(row, expandedRows) {
      const _this = this
      row.loading = true
      getProjectMembersByProjectID(row.project_id)
        .then((res) => {
          row['children'] = res.data
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
