<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { getPostmanResult } from '@/api/postman'
import ProjectListSelector from '@/components/ProjectListSelector'

export default {
  name: 'PostmanResult',
  components: { ProjectListSelector, Pagination },
  data: () => ({
    resultList: [],
    dialogVisible: false,
    listLoading: true,
    listQuery: {
      page: 1, // 目前第幾頁
      limit: 10 // 一頁幾筆
    },
    listTotal: 0, // 總筆數
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId', 'userRole']),
    pagedData() {
      const listData = this.resultList.filter(data => {
        if (this.searchData === '' || data.branch.toLowerCase().includes(this.searchData.toLowerCase())) {
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
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        this.listLoading = true
        const response = await getPostmanResult(this.projectSelectedId)
        this.resultList = response.data
      } catch (e) {
        console.log(e)
      } finally {
        this.listLoading = false
      }
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
        :placeholder="$t('Postman.SearchBranch')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" element-loading-text="Loading" :data="pagedData" border fit highlight-current-row>
      <el-table-column align="center" :label="$t('Postman.Id')" prop="id" width="80" />
      <el-table-column align="center" :label="$t('Postman.Branch')" min-width="60" prop="branch" />
      <el-table-column align="center" label="Commit" prop="commit_id" show-overflow-tooltip min-width="130" />
      <el-table-column align="center" :label="$t('Postman.Success')" prop="success" min-width="40" />
      <el-table-column align="center" :label="$t('Postman.Fail')" prop="failure" min-width="30" />
      <el-table-column align="center" :label="$t('Postman.StartTime')" prop="run_at" width="240" />
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
<style lang="scss" scoped>
.clearfix {
  clear: both;
  .newBtn {
    float: right;
    padding-right: 6px;
  }
}
</style>
