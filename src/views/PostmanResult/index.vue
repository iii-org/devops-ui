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
      page: 1,
      limit: 10
    },
    listTotal: 0,
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
    },
    handleClick(target, id) {
      this.$router.push({ path: `/test/postman-result/${target}/${id}` })
    }
  }
}
</script>
<template>
  <div class="app-container">
    <router-view />
    <div v-if="this.$route.meta.rolePage" class="role-Page">
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
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="pagedData"
        border
        fit
        highlight-current-row
      >
        <el-table-column align="center" :label="$t('Postman.Id')" prop="id" width="100" />
        <el-table-column align="center" :label="$t('Postman.Branch')" prop="branch" min-width="120" />
        <el-table-column align="center" label="Commit" width="130">
          <template slot-scope="scope">
            <el-link
              type="primary"
              target="_blank"
              style="font-size: 16px"
              :underline="false"
              :href="scope.row.commit_url"
            >
              {{ scope.row.commit_id }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Postman.Success')" prop="success" min-width="100" />
        <el-table-column align="center" :label="$t('Postman.Fail')" prop="failure" min-width="100" />
        <el-table-column align="center" :label="$t('Postman.StartTime')" width="190">
          <template slot-scope="scope">
            <span>
              {{ scope.row.run_at | UTCtoLocalTime }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Actions')" width="220">
          <template slot-scope="scope">
            <el-button :id="`btn-devops-${scope.$index}`" size="mini" type="primary" plain @click="handleClick('devops', scope.row.id)">
              {{ $t('Postman.DevOps') }}
            </el-button>
            <el-button :id="`btn-postman-${scope.$index}`" size="mini" type="primary" @click="handleClick('postman', scope.row.id)">
              {{ $t('Postman.Postman') }}
            </el-button>
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
  </div>
</template>
<style lang="scss" scoped>
.clearfix {
  clear: both;
}
</style>
