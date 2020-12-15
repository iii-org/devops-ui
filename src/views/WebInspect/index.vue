<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
// import { } from '@/api/webInpect'
import ProjectListSelector from '../../components/ProjectListSelector'

export default {
  name: 'WebInpect',
  components: { ProjectListSelector, Pagination },

  data() {
    return {
      webInspects: [],

      listLoading: false,
      listQuery: {
        page: 1, // 目前第幾頁
        limit: 10 // 一頁幾筆
      },
      listTotal: 0, // 總筆數
      confirmLoading: false,
      searchData: ''
    }
  },

  computed: {
    ...mapGetters(['projectSelectedId', 'userRole']),

    pagedData() {
      const listData = this.webInspects.filter(data => {
        if (this.searchData === '' || data.scan_id.toString().includes(this.searchData.toString())) {
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
    }
  },

  created() {
  },

  methods: {
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
        placeholder="搜尋 欄位名稱1"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>

    <el-divider />

    <el-table v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row :data="pagedData">
      <el-table-column align="center" label="欄位名稱1" prop="" />
      <el-table-column align="center" label="欄位名稱2" prop="" />
      <el-table-column align="center" label="欄位名稱3" prop="" />
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
}
</style>
