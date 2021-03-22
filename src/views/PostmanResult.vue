<script>
import { mapGetters } from 'vuex'
import { getPostmanResult } from '@/api/postman'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'PostmanResult',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    dialogVisible: false,
    searchKey: 'branch'
  }),
  computed: {
    ...mapGetters(['userRole'])
  },
  methods: {
    async fetchData() {
      return (await getPostmanResult(this.selectedProjectId)).data
    },
    handleClick(target, id) {
      this.$router.push({ name: target, params: { id }})
    }
  }
}
</script>
<template>
  <div class="app-container">
    <router-view />
    <div v-if="this.$route.meta.rolePage" class="role-Page">
      <div class="d-flex justify-space-between">
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
        <el-table-column-time :label="$t('Postman.StartTime')" prop="run_at" />
        <el-table-column align="center" :label="$t('general.Actions')" width="220">
          <template slot-scope="scope">
            <el-button
              :id="`btn-devops-${scope.$index}`"
              size="mini"
              type="primary"
              plain
              @click="handleClick('devops-test-case', scope.row.id)"
            >
              {{ $t('Postman.DevOps') }}
            </el-button>
            <el-button
              :id="`btn-postman-${scope.$index}`"
              size="mini"
              type="primary"
              @click="handleClick('postman-test-case', scope.row.id)"
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
