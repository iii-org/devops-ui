<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit height="100%">
      <el-table-column :label="'功能'" align="center" prop="function" min-width="100" />
      <el-table-column :label="'軟體名稱'" align="center" prop="softwareName" min-width="100" />
      <el-table-column :label="'狀態'" align="center" prop="state" width="100" />
      <el-table-column :label="'作用分支'" align="center" prop="activeBranches" min-width="200">
        <template slot-scope="scope">
          <el-select v-model="scope.row.activeBranches" size="small" style="width: 100%" multiple>
            <el-option v-for="item in scope.row.activeBranches" :key="item" :label="item" :value="item" />
          </el-select>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'ProjectSettings',
  mixins: [MixinElTableWithAProject],
  data: () => ({
    btnLoading: false
  }),
  methods: {
    async fetchData() {
      return [
        {
          function: 'Code Review',
          softwareName: 'CheckMarx',
          state: 'Active',
          activeBranches: ['master', 'checkmarx']
        },
        {
          function: 'Code Review',
          softwareName: 'SonarQube',
          state: 'Active',
          activeBranches: ['master', 'sonarqube']
        },
        {
          function: 'Code Review',
          softwareName: 'Fortify Static Code Analyzer',
          state: 'Active',
          activeBranches: ['master']
        },
        { function: 'Code Review', softwareName: 'WebInspect', state: 'Active', activeBranches: ['develop'] },
        { function: 'Test', softwareName: 'postman', state: 'Active', activeBranches: [] },
        { function: 'Test', softwareName: 'TagUI', state: 'Active', activeBranches: [] }
      ]
    }
  }
}
</script>
