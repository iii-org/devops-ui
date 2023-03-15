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
    <NoData v-else />
    <el-dialog
      :visible.sync="dialogVisible.projectMember"
      :title="$t('Dashboard.ADMIN.ProjectMembers.NAME')"
      top="3vh"
      @close="closeHandler"
    >
      <el-row type="flex" align="middle">
        <el-col :span="12">
          <el-input
            v-model="keyword"
            style="width: 250px"
            :placeholder="$t('Project.SearchProjectName')"
            clearable
          />
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
          :row-key="getRowKey"
          :expand-row-keys="expandKeys"
          @row-click="rowClicked"
          @expand-change="loadMembers"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <AdminMemberTable :member-data="memberData" />
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            :label="$t('Dashboard.ADMIN.ProjectMembers.project_name')"
            prop="project_name"
            sortable
          />
          <el-table-column
            show-overflow-tooltip
            :label="$t('Dashboard.ADMIN.ProjectMembers.owner_name')"
            prop="owner_name"
            sortable
          >
            <template slot-scope="props">
              {{ `${props.row.owner_name} (${props.row.owner_login})` }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('Dashboard.ADMIN.ProjectMembers.member_count')"
            prop="member_count"
            sortable
          />
          <el-table-column
            show-overflow-tooltip
            :label="$t('Dashboard.ADMIN.ProjectMembers.start_date')"
            prop="start_date"
            sortable
          />
          <el-table-column
            show-overflow-tooltip prop="end_date"
            :label="$t('Dashboard.ADMIN.ProjectMembers.end_date')"
            sortable
          />
        </el-table>
        <Pagination
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
import { BasicData, Pagination, SearchBar, Table } from '@/mixins'
import AdminMemberTable from './widget/AdminMemberTable'
import NoData from '@/components/NoData'

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
      default: () => ([])
    },
    dialogVisible: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      chartData: [],
      searchKeys: ['project_name', 'owner_name'],
      getRowKey: (row) => row.project_id,
      expandKeys: [],
      memberData: { loading: '', children: [] }
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
    dialogVisible: {
      handler(value) {
        if (value.projectMember) {
          this.loadData()
        }
      },
      deep: true
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
      this.listLoading = true
      this.listData = await this.fetchData()
      this.listLoading = false
    },
    async fetchData() {
      return getProjectMembersDetail().then(res => {
        return Promise.resolve(res.data)
      })
    },
    rowClicked(row) {
      this.$refs['tableData'].toggleRowExpansion(row)
    },
    async loadMembers(row, expandedRows) {
      this.expandKeys = []
      this.memberData.children = []
      if (expandedRows.length) this.expandKeys.push(row.project_id)
      if (!expandedRows.some((r) => r.project_id === row.project_id)) return
      this.memberData.loading = true
      const res = await getProjectMembersByProjectID(row.project_id)
      this.memberData.children = res.data
      this.memberData.loading = false
    },
    onClickChart(row) {
      this.dialogVisible.projectMember = true
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
