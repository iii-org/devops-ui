<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getProjectActivities } from '@/api/activities'

export default {
  name: 'ProjectActivities',
  components: {
    Pagination,
    ProjectListSelector
  },
  data: () => ({
    listLoading: true,
    dialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',
    activitiesList: []
  }),
  computed: {
    ...mapGetters(['projectSelectedId']),
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
  watch: {
    projectSelectedId() {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      await getProjectActivities(this.projectSelectedId).then(res => {
        this.activitiesList = res.data
      })
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />

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

    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row>
      <el-table-column align="center" :label="$t('Activities.User')" min-width="30" prop="operator_name" />
      <el-table-column align="center" :label="$t('Activities.ActionType')" min-width="40" prop="action_type" />
      <el-table-column align="center" :label="$t('Activities.ActionParts')" min-width="80" prop="action_parts" />
      <el-table-column align="center" :label="$t('Activities.ActAt')" min-width="40">
        <template slot-scope="scope">
          {{ scope.row.act_at | UTCtoLocalTime }}
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
