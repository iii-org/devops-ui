<template>
  <el-col v-loading="loading">
    <v-chart class="chart" :option="passingRateOptions" autoresize theme="macarons" @click="onClickChart" />
    <el-dialog :visible.sync="detailDialog" title="專案測試品質" @close="closeHandler">
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
        <el-col :span="12" class="text-right">
          統計日期：
        </el-col>
      </el-row>
      <el-table v-if="listData.length>0" ref="tableData"
                :data="pagedData"
                row-key="project_id"
                @row-click="rowClicked"
      >
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
import { ScatterChart } from 'echarts/charts'
import { getPassingRateDetail } from '@/api/dashboard'
import MixinBasicTable from '@/components/MixinBasicTable'

require('echarts/theme/macarons') // echarts theme

use([
  CanvasRenderer,
  ScatterChart
])
export default {
  name: 'AdminProjectMember',
  components: {
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
      detailData: [],
      detailDialog: false,
      searchKeys: ['project_name', 'pm_user_name'],
      reload: 0
    }
  },
  computed: {
    passingRateOptions() {
      return {
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
            return data[2] * 20
          },
          data: this.passingRate,
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
      return getPassingRateDetail()
        .then((res) => {
          return Promise.resolve(res.data)
        })
    },
    rowClicked(row) {
      this.$refs['tableData'].toggleRowExpansion(row)
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
