<script>
import Pagination from '@/components/Pagination'
import { getAllActivities } from '@/api/activities'
import { formatTime } from '@/utils/index.js'
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'SystemActivities',
  components: {
    Pagination
  },
  mixins: [MixinElTable],
  data() {
    return {
      listLoading: true,
      dialogVisible: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, // 總筆數
      searchData: '',
      activitiesList: [],

      formData: {
        // from_date: '2020-01-01',
        // to_date: '2021-12-31',
        // limit: 100,
        // page: 0,
        // actions: 'CREATE_USER, UPDATE_USER, DELETE_USER'
      }
    }
  },
  computed: {
    pagedData() {
      const listData = this.activitiesList.filter(data => {
        if (this.searchData === '' || data.act_at.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      await getAllActivities(this.formData).then(res => {
        this.activitiesList = res.data
      })
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    myFormatTime(time) {
      return formatTime(new Date(time))
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('Activities.SearchActAt')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>

    <el-divider />

    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row height="100%" row-class-name="el-table-row">
      <el-table-column align="center" :label="$t('Activities.User')" min-width="100" prop="operator_name" />
      <el-table-column align="center" :label="$t('Activities.ActionType')" min-width="150" prop="action_type" />
      <el-table-column align="center" :label="$t('Activities.ActionParts')" min-width="250" prop="action_parts" />
      <el-table-column align="center" :label="$t('Activities.ActAt')" width="190">
        <template slot-scope="scope">
          {{ myFormatTime(scope.row.act_at) }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>
