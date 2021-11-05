<template>
  <el-col v-loading="loading">
    <v-chart
      v-if="chartData.length > 0"
      class="chart"
      :option="projectMembersOptions"
      autoresize
      theme="macarons"
      @click="onClickChart"
    />
    <no-data v-else />
    <el-dialog
      :visible.sync="detailDialog"
      :title="$t('Dashboard.ADMIN.ProjectMembers.NAME')"
      top="3vh"
      @close="closeHandler"
    >
      <el-row type="flex" align="middle">
        <el-col :span="12">
          <el-input v-model="keyword" style="width: 250px" :placeholder="$t('Project.SearchProjectName')" clearable />
        </el-col>
        <el-col v-if="listData.length > 0" :span="12" class="text-right">
          {{ $t('Dashboard.ADMIN.sync_date', [listData[0].sync_date]) }}
        </el-col>
      </el-row>
      <el-card>
        <el-table
          v-if="listData.length > 0"
          ref="tableData"
          :data="pagedData"
          :row-key="'project_id'"
          @row-click="rowClicked"
          @expand-change="loadMembers"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <admin-member-table :loading="props.row.loading" :data="props.row.children" />
            </template>
          </el-table-column>
          <el-table-column show-overflow-tooltip :label="$t('Dashboard.ADMIN.ProjectMembers.project_name')" prop="project_name" sortable />
          <el-table-column show-overflow-tooltip :label="$t('Dashboard.ADMIN.ProjectMembers.owner_name')" prop="owner_name" sortable>
            <template slot-scope="props">
              {{ `${props.row.owner_name} (${props.row.owner_login})` }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Dashboard.ADMIN.ProjectMembers.member_count')" prop="member_count" sortable />
          <el-table-column show-overflow-tooltip :label="$t('Dashboard.ADMIN.ProjectMembers.start_date')" prop="start_date" sortable />
          <el-table-column show-overflow-tooltip prop="end_date" :label="$t('Dashboard.ADMIN.ProjectMembers.end_date')" sortable />
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
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import AdminMemberTable from './widget/AdminMemberTable'
import NoData from './widget/NoData'

require('echarts/theme/macarons') // echarts theme

use([CanvasRenderer, PieChart])
export default {
  name: 'AdminProjectMember',
  components: {
    NoData,
    AdminMemberTable,
    'v-chart': VChart
  },
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    data: {
      type: Function,
      default: () => []
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      chartData: [],
      detailDialog: false,
      searchKeys: ['project_name', 'owner_name']
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
            name: this.$t('Dashboard.ADMIN.ProjectMembers.NAME'),
            type: 'pie',
            radius: '80%',
            data: this.chartData,
            label: {
              show: true,
              formatter: '{b}\n\n{c}',
              fontSize: '1em'
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
    detailDialog(value) {
      if (value) {
        this.loadData()
      }
    },
    dialogVisible(value) {
      this.detailDialog = value
      this.$emit('dialog-visible', { key: 'projectMember', value: value })
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
      return getProjectMembersDetail().then(res => {
        return Promise.resolve(res.data)
      })
    },
    rowClicked(row) {
      this.$refs['tableData'].toggleRowExpansion(row)
    },
    async loadMembers(row) {
      this.$set(row, 'loading', true)
      const res = await getProjectMembersByProjectID(row.project_id)
      this.$set(row, 'children', res.data)
      this.$set(row, 'loading', false)
    },
    onClickChart(row) {
      this.detailDialog = true
      this.keyword = row.name
    },
    closeHandler() {
      this.keyword = ''
      this.pagedData.forEach(item => {
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
