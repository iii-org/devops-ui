<template>
  <el-col v-loading="loading">
    <v-chart
      v-if="chartData.length > 0"
      class="chart"
      :option="passingRateOptions"
      autoresize
      theme="macarons"
      @click="onClickChart"
    />
    <no-data v-else />
    <el-dialog
      :visible.sync="detailDialog"
      :title="$t('Dashboard.ADMIN.PassingRate.DETAIL')"
      top="3vh"
      @close="closeHandler"
    >
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
        <el-col v-if="listData.length > 0" :span="12" class="text-right">
          {{ $t('Dashboard.ADMIN.sync_date', [listData[0].sync_date]) }}
        </el-col>
      </el-row>
      <el-card v-loading="listLoading">
        <el-table
          ref="tableData"
          :data="pagedData"
          row-key="project_id"
          cell-class-name="items-center"
          header-cell-class-name="items-center"
          @row-click="rowClicked"
        >
          <el-table-column show-overflow-tooltip :label="$t('Dashboard.ADMIN.PassingRate.project_name')" prop="project_name" sortable />
          <el-table-column :label="$t('Dashboard.ADMIN.PassingRate.total')" prop="total" sortable />
          <el-table-column :label="$t('Dashboard.ADMIN.PassingRate.success')" prop="success" sortable />
          <el-table-column :label="$t('Dashboard.ADMIN.PassingRate.fail')" prop="fail" sortable />
          <el-table-column :label="$t('Dashboard.ADMIN.PassingRate.count')" prop="count" sortable />
          <el-table-column :label="$t('Dashboard.ADMIN.PassingRate.run_at')" prop="run_at" sortable>
            <template slot-scope="scope">
              {{ formatTime(scope.row.run_at) }}
            </template>
          </el-table-column>
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
import { ScatterChart } from 'echarts/charts'
import { getPassingRateDetail } from '@/api/dashboard'
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import NoData from './widget/NoData'

require('echarts/theme/macarons') // echarts theme

use([CanvasRenderer, ScatterChart])
export default {
  name: 'AdminPassingRate',
  components: {
    NoData,
    'v-chart': VChart
  },
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    data: {
      type: Function,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      chartData: [],
      detailData: [],
      detailDialog: false,
      searchKeys: ['project_name'],
      keyword: '',
      maxCircleWidth: 120
    }
  },
  computed: {
    passingRateOptions() {
      const _this = this
      return {
        tooltip: {
          trigger: 'item',
          textStyle: {
            color: '#FFFFFF'
          },
          formatter: data => {
            return data.marker + data.name + ': ' + this.$t('Dashboard.ADMIN.PassingRate.count') + data.value[2]
          }
        },
        grid: {
          left: '8%',
          top: '10%'
        },
        xAxis: {
          name: this.$t('Dashboard.ADMIN.PassingRate.total'),
          nameLocation: 'middle',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          minInterval: 1,
          min: 0
        },
        yAxis: {
          name: this.$t('Dashboard.ADMIN.PassingRate.rate'),
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          min: 0,
          max: 100,
          minInterval: 1,
          scale: true
        },
        series: [
          {
            name: this.$t('Dashboard.ADMIN.PassingRate.success'),
            symbolSize: function(data) {
              return data[2] * _this.getSizeRate()
            },
            data: this.chartData,
            label: {
              show: true,
              formatter: data => {
                return data.value[1] + '%'
              },
              fontWeight: 'bolder'
            },
            type: 'scatter'
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
      return getPassingRateDetail().then(res => {
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
    },
    formatTime(value) {
      return this.$dayjs(value).fromNow()
    },
    getSizeRate() {
      const caseCount = this.chartData.map(row => row.value[2])
      const maxCount = Math.max(...caseCount)
      return this.maxCircleWidth / maxCount
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
