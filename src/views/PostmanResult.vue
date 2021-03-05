<script>
import { mapGetters } from 'vuex'
import { getPostmanResult } from '@/api/postman'
import ProjectListSelector from '@/components/ProjectListSelector'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'PostmanResult',
  components: { ProjectListSelector },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    dialogVisible: false,
    searchKey: 'branch'
  }),
  computed: {
    ...mapGetters(['projectSelectedId', 'userRole'])
  },
  methods: {
    async fetchData() {
      try {
        this.listLoading = true
        this.listData = (await getPostmanResult(this.projectSelectedId)).data
      } catch (e) {
        console.log(e)
      } finally {
        this.listLoading = false
      }
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
        height="100%"
        row-class-name="el-table-row"
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
            <el-button :id="`btn-devops-${scope.$index}`" size="mini" type="primary" plain
                       @click="handleClick('devops', scope.row.id)"
            >
              {{ $t('Postman.DevOps') }}
            </el-button>
            <el-button :id="`btn-postman-${scope.$index}`" size="mini" type="primary"
                       @click="handleClick('postman', scope.row.id)"
            >
              {{ $t('Postman.Postman') }}
            </el-button>
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
  </div>
</template>
<style lang="scss" scoped>
.clearfix {
  clear: both;
}
</style>
